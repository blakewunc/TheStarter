import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Tee sets for a course. D.2 — the hard dependency under everything in Workstream D.
 *
 * Course rating and slope are not openly licensed, so this is crowdsourced: the first
 * person to log a round at a course enters it once, and it is there for everyone
 * afterwards. Roughly twenty seconds of typing off the back of the scorecard, one time.
 *
 * Without this data a cross-course league is noise, and people stop trusting it inside
 * three weeks. It is worth the one-time ask.
 */

const teeSchema = z.object({
  tee_set: z.string().min(1).max(40),
  // Bounds match the CHECK constraints. Catching a typo here gives a useful message
  // instead of a database error, and stops an obviously wrong rating from poisoning
  // every differential calculated at that course.
  course_rating: z.number().min(55).max(85),
  slope: z.number().int().min(55).max(155),
  par: z.number().int().min(27).max(80),
  yardage: z.number().int().min(500).max(9000).nullish(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: tees, error } = await supabase
      .from('course_tees')
      .select('id, tee_set, course_rating, slope, par, yardage')
      .eq('course_id', courseId)
      .order('course_rating', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ tees: tees || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = teeSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Check those numbers' },
        { status: 400 }
      )
    }

    const { data: tee, error } = await supabase
      .from('course_tees')
      .insert({ ...parsed.data, course_id: courseId, entered_by: user.id })
      .select('id, tee_set, course_rating, slope, par, yardage')
      .single()

    if (error) {
      // The unique index on (course_id, lower(tee_set)) means someone got there first,
      // which is the system working rather than a failure worth alarming about.
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Those tees are already on file for this course.' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tee }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
