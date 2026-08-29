import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { scoreDifferential, starterIndex } from '@/lib/golf/scoring'

/**
 * What this person has actually done. Workstream C.2.
 *
 * Derived entirely from existing data — no new tables. trip_members.golfer_id (028)
 * gives every trip a thread back to the roster entry, and rounds (029) hang off the
 * linked account when there is one.
 *
 * Every figure here is one the organiser could work out themselves given an afternoon,
 * which is exactly why it is worth surfacing: this is the switching cost, and it is
 * free to compute.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ golferId: string }> }
) {
  try {
    const { golferId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // RLS scopes golfers to owner_id, so a roster entry belonging to someone else is
    // simply not visible here.
    const { data: golfer } = await supabase
      .from('golfers')
      .select('id, full_name, linked_user_id, handicap_index')
      .eq('id', golferId)
      .maybeSingle()

    if (!golfer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: memberships } = await supabase
      .from('trip_members')
      .select('rsvp_status, joined_at, trips ( id, title, destination, start_date, end_date, created_at )')
      .eq('golfer_id', golferId)

    const trips = (memberships || [])
      .map((m: any) => {
        const t = Array.isArray(m.trips) ? m.trips[0] : m.trips
        return t ? { ...t, rsvp_status: m.rsvp_status, joined_at: m.joined_at } : null
      })
      .filter(Boolean)
      .sort((a: any, b: any) => String(b.start_date).localeCompare(String(a.start_date)))

    // How long after a trip appeared did they commit.
    //
    // Named "days to join" rather than "RSVP lag" on purpose: trip_members records
    // joined_at but never when someone answered, so this measures joining, not
    // responding. Calling it RSVP lag would be a more quotable number and a less true
    // one, and this is the sort of stat that gets screenshotted into a group chat.
    const lags = trips
      .map((t: any) =>
        t.joined_at && t.created_at
          ? Math.round(
              (new Date(t.joined_at).getTime() - new Date(t.created_at).getTime()) / 86400000
            )
          : null
      )
      .filter((d): d is number => d !== null && d >= 0)

    const avgDaysToJoin =
      lags.length > 0 ? Math.round(lags.reduce((s, d) => s + d, 0) / lags.length) : null

    // Rounds only exist for someone with an account, and RLS additionally requires a
    // shared trip — so this is empty for a crew member who has never signed in.
    let rounds: any[] = []
    let index: number | null = null
    if (golfer.linked_user_id) {
      const { data } = await supabase
        .from('rounds')
        .select('id, course_name, played_on, gross_score, verified, tee:course_tees ( course_rating, slope, par )')
        .eq('user_id', golfer.linked_user_id)
        .order('played_on', { ascending: false })
        .limit(20)

      rounds = (data || []).map((r: any) => {
        const tee = Array.isArray(r.tee) ? r.tee[0] : r.tee
        return {
          ...r,
          tee,
          differential: tee && r.gross_score != null ? scoreDifferential(r.gross_score, tee) : null,
        }
      })
      index = starterIndex(
        rounds.map((r) => r.differential).filter((d): d is number => d !== null)
      )
    }

    return NextResponse.json({
      golfer,
      trips,
      rounds,
      stats: {
        trip_count: trips.length,
        rounds_logged: rounds.length,
        avg_days_to_join: avgDaysToJoin,
        // The house number from posted rounds, next to whatever they claim. D.4 exists
        // because these two disagree.
        starter_index: index,
        self_reported_handicap: golfer.handicap_index,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
