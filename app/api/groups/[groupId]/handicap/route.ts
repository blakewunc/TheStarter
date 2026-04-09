import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH /api/groups/[groupId]/handicap — update a member's handicap
// Body: { userId: string, handicap: number | null }
// Permission: own handicap, or group creator can edit any
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId, handicap } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Verify caller is a group member
    const { data: membership } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()
    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Only allow editing own handicap unless caller is group creator
    if (userId !== user.id) {
      const { data: group } = await supabase
        .from('groups')
        .select('created_by')
        .eq('id', groupId)
        .single()
      if (group?.created_by !== user.id) {
        return NextResponse.json({ error: 'Only the group organizer can edit other members\' handicaps' }, { status: 403 })
      }
    }

    const hcpValue = handicap === null || handicap === '' ? null : Number(handicap)

    const { error } = await supabase
      .from('profiles')
      .update({ handicap: hcpValue })
      .eq('id', userId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, handicap: hcpValue })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
