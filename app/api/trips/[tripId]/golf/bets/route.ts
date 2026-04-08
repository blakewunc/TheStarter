import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/golf/bets - Get all bets for a trip
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
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

    const { data: bets, error } = await supabase
      .from('golf_bets')
      .select(`
        *,
        winner:winner_id (id, display_name, email),
        tee_time:tee_time_id (id, course_name, tee_time)
      `)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bets: bets || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/trips/[tripId]/golf/bets - Create a new bet
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
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
    const { bet_type, amount, description, tee_time_id, participants } = body

    if (!bet_type || !amount || !description || !participants) {
      return NextResponse.json({ error: 'bet_type, amount, description, and participants are required' }, { status: 400 })
    }

    if (!Array.isArray(participants) || participants.length < 2) {
      return NextResponse.json({ error: 'At least 2 participants are required' }, { status: 400 })
    }

    const { data: bet, error: insertError } = await supabase
      .from('golf_bets')
      .insert({
        trip_id: tripId,
        bet_type,
        amount: parseFloat(amount),
        description,
        tee_time_id: tee_time_id || null,
        participants,
        created_by: user.id,
      })
      .select(`
        *,
        winner:winner_id (id, display_name, email),
        tee_time:tee_time_id (id, course_name, tee_time)
      `)
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ bet }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
