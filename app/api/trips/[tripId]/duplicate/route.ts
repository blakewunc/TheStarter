import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateInviteCode } from '@/lib/utils/invite-code'

/**
 * POST /api/trips/[tripId]/duplicate — run it again next year.
 *
 * E.5, and the first concrete step toward the payoff Workstream C describes: creating
 * trip #2 with the same crew should take about ninety seconds rather than starting from
 * an empty form.
 *
 * What carries over is the shape of the trip — destination, headcount, rounds, format,
 * stakes, budget, courses. What does not carry over is anything that actually happened:
 * dates, itinerary, tee times, scores, expenses, RSVPs. Copying those would produce a
 * trip that claims a history it never had, and someone would eventually settle up
 * against last year's numbers.
 *
 * The crew is copied as members with their RSVP reset to pending, because the roster is
 * the thing worth keeping and asking again is the point.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: membership } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'organizer') {
      return NextResponse.json(
        { error: 'Only the organizer can duplicate a trip' },
        { status: 403 }
      )
    }

    const { data: source } = await supabase
      .from('trips')
      .select(
        'title, destination, description, budget_total, expected_guests, trip_type, rounds_planned, target_courses, default_format, stakes'
      )
      .eq('id', tripId)
      .single()

    if (!source) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    const title = String(body?.title ?? '').trim() || `${source.title} (copy)`

    // Dates are deliberately required from the caller rather than guessed. Shifting last
    // year's dates by 365 days lands on the wrong weekday, which for a golf trip is the
    // whole point of the dates.
    const start_date = String(body?.start_date ?? '').trim()
    const end_date = String(body?.end_date ?? '').trim()
    if (!start_date || !end_date) {
      return NextResponse.json({ error: 'Pick the new dates first.' }, { status: 400 })
    }
    if (end_date < start_date) {
      return NextResponse.json({ error: 'End date must be after the start date.' }, { status: 400 })
    }

    const { data: trip, error } = await supabase
      .from('trips')
      .insert({
        title,
        destination: source.destination,
        description: source.description,
        budget_total: source.budget_total,
        expected_guests: source.expected_guests,
        trip_type: source.trip_type || 'golf',
        rounds_planned: source.rounds_planned,
        target_courses: source.target_courses ?? [],
        default_format: source.default_format,
        stakes: source.stakes,
        start_date,
        end_date,
        created_by: user.id,
        invite_code: generateInviteCode(),
        status: 'planning',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Carry the roster, reset the answers.
    const { data: sourceMembers } = await supabase
      .from('trip_members')
      .select('user_id, role')
      .eq('trip_id', tripId)

    if (sourceMembers?.length) {
      await supabase.from('trip_members').insert(
        sourceMembers.map((m) => ({
          trip_id: trip.id,
          user_id: m.user_id,
          // Whoever duplicates it is running this one.
          role: m.user_id === user.id ? 'organizer' : m.role,
          rsvp_status: m.user_id === user.id ? 'accepted' : 'pending',
        }))
      )
    }

    return NextResponse.json({ trip }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
