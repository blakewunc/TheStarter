import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/trips/[tripId]/invite-responses
 *
 * Completes E.8. Accountless RSVPs were being written and never read, so someone could
 * answer the invite and the organiser would have no idea — worse than not offering the
 * option, because the invitee believes they have replied.
 *
 * Responses whose email matches a real member are filtered out here rather than in the
 * UI: once someone has an account on the trip, their membership row is the truth, and
 * showing an unverified duplicate beside it invites double-counting the crew.
 */
export async function GET(
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

    const [{ data: responses, error }, { data: members }] = await Promise.all([
      supabase
        .from('invite_responses')
        .select('id, name, email, rsvp_status, created_at, updated_at')
        .eq('trip_id', tripId)
        .order('updated_at', { ascending: false }),
      supabase
        .from('trip_members')
        .select('profiles(email)')
        .eq('trip_id', tripId),
    ])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const memberEmails = new Set(
      (members || [])
        .map((m: any) => m.profiles?.email?.toLowerCase())
        .filter(Boolean)
    )

    const unclaimed = (responses || []).filter(
      (r) => !r.email || !memberEmails.has(r.email.toLowerCase())
    )

    return NextResponse.json({ responses: unclaimed })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
