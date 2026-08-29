import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { scoreDifferential, starterIndex } from '@/lib/golf/scoring'

/**
 * Rounds. D.1 — the atomic unit of the club.
 *
 * RLS decides visibility: your own rounds always, plus rounds of anyone you have been on
 * a trip with. The handlers do not re-implement that.
 */

const ROUND_FIELDS = `
  id, user_id, course_id, course_name, tee_id, played_on, gross_score, verified, trip_id, notes,
  tee:course_tees ( id, tee_set, course_rating, slope, par ),
  player:profiles!rounds_user_id_fkey ( id, display_name, email )
`

const roundSchema = z.object({
  course_name: z.string().min(1).max(120),
  course_id: z.string().uuid().nullish(),
  tee_id: z.string().uuid().nullish(),
  played_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gross_score: z.number().int().min(18).max(200),
  notes: z.string().max(500).nullish(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit') ?? 50), 200)
    // Defaults to the caller's own rounds, which is what every current surface wants.
    // ?scope=all returns everything RLS lets them see — companions' rounds — for the
    // ticker and standings later.
    const scope = searchParams.get('scope')
    const explicitUser = searchParams.get('user_id')

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const targetUser = explicitUser ?? (scope === 'all' ? null : user.id)

    let query = supabase
      .from('rounds')
      .select(ROUND_FIELDS)
      .order('played_on', { ascending: false })
      .limit(limit)

    if (targetUser) query = query.eq('user_id', targetUser)

    const { data: rounds, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Differentials computed here rather than stored, so correcting a course's rating
    // fixes every round played on it instead of leaving stale numbers behind.
    const withDiff = (rounds || []).map((r: any) => {
      const tee = Array.isArray(r.tee) ? r.tee[0] : r.tee
      const differential =
        tee && r.gross_score != null ? scoreDifferential(r.gross_score, tee) : null
      return { ...r, tee, differential }
    })

    // Only meaningful for one player's history — an index across mixed players is
    // not a number that means anything.
    const index = targetUser
      ? starterIndex(
          withDiff.map((r) => r.differential).filter((d): d is number => d !== null)
        )
      : null

    return NextResponse.json({ rounds: withDiff, starter_index: index })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = roundSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Check that round' },
        { status: 400 }
      )
    }

    const { data: round, error } = await supabase
      .from('rounds')
      .insert({
        user_id: user.id,
        course_name: parsed.data.course_name.trim(),
        course_id: parsed.data.course_id ?? null,
        tee_id: parsed.data.tee_id ?? null,
        played_on: parsed.data.played_on,
        gross_score: parsed.data.gross_score,
        notes: parsed.data.notes ?? null,
        // Solo posts are unverified by construction. D.4 weights these less than rounds
        // attached to a trip, because people lie about their golf.
        verified: false,
      })
      .select(ROUND_FIELDS)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const tee = Array.isArray((round as any).tee) ? (round as any).tee[0] : (round as any).tee
    return NextResponse.json(
      {
        round: {
          ...round,
          tee,
          differential:
            tee && round.gross_score != null ? scoreDifferential(round.gross_score, tee) : null,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
