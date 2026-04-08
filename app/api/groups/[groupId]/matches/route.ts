import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function isMember(supabase: any, groupId: string, userId: string) {
  return supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()
}

// GET /api/groups/[groupId]/matches — list matches with results
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: membership } = await isMember(supabase, groupId, user.id)
    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Fetch competition IDs for this group first (subqueries not supported in Supabase JS)
    const { data: comps } = await supabase
      .from('competitions')
      .select('id')
      .eq('group_id', groupId)

    const compIds = (comps || []).map((c: any) => c.id)
    if (compIds.length === 0) return NextResponse.json({ matches: [] })

    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        id, competition_id, trip_id, played_on, course, format, status, notes, created_by, created_at,
        match_sides(id, side, team_id, user_id, profiles(display_name, email), competition_teams(id, name, color)),
        match_results(id, winner, points_a, points_b, notes)
      `)
      .in('competition_id', compIds)
      .order('played_on', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ matches })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/groups/[groupId]/matches — log a match result
export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: membership } = await isMember(supabase, groupId, user.id)
    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const {
      competition_id,
      played_on,
      course,
      format,
      trip_id,
      notes,
      // Side A participants (user_ids or team_id)
      side_a, // { user_ids?: string[], team_id?: string }
      // Side B participants
      side_b, // { user_ids?: string[], team_id?: string }
      // Result
      winner, // 'a' | 'b' | 'tie'
      points_a,
      points_b,
    } = body

    if (!competition_id || !played_on || !winner) {
      return NextResponse.json({ error: 'competition_id, played_on, and winner are required' }, { status: 400 })
    }

    // Create match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        competition_id,
        trip_id: trip_id || null,
        played_on,
        course: course || null,
        format: format || '1v1',
        status: 'complete',
        notes: notes || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (matchError) return NextResponse.json({ error: matchError.message }, { status: 500 })

    // Create match sides
    const sideInserts: any[] = []

    if (side_a?.user_ids?.length) {
      for (const uid of side_a.user_ids) {
        sideInserts.push({ match_id: match.id, side: 'a', user_id: uid })
      }
    } else if (side_a?.team_id) {
      sideInserts.push({ match_id: match.id, side: 'a', team_id: side_a.team_id })
    }

    if (side_b?.user_ids?.length) {
      for (const uid of side_b.user_ids) {
        sideInserts.push({ match_id: match.id, side: 'b', user_id: uid })
      }
    } else if (side_b?.team_id) {
      sideInserts.push({ match_id: match.id, side: 'b', team_id: side_b.team_id })
    }

    if (sideInserts.length > 0) {
      await supabase.from('match_sides').insert(sideInserts)
    }

    // Create result
    const { data: result, error: resultError } = await supabase
      .from('match_results')
      .insert({
        match_id: match.id,
        winner,
        points_a: points_a ?? (winner === 'a' ? 1 : winner === 'tie' ? 0.5 : 0),
        points_b: points_b ?? (winner === 'b' ? 1 : winner === 'tie' ? 0.5 : 0),
      })
      .select()
      .single()

    if (resultError) return NextResponse.json({ error: resultError.message }, { status: 500 })

    return NextResponse.json({ match, result }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
