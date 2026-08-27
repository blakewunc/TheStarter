import { createClient } from '@/lib/supabase/server'
import { createTripSchema } from '@/lib/validations/trip'
import { NextResponse } from 'next/server'
import { generateInviteCode } from '@/lib/utils/invite-code'

// GET /api/trips - List all trips for the authenticated user
export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch trips where user is a member
    const { data: trips, error } = await supabase
      .from('trips')
      .select(
        `
        *,
        trip_members!inner(role, rsvp_status)
      `
      )
      .eq('trip_members.user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching trips:', error)
      return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
    }

    return NextResponse.json({ trips })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/trips - Create a new trip
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = createTripSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const {
      title, destination, start_date, end_date, description, budget_total,
      expected_guests, trip_type, rounds_planned, target_courses, default_format, stakes,
    } = validation.data

    // Generate invite code
    const invite_code = generateInviteCode()

    // Create trip
    const { data: trip, error } = await supabase
      .from('trips')
      .insert({
        title,
        destination,
        start_date,
        end_date,
        description,
        budget_total,
        expected_guests,
        trip_type: trip_type || 'golf',
        rounds_planned: rounds_planned ?? null,
        target_courses: target_courses ?? [],
        default_format: default_format ?? null,
        stakes: stakes ?? null,
        created_by: user.id,
        invite_code,
        status: 'planning',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating trip:', error)
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
    }

    // The trigger function will automatically create the trip_member record
    // with role='organizer' and rsvp_status='accepted'

    return NextResponse.json({ trip }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
