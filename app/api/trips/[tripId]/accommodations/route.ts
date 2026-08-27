import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// A property plus the budget category that carries its cost. Cost is never stored on
// accommodations — budget_categories.estimated_cost is the single source of truth, and
// this embed is how the lodging card reads it.
const ACCOMMODATION_FIELDS = `
  id, trip_id, name, address,
  check_in_date, check_in_time, check_out_date, check_out_time,
  door_code, wifi_name, wifi_password, house_rules, notes,
  booking_url, confirmation_number, created_at, updated_at,
  budget:budget_categories!budget_categories_accommodation_id_fkey (
    id, name, estimated_cost, split_type
  )
`

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
    .select('id, role')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user, membership }
}

// GET /api/trips/[tripId]/accommodations
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    const { error: authFailure } = await requireMembership(supabase, tripId)
    if (authFailure) return authFailure

    const { data: accommodations, error } = await supabase
      .from('accommodations')
      .select(ACCOMMODATION_FIELDS)
      .eq('trip_id', tripId)
      .order('check_in_date', { ascending: true, nullsFirst: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ accommodations: accommodations || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/trips/[tripId]/accommodations
// Creating a property with a cost also creates the linked budget category, so entering
// lodging here shows up in the budget without being typed twice.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    const { error: authFailure } = await requireMembership(supabase, tripId)
    if (authFailure) return authFailure

    const body = await request.json()
    const {
      name,
      address,
      check_in_date,
      check_in_time,
      check_out_date,
      check_out_time,
      door_code,
      wifi_name,
      wifi_password,
      house_rules,
      notes,
      booking_url,
      confirmation_number,
      cost,
      split_type,
    } = body

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data: accommodation, error } = await supabase
      .from('accommodations')
      .insert({
        trip_id: tripId,
        name: String(name).trim(),
        address: address || null,
        check_in_date: check_in_date || null,
        check_in_time: check_in_time || null,
        check_out_date: check_out_date || null,
        check_out_time: check_out_time || null,
        door_code: door_code || null,
        wifi_name: wifi_name || null,
        wifi_password: wifi_password || null,
        house_rules: house_rules || null,
        notes: notes || null,
        booking_url: booking_url || null,
        confirmation_number: confirmation_number || null,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const parsedCost = Number(cost)
    if (Number.isFinite(parsedCost) && parsedCost > 0) {
      const { error: budgetError } = await supabase.from('budget_categories').insert({
        trip_id: tripId,
        name: String(name).trim(),
        estimated_cost: parsedCost,
        split_type: split_type || 'equal',
        category_type: 'lodging',
        accommodation_id: accommodation.id,
      })

      // The property saved; a failed budget line should not discard it. Report the
      // partial outcome rather than pretending the whole thing worked.
      if (budgetError) {
        return NextResponse.json(
          {
            accommodation,
            warning: `Property saved, but the budget line failed: ${budgetError.message}`,
          },
          { status: 201 }
        )
      }
    }

    const { data: full } = await supabase
      .from('accommodations')
      .select(ACCOMMODATION_FIELDS)
      .eq('id', accommodation.id)
      .single()

    return NextResponse.json({ accommodation: full }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
