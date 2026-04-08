import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/groups/[groupId]/competitions — list competitions with match stats
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
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

    const { data: competitions, error } = await supabase
      .from('competitions')
      .select(`
        id, name, format, season_year, status, created_at,
        competition_teams(id, name, color,
          team_members(user_id, profiles(display_name, email))
        ),
        matches(
          id, played_on, course, format, status,
          match_results(winner, points_a, points_b),
          match_sides(side, user_id, team_id)
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ competitions })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/groups/[groupId]/competitions — create competition
export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
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

    const body = await request.json()
    const { name, format, season_year, teams } = body

    if (!name || !format) return NextResponse.json({ error: 'name and format required' }, { status: 400 })

    const { data: competition, error } = await supabase
      .from('competitions')
      .insert({ group_id: groupId, name, format, season_year: season_year || new Date().getFullYear() })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Create teams for Ryder Cup format
    if (format === 'ryder_cup' && teams?.length === 2) {
      const teamInserts = teams.map((t: { name: string; color: string }) => ({
        competition_id: competition.id,
        name: t.name,
        color: t.color || '#70798C',
      }))
      await supabase.from('competition_teams').insert(teamInserts)
    }

    return NextResponse.json({ competition }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
