import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH /api/trips/[tripId]/golf/bets/[betId] - Settle a bet
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; betId: string }> }
) {
  try {
    const { tripId, betId } = await params
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

    // Fetch the bet
    const { data: bet, error: betError } = await supabase
      .from('golf_bets')
      .select('*')
      .eq('id', betId)
      .eq('trip_id', tripId)
      .single()

    if (betError || !bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    if (bet.status !== 'open') {
      return NextResponse.json({ error: 'Bet is already settled' }, { status: 400 })
    }

    const body = await request.json()
    const { winner_id } = body

    if (!winner_id) {
      return NextResponse.json({ error: 'winner_id is required' }, { status: 400 })
    }

    // Validate winner is a participant
    if (!bet.participants.includes(winner_id)) {
      return NextResponse.json({ error: 'Winner must be a participant in the bet' }, { status: 400 })
    }

    // Fetch winner profile
    const { data: winnerProfile } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .eq('id', winner_id)
      .single()

    const winnerName = winnerProfile?.display_name || winnerProfile?.email || 'Unknown'

    // Calculate pot: winner collects from each loser
    const losers = bet.participants.filter((p: string) => p !== winner_id)
    const totalAmount = bet.amount * losers.length

    // Create shared_expense (winner "paid" on behalf of everyone, meaning they are owed)
    const today = new Date().toISOString().split('T')[0]
    const { data: expense, error: expenseError } = await supabase
      .from('shared_expenses')
      .insert({
        trip_id: tripId,
        paid_by: winner_id,
        description: `🎲 ${bet.description} — ${winnerName} won`,
        amount: totalAmount,
        category: 'other',
        date: today,
      })
      .select()
      .single()

    if (expenseError) {
      return NextResponse.json({ error: expenseError.message }, { status: 500 })
    }

    // Create expense_splits — each loser owes bet.amount
    const splits = losers.map((userId: string) => ({
      expense_id: expense.id,
      user_id: userId,
      amount: bet.amount,
    }))

    if (splits.length > 0) {
      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(splits)

      if (splitsError) {
        // Rollback expense
        await supabase.from('shared_expenses').delete().eq('id', expense.id)
        return NextResponse.json({ error: splitsError.message }, { status: 500 })
      }
    }

    // Update the bet
    const { data: updatedBet, error: updateError } = await supabase
      .from('golf_bets')
      .update({
        status: 'settled',
        winner_id,
        expense_id: expense.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', betId)
      .select(`
        *,
        winner:winner_id (id, display_name, email),
        tee_time:tee_time_id (id, course_name, tee_time)
      `)
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ bet: updatedBet })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/trips/[tripId]/golf/bets/[betId] - Delete a bet
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; betId: string }> }
) {
  try {
    const { tripId, betId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check membership/role
    const { data: membership } = await supabase
      .from('trip_members')
      .select('id, role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch bet to check ownership
    const { data: bet, error: betError } = await supabase
      .from('golf_bets')
      .select('id, created_by, status')
      .eq('id', betId)
      .eq('trip_id', tripId)
      .single()

    if (betError || !bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    const isCreator = bet.created_by === user.id
    const isOrganizer = membership.role === 'organizer'

    if (!isCreator && !isOrganizer) {
      return NextResponse.json({ error: 'Only the creator or an organizer can delete this bet' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('golf_bets')
      .delete()
      .eq('id', betId)
      .eq('trip_id', tripId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
