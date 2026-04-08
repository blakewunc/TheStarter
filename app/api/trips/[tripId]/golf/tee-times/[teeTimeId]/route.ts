import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH /api/trips/[tripId]/golf/tee-times/[teeTimeId]
// Update players[] on a tee time (e.g. from GroupMaker)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; teeTimeId: string }> }
) {
  try {
    const { tripId, teeTimeId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    const { players } = body

    if (!Array.isArray(players)) {
      return NextResponse.json({ error: 'players must be an array' }, { status: 400 })
    }

    const { data: teeTime, error } = await supabase
      .from('golf_tee_times')
      .update({ players })
      .eq('id', teeTimeId)
      .eq('trip_id', tripId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ teeTime })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/trips/[tripId]/golf/tee-times/[teeTimeId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; teeTimeId: string }> }
) {
  try {
    const { tripId, teeTimeId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only organizer or creator can delete
    const { data: membership } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: teeTime } = await supabase
      .from('golf_tee_times')
      .select('created_by')
      .eq('id', teeTimeId)
      .single()

    if (!teeTime) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (membership.role !== 'organizer' && teeTime.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('golf_tee_times')
      .delete()
      .eq('id', teeTimeId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
