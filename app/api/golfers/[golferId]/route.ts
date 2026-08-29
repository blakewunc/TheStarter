import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * A single crew member. RLS scopes to owner_id, so someone else's roster entry is
 * simply not visible to update or delete.
 */

const patchSchema = z.object({
  full_name: z.string().min(1).max(80).optional(),
  email: z.string().email().max(160).nullish(),
  phone: z.string().max(40).nullish(),
  handicap_index: z.number().min(-10).max(54).nullish(),
  home_course: z.string().max(120).nullish(),
  city: z.string().max(80).nullish(),
  pays_via: z.string().max(80).nullish(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().max(2000).nullish(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ golferId: string }> }
) {
  try {
    const { golferId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = patchSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Check those details' },
        { status: 400 }
      )
    }

    const { data: golfer, error } = await supabase
      .from('golfers')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', golferId)
      .select('id, full_name, email, phone, handicap_index, home_course, city, pays_via, preferences, notes, linked_user_id')
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!golfer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ golfer })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ golferId: string }> }
) {
  try {
    const { golferId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // trip_members.golfer_id is ON DELETE SET NULL, so removing someone from the crew
    // list leaves every trip they were on intact — it forgets the address book entry,
    // not the history.
    const { error } = await supabase.from('golfers').delete().eq('id', golferId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
