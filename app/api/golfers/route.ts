import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * The signed-in organiser's crew.
 *
 * C.1. RLS scopes every row to owner_id, so these handlers never filter by owner
 * themselves — the policy is the boundary, and duplicating it here would create a second
 * place to get it wrong.
 */

const golferSchema = z.object({
  full_name: z.string().min(1).max(80),
  email: z.string().email().max(160).nullish(),
  phone: z.string().max(40).nullish(),
  handicap_index: z.number().min(-10).max(54).nullish(),
  home_course: z.string().max(120).nullish(),
  city: z.string().max(80).nullish(),
  pays_via: z.string().max(80).nullish(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().max(2000).nullish(),
})

const FIELDS =
  'id, full_name, email, phone, handicap_index, home_course, city, pays_via, preferences, notes, linked_user_id, created_at'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: golfers, error } = await supabase
      .from('golfers')
      .select(FIELDS)
      .order('full_name', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // How many trips each of them has actually been on — the number that makes the
    // roster feel earned rather than typed in. Allowed to fail: a missing count should
    // not cost the organiser their crew list.
    const ids = (golfers || []).map((g) => g.id)
    const trips = new Map<string, number>()
    if (ids.length > 0) {
      const { data: memberships } = await supabase
        .from('trip_members')
        .select('golfer_id')
        .in('golfer_id', ids)
      for (const m of memberships || []) {
        if (m.golfer_id) trips.set(m.golfer_id, (trips.get(m.golfer_id) ?? 0) + 1)
      }
    }

    return NextResponse.json({
      golfers: (golfers || []).map((g) => ({ ...g, trip_count: trips.get(g.id) ?? 0 })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = golferSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Check those details' },
        { status: 400 }
      )
    }

    const { data: golfer, error } = await supabase
      .from('golfers')
      .insert({ ...parsed.data, owner_id: user.id })
      .select(FIELDS)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ golfer: { ...golfer, trip_count: 0 } }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
