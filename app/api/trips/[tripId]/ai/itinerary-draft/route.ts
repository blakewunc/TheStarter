import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { MODELS } from '@/lib/ai/models'
import { callModel, isOverCap, parseJsonLoose } from '@/lib/ai/call'

/**
 * POST /api/trips/[tripId]/ai/itinerary-draft
 *
 * A.3: a bounded action on the surface where the work already is — the empty
 * itinerary. Not a chat box: the input is the trip the user already created, so
 * there is nothing to type and nothing to invent a request for.
 *
 * Returns suggestions for review. Nothing is written; the organiser picks what to keep.
 */

const DAILY_CAP = 10
const MAX_OUTPUT_TOKENS = 1400

const draftedItemSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  title: z.string().min(1).max(100),
  item_type: z.enum(['tee_time', 'lodging', 'meal', 'travel', 'other']),
  location: z.string().max(160).nullable(),
  description: z.string().max(300).nullable(),
})

const responseSchema = z.object({
  items: z.array(draftedItemSchema).max(30),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()
    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: trip } = await supabase
      .from('trips')
      .select('title, destination, start_date, end_date, expected_guests, rounds_planned, target_courses, description')
      .eq('id', tripId)
      .single()
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

    if (!trip.start_date || !trip.end_date) {
      return NextResponse.json(
        { error: 'Add trip dates first, then I can draft the days.' },
        { status: 400 }
      )
    }

    if (await isOverCap(tripId, user.id, 'itinerary_draft', DAILY_CAP)) {
      return NextResponse.json(
        { error: "That's this trip's drafting for today — add activities manually below." },
        { status: 429 }
      )
    }

    const system = `You draft a golf trip itinerary and return JSON. Nothing else.

Return ONLY: {"items": [...]} where each item has:
  date         string  YYYY-MM-DD, within the trip dates
  time         string | null  HH:MM 24-hour, local to the venue
  title        string  short, e.g. "Round at Pinehurst No. 2"
  item_type    string  one of: tee_time, lodging, meal, travel, other
  location     string | null
  description  string | null  one short line

Rules:
- Stay inside the trip's start and end dates.
- Include arrival and departure travel, a round on each golf day, and dinners.
- Only name a course if the trip already names it. Do not invent specific courses,
  restaurants, or businesses — use a generic title like "Dinner as a group" instead.
- Morning tee times, realistic gaps. No more than 5 items per day.
- No prose, no markdown, no code fences. JSON only.`

    const prompt = [
      `Trip: ${trip.title}`,
      trip.destination ? `Destination: ${trip.destination}` : null,
      `Dates: ${trip.start_date} to ${trip.end_date}`,
      trip.expected_guests ? `Players: ${trip.expected_guests}` : null,
      trip.rounds_planned ? `Rounds planned: ${trip.rounds_planned}` : null,
      trip.target_courses?.length ? `Courses they want: ${trip.target_courses.join(', ')}` : null,
      trip.description ? `Notes: ${trip.description}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    const result = await callModel({
      model: MODELS.draft,
      system,
      prompt,
      maxTokens: MAX_OUTPUT_TOKENS,
      action: 'itinerary_draft',
      userId: user.id,
      tripId,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status ?? 500 })
    }

    const parsed = parseJsonLoose(result.text ?? '')
    const validated = responseSchema.safeParse(parsed)
    if (!validated.success) {
      return NextResponse.json(
        { error: "Couldn't draft that one — add activities manually below." },
        { status: 422 }
      )
    }

    // Anything outside the trip window is dropped rather than shown. A suggestion on
    // the wrong day is worse than one fewer suggestion.
    const items = validated.data.items.filter(
      (i) => i.date >= trip.start_date && i.date <= trip.end_date
    )

    return NextResponse.json({ items })
  } catch (error: any) {
    return NextResponse.json({ error: 'That did not work — try again in a moment.' }, { status: 500 })
  }
}
