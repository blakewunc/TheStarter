import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * DELETE /api/trips/[tripId]/invite-responses/[responseId]
 *
 * Organiser-only. A public link collects whatever people type into it, so the organiser
 * needs a way to clear a duplicate, a joke entry, or someone who since joined properly.
 *
 * Service role for the write because invite_responses has no client-side delete policy —
 * it is written and removed server-side only.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; responseId: string }> }
) {
  try {
    const { tripId, responseId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: membership } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'organizer') {
      return NextResponse.json(
        { error: 'Only the organizer can remove a response' },
        { status: 403 }
      )
    }

    const service = createServiceClient()
    const { error } = await service
      .from('invite_responses')
      .delete()
      .eq('id', responseId)
      // Scoped to the trip as well as the id, so an organiser of one trip cannot
      // delete a response belonging to another.
      .eq('trip_id', tripId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
