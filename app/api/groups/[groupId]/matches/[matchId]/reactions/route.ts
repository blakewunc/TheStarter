import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type Params = { params: Promise<{ groupId: string; matchId: string }> }

// POST /api/groups/[groupId]/matches/[matchId]/reactions — toggle an emoji reaction
export async function POST(request: Request, { params }: Params) {
  try {
    const { groupId, matchId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify member of group
    const { data: membership } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()
    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { emoji } = await request.json()
    const validEmojis = ['fire', 'clap', 'skull', 'clown']
    if (!validEmojis.includes(emoji)) return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 })

    // Check if reaction already exists
    const { data: existing } = await supabase
      .from('match_reactions')
      .select('id')
      .eq('match_id', matchId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .single()

    if (existing) {
      // Toggle off
      await supabase.from('match_reactions').delete().eq('id', existing.id)
      return NextResponse.json({ action: 'removed' })
    } else {
      // Toggle on
      await supabase.from('match_reactions').insert({ match_id: matchId, user_id: user.id, emoji })
      return NextResponse.json({ action: 'added' })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET /api/groups/[groupId]/matches/[matchId]/reactions — fetch reactions
export async function GET(_req: Request, { params }: Params) {
  try {
    const { groupId, matchId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: membership } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()
    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: reactions } = await supabase
      .from('match_reactions')
      .select('id, emoji, user_id')
      .eq('match_id', matchId)

    return NextResponse.json({ reactions: reactions || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
