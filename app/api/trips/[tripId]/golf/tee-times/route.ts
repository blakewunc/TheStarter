import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Tee times live in itinerary_items with item_type = 'tee_time' (migration 020).
// These are the columns every tee-time consumer needs.
const TEE_TIME_FIELDS =
  'id, trip_id, date, time, end_time, title, description, location, item_type, ' +
  'course_id, course_name, address, lat, lng, timezone, num_players, players, par, ' +
  'booking_confirmation, created_by, created_at, updated_at'

async function requireMembership(supabase: any, tripId: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: membership } = await supabase
    .from('trip_members')
    .select('id')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user }
}

// GET /api/trips/[tripId]/golf/tee-times - all tee times for a trip
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    const { error: authFailure } = await requireMembership(supabase, tripId)
    if (authFailure) return authFailure

    const { data: teeTimes, error } = await supabase
      .from('itinerary_items')
      .select(TEE_TIME_FIELDS)
      .eq('trip_id', tripId)
      .eq('item_type', 'tee_time')
      .order('date', { ascending: true })
      .order('time', { ascending: true, nullsFirst: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ teeTimes })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/trips/[tripId]/golf/tee-times - create a tee time
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    const { user, error: authFailure } = await requireMembership(supabase, tripId)
    if (authFailure) return authFailure

    const body = await request.json()
    const {
      course_id,
      course_name,
      address,
      lat,
      lng,
      timezone,
      date,
      time,
      num_players,
      par,
      notes,
      booking_confirmation,
    } = body

    if (!course_name || !date) {
      return NextResponse.json(
        { error: 'Course name and date are required' },
        { status: 400 }
      )
    }

    const { data: teeTime, error } = await supabase
      .from('itinerary_items')
      .insert({
        trip_id: tripId,
        item_type: 'tee_time',
        // title carries the course name so untyped itinerary views still read correctly.
        title: course_name,
        date,
        time: time || null,
        // course_id is null for a free-text entry; that is a supported outcome, not an error.
        course_id: course_id || null,
        course_name,
        address: address || null,
        location: address || null,
        lat: lat ?? null,
        lng: lng ?? null,
        timezone: timezone || null,
        num_players: num_players || 4,
        par: par || 72,
        description: notes || null,
        booking_confirmation: booking_confirmation || null,
        created_by: user.id,
      })
      .select(TEE_TIME_FIELDS)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ teeTime }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
