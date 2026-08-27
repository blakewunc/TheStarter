import { createClient } from '@/lib/supabase/server'
import { updateTripSchema } from '@/lib/validations/trip'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId] - Get trip details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params

    // Fetch trip with members
    const { data: trip, error } = await supabase
      .from('trips')
      .select(
        `
        *,
        trip_members(
          id,
          role,
          rsvp_status,
          budget_cap,
          joined_at,
          profiles(id, display_name, email, avatar_url)
        )
      `
      )
      .eq('id', tripId)
      .single()

    if (error) {
      console.error('Error fetching trip:', error)
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    // A trip with tee times on it is a golf trip whatever trip_type says — see the
    // note on the trip page. Counted separately so a failure here cannot 404 the trip.
    const { count: teeTimeCount } = await supabase
      .from('itinerary_items')
      .select('id', { count: 'exact', head: true })
      .eq('trip_id', tripId)
      .eq('item_type', 'tee_time')

    return NextResponse.json({ trip: { ...trip, tee_time_count: teeTimeCount ?? 0 } })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/trips/[tripId] - Update trip
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params
    const body = await request.json()

    const validation = updateTripSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    // Update trip (RLS policies will ensure user is organizer)
    const { data: trip, error } = await supabase
      .from('trips')
      .update(validation.data)
      .eq('id', tripId)
      .select()
      .single()

    if (error) {
      console.error('Error updating trip:', error)
      return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 })
    }

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/trips/[tripId] - Delete trip
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params

    // Delete trip (RLS policies will ensure user is creator)
    const { error } = await supabase.from('trips').delete().eq('id', tripId)

    if (error) {
      console.error('Error deleting trip:', error)
      return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
