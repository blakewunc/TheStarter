import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/recap/[inviteCode] - Public trip recap (no auth required)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  try {
    const supabase = createServiceClient()
    const { inviteCode } = await params

    const { data: trip, error } = await supabase
      .from('trips')
      .select(`
        id, title, destination, start_date, end_date, description,
        trip_type, status, invite_code,
        trip_members(id, rsvp_status, profiles(id, display_name, email))
      `)
      .eq('invite_code', inviteCode)
      .single()

    if (error || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    // Fetch itinerary
    const { data: itinerary } = await supabase
      .from('itinerary_items')
      .select('id, title, description, date, time, location')
      .eq('trip_id', trip.id)
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    // Fetch golf scores if golf trip
    let golfScores: any[] = []
    if (trip.trip_type === 'golf') {
      const { data: teeTimes } = await supabase
        .from('golf_tee_times')
        .select('id, course_name, tee_time, par, golf_scores(user_id, score, profiles(display_name, email))')
        .eq('trip_id', trip.id)
        .order('tee_time', { ascending: true })
      golfScores = teeTimes || []
    }

    const members = trip.trip_members || []
    const attendees = members.filter((m: any) => m.rsvp_status === 'accepted')

    return NextResponse.json({
      trip: {
        title: trip.title,
        destination: trip.destination,
        start_date: trip.start_date,
        end_date: trip.end_date,
        description: trip.description,
        trip_type: trip.trip_type,
        status: trip.status,
        invite_code: trip.invite_code,
        attendee_count: attendees.length,
        total_members: members.length,
      },
      itinerary: itinerary || [],
      attendees: attendees.map((m: any) => ({
        id: m.profiles.id,
        display_name: m.profiles.display_name,
        email: m.profiles.email,
      })),
      golfScores,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
