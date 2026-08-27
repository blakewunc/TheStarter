import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { MODELS } from '@/lib/ai/models'
import { callModel, isOverCap } from '@/lib/ai/call'
import { parseLocalDate } from '@/lib/dates'

/**
 * POST /api/trips/[tripId]/ai/group-text
 *
 * A.3: two or three sentences to paste into the group chat.
 *
 * One of the two places B.2 allows prose rather than JSON — the output *is* the text,
 * so a schema would only wrap it. The token ceiling is deliberately small: this is a
 * message, and a long one defeats its own purpose.
 *
 * This sits on the invite screen because that is the growth loop. Every invitee's
 * first impression of the product is a link someone pasted into a group chat.
 */

const DAILY_CAP = 10
const MAX_OUTPUT_TOKENS = 220

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
      .select('title, destination, start_date, end_date, expected_guests, rounds_planned, invite_code')
      .eq('id', tripId)
      .single()
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

    if (await isOverCap(tripId, user.id, 'group_text', DAILY_CAP)) {
      return NextResponse.json(
        { error: "That's this trip's drafting for today — write it yourself and send." },
        { status: 429 }
      )
    }

    const fmt = (d: string | null) =>
      d ? parseLocalDate(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null

    const system = `You write the message an organiser pastes into their group chat to get
friends to commit to a golf trip.

Rules:
- Two or three sentences. Shorter is better.
- Sound like a friend texting friends, not like marketing. No exclamation marks,
  no "Hey team", no emoji.
- Lead with what it is, where, and when. Mention cost only if given.
- End by asking them to tap the link and RSVP. Do NOT write the link yourself —
  it gets appended after your text.
- Never invent details that were not provided.
- Return the message only. No preamble, no quotes, no options to choose from.`

    const prompt = [
      `Trip: ${trip.title}`,
      trip.destination ? `Where: ${trip.destination}` : null,
      fmt(trip.start_date) ? `When: ${fmt(trip.start_date)}–${fmt(trip.end_date) ?? ''}` : null,
      trip.expected_guests ? `Spots: ${trip.expected_guests}` : null,
      trip.rounds_planned ? `Rounds: ${trip.rounds_planned}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    const result = await callModel({
      model: MODELS.draft,
      system,
      prompt,
      maxTokens: MAX_OUTPUT_TOKENS,
      action: 'group_text',
      userId: user.id,
      tripId,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status ?? 500 })
    }

    const message = (result.text ?? '').trim()
    if (!message) {
      return NextResponse.json(
        { error: "Couldn't draft that — write it yourself and send." },
        { status: 422 }
      )
    }

    return NextResponse.json({ message })
  } catch (error: any) {
    return NextResponse.json({ error: 'That did not work — try again in a moment.' }, { status: 500 })
  }
}
