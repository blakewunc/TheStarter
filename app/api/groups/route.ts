import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/groups — get all groups user belongs to (or created)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)

    const groupIds = memberships?.map((m) => m.group_id) ?? []

    // Also include groups created by user (may not be member of own group)
    const { data: created } = await supabase
      .from('groups')
      .select('id')
      .eq('created_by', user.id)

    const allIds = Array.from(new Set([...groupIds, ...(created?.map((g) => g.id) ?? [])]))

    if (allIds.length === 0) return NextResponse.json({ groups: [] })

    const { data: groups, error } = await supabase
      .from('groups')
      .select(`
        id, name, created_by, created_at,
        group_members(
          user_id,
          profiles(display_name, email)
        ),
        competitions(id, name, format, season_year, status)
      `)
      .in('id', allIds)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ groups })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/groups — create a group
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name } = await request.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const { data: group, error } = await supabase
      .from('groups')
      .insert({ name: name.trim(), created_by: user.id })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Auto-add creator as member
    await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id })

    return NextResponse.json({ group }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
