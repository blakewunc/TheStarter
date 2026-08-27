import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

// PATCH /api/trips/[tripId]/accommodations/[accommodationId]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; accommodationId: string }> }
) {
  try {
    const { tripId, accommodationId } = await params
    const supabase = await createClient()

    const { error: authFailure } = await requireMembership(supabase, tripId)
    if (authFailure) return authFailure

    const body = await request.json()

    // Only these move; cost is handled separately because it lives on the budget category.
    const editable = [
      'name',
      'address',
      'check_in_date',
      'check_in_time',
      'check_out_date',
      'check_out_time',
      'door_code',
      'wifi_name',
      'wifi_password',
      'house_rules',
      'notes',
      'booking_url',
      'confirmation_number',
    ]

    const updates: Record<string, unknown> = {}
    for (const field of editable) {
      if (field in body) updates[field] = body[field] || null
    }
    updates.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('accommodations')
      .update(updates)
      .eq('id', accommodationId)
      .eq('trip_id', tripId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Cost edits from the lodging card write through to the linked budget category —
    // the property row never stores a cost of its own.
    if ('cost' in body) {
      const parsedCost = Number(body.cost)
      const { data: existing } = await supabase
        .from('budget_categories')
        .select('id')
        .eq('accommodation_id', accommodationId)
        .maybeSingle()

      if (Number.isFinite(parsedCost) && parsedCost > 0) {
        if (existing) {
          await supabase
            .from('budget_categories')
            .update({ estimated_cost: parsedCost, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
        } else {
          await supabase.from('budget_categories').insert({
            trip_id: tripId,
            name: (updates.name as string) || 'Lodging',
            estimated_cost: parsedCost,
            split_type: body.split_type || 'equal',
            category_type: 'lodging',
            accommodation_id: accommodationId,
          })
        }
      } else if (existing && (body.cost === null || body.cost === '' || parsedCost === 0)) {
        // Clearing the cost removes the budget line rather than leaving a $0 category
        // sitting in the budget.
        await supabase.from('budget_categories').delete().eq('id', existing.id)
      }
    }

    const { data: full } = await supabase
      .from('accommodations')
      .select(ACCOMMODATION_FIELDS)
      .eq('id', accommodationId)
      .single()

    return NextResponse.json({ accommodation: full })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/trips/[tripId]/accommodations/[accommodationId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; accommodationId: string }> }
) {
  try {
    const { tripId, accommodationId } = await params
    const supabase = await createClient()

    const { membership, error: authFailure } = await requireMembership(supabase, tripId)
    if (authFailure) return authFailure

    if (membership.role !== 'organizer') {
      return NextResponse.json(
        { error: 'Only the organizer can remove a property' },
        { status: 403 }
      )
    }

    // The FK is ON DELETE SET NULL, so any linked budget category survives with its cost
    // intact and simply becomes unlinked. Removing a property should not silently delete
    // money someone entered.
    const { error } = await supabase
      .from('accommodations')
      .delete()
      .eq('id', accommodationId)
      .eq('trip_id', tripId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
