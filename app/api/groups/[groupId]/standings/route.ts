import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { scoreDifferential, starterIndex, countingRounds } from '@/lib/golf/scoring'

/**
 * GET /api/groups/[groupId]/standings?year=2026
 *
 * D.3 phase 1 — standings by net differential. Needs only rating and slope, so it works
 * the day someone enters a tee set, rather than waiting on hole-by-hole data.
 *
 * D.7 — a season, not an infinite leaderboard. Scoped to a calendar year so there is a
 * start, an end, and a reason to care in March.
 *
 * Everything here is deterministic (B.1). No model is involved in deciding who is
 * winning.
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const { searchParams } = new URL(request.url)
    const year = Number(searchParams.get('year')) || new Date().getFullYear()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Membership is the gate: you see a club's standings by being in it.
    const { data: myMembership } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!myMembership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: members } = await supabase
      .from('group_members')
      .select('user_id, profiles ( id, display_name, email )')
      .eq('group_id', groupId)

    const memberIds = (members || []).map((m: any) => m.user_id).filter(Boolean)
    if (memberIds.length === 0) {
      return NextResponse.json({ year, standings: [], unrated_rounds: 0 })
    }

    const seasonStart = `${year}-01-01`
    const seasonEnd = `${year}-12-31`

    const { data: rounds, error } = await supabase
      .from('rounds')
      .select('user_id, gross_score, played_on, tee:course_tees ( course_rating, slope, par )')
      .in('user_id', memberIds)
      .gte('played_on', seasonStart)
      .lte('played_on', seasonEnd)
      .order('played_on', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const byUser = new Map<string, number[]>()
    let unrated = 0

    for (const r of rounds || []) {
      const tee = Array.isArray((r as any).tee) ? (r as any).tee[0] : (r as any).tee
      // A round at a course nobody has rated cannot be compared across courses. It is
      // counted separately and reported, rather than dropped silently — the gap between
      // rounds played and rounds counted is the number that tells a club why someone is
      // missing from the table.
      if (!tee || r.gross_score == null) {
        unrated += 1
        continue
      }
      const list = byUser.get(r.user_id) ?? []
      list.push(scoreDifferential(r.gross_score, tee))
      byUser.set(r.user_id, list)
    }

    const standings = (members || [])
      .map((m: any) => {
        const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
        const diffs = byUser.get(m.user_id) ?? []
        return {
          user_id: m.user_id,
          name: profile?.display_name || profile?.email?.split('@')[0] || 'Unknown',
          rounds_counted: diffs.length,
          // How many of those actually feed the index, per the WHS reduced schedule.
          counting: countingRounds(diffs.length),
          index: starterIndex(diffs),
          best: diffs.length > 0 ? Math.min(...diffs) : null,
        }
      })
      // Anyone without an index sorts to the bottom rather than being hidden: a member
      // who has not posted enough rounds should see they are on the board and one round
      // away from a number, not be absent from their own club.
      .sort((a, b) => {
        if (a.index === null && b.index === null) return b.rounds_counted - a.rounds_counted
        if (a.index === null) return 1
        if (b.index === null) return -1
        return a.index - b.index
      })
      .map((row, i) => ({ ...row, rank: row.index === null ? null : i + 1 }))

    return NextResponse.json({ year, standings, unrated_rounds: unrated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
