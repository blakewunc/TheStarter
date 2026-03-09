import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/golf/scores - Get all scores for a trip
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a trip member
    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch scores with user profiles and tee time details (including par)
    const { data: scores, error } = await supabase
      .from('golf_scores')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          email
        ),
        golf_tee_times:tee_time_id (
          id,
          course_name,
          tee_time,
          par,
          trip_id
        )
      `)
      .eq('golf_tee_times.trip_id', tripId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data
    const transformedScores = scores?.map((score: any) => ({
      user_id: score.user_id,
      user_name: score.profiles?.display_name || score.profiles?.email || 'Unknown',
      score: score.score,
      handicap: score.handicap,
      tee_time_id: score.tee_time_id,
      course_name: score.golf_tee_times?.course_name || 'Unknown Course',
      par: score.golf_tee_times?.par || 72,
    }))

    return NextResponse.json({ scores: transformedScores })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/trips/[tripId]/golf/scores - Upsert scores for a tee time
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a trip member
    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { tee_time_id, scores } = body as {
      tee_time_id: string
      scores: { user_id: string; score: number }[]
    }

    if (!tee_time_id || !scores || !Array.isArray(scores)) {
      return NextResponse.json({ error: 'tee_time_id and scores array required' }, { status: 400 })
    }

    // Verify tee time belongs to this trip
    const { data: teeTime } = await supabase
      .from('golf_tee_times')
      .select('id')
      .eq('id', tee_time_id)
      .eq('trip_id', tripId)
      .single()

    if (!teeTime) {
      return NextResponse.json({ error: 'Tee time not found' }, { status: 404 })
    }

    // Upsert scores
    const upsertData = scores
      .filter(s => s.score != null && s.score > 0)
      .map(s => ({
        tee_time_id,
        user_id: s.user_id,
        score: s.score,
      }))

    if (upsertData.length === 0) {
      return NextResponse.json({ error: 'No valid scores provided' }, { status: 400 })
    }

    const { data: upserted, error } = await supabase
      .from('golf_scores')
      .upsert(upsertData, { onConflict: 'tee_time_id,user_id' })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ scores: upserted }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
