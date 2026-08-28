import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/invite/[inviteCode]/rsvp — answer without an account.
 *
 * E.8. Seven of the eight people on a trip only ever see the shared link, and today
 * that link dead-ends at /login. Someone should be able to say "I'm in" the way they
 * would on any shared form.
 *
 * What this deliberately does not do: grant access. A response records an answer and
 * nothing else. Membership still comes only from trip_members, so an unverified name
 * can never read the budget, the door code, or anyone's contact details.
 */

const MAX_NAME = 80
const MAX_EMAIL = 160
/** A shared link is public, so cap what one trip can accumulate. */
const MAX_RESPONSES_PER_TRIP = 200

export async function POST(
  request: Request,
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  try {
    const { inviteCode } = await params
    const body = await request.json()

    const name = String(body?.name ?? '').trim()
    const email = String(body?.email ?? '').trim().toLowerCase()
    const rsvp = String(body?.rsvp_status ?? '').trim()

    if (!name) {
      return NextResponse.json({ error: 'Add your name so the organizer knows who you are.' }, { status: 400 })
    }
    if (name.length > MAX_NAME || email.length > MAX_EMAIL) {
      return NextResponse.json({ error: 'That name or email is too long.' }, { status: 400 })
    }
    if (!['accepted', 'declined', 'maybe'].includes(rsvp)) {
      return NextResponse.json({ error: 'Pick going, maybe, or can’t go.' }, { status: 400 })
    }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'That email doesn’t look right.' }, { status: 400 })
    }

    // The invite code is the only credential here, so it is checked server-side with the
    // service role rather than trusted from the client.
    const service = createServiceClient()
    const { data: trip } = await service
      .from('trips')
      .select('id, title')
      .eq('invite_code', inviteCode)
      .single()

    if (!trip) {
      return NextResponse.json({ error: 'That invite link is no longer valid.' }, { status: 404 })
    }

    // If they are already signed in and already a member, their real RSVP is the one
    // that counts — writing an unverified duplicate beside it would be misleading.
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: membership } = await service
        .from('trip_members')
        .select('id')
        .eq('trip_id', trip.id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (membership) {
        await service
          .from('trip_members')
          .update({ rsvp_status: rsvp })
          .eq('id', membership.id)
        return NextResponse.json({ ok: true, verified: true })
      }

      // Signed in but not yet a member: make them one. They have an identity we can
      // trust, so recording an unverified response beside it would be strictly worse —
      // they would answer and still not be on the trip.
      const { error: joinError } = await service.from('trip_members').insert({
        trip_id: trip.id,
        user_id: user.id,
        role: 'member',
        rsvp_status: rsvp,
      })
      if (!joinError) {
        return NextResponse.json({ ok: true, verified: true, joined: true })
      }
      // If that failed, fall through and at least capture the answer.
    }

    const { count } = await service
      .from('invite_responses')
      .select('id', { count: 'exact', head: true })
      .eq('trip_id', trip.id)

    if ((count ?? 0) >= MAX_RESPONSES_PER_TRIP) {
      return NextResponse.json(
        { error: 'This trip has taken all the responses it can. Ask the organizer to add you directly.' },
        { status: 429 }
      )
    }

    // Upsert on (trip_id, lower(email)) so changing your mind updates your answer.
    // Without an email there is nothing to match on, so those insert as new rows.
    const row = {
      trip_id: trip.id,
      name,
      email: email || null,
      rsvp_status: rsvp,
      claimed_by: user?.id ?? null,
      updated_at: new Date().toISOString(),
    }

    const { error } = email
      ? await service.from('invite_responses').upsert(row, { onConflict: 'trip_id,email' })
      : await service.from('invite_responses').insert(row)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, verified: false })
  } catch (error: any) {
    return NextResponse.json({ error: 'Could not save that — try again.' }, { status: 500 })
  }
}
