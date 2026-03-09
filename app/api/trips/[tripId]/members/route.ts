import { createClient, createServiceClient } from '@/lib/supabase/server'
import { addMemberSchema } from '@/lib/validations/members'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/members - List members + pending invites
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params

    // Verify user is a trip member
    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a trip member' }, { status: 403 })
    }

    // Fetch members
    const { data: members, error: membersError } = await supabase
      .from('trip_members')
      .select('id, role, rsvp_status, budget_cap, joined_at, profiles(id, display_name, email, avatar_url)')
      .eq('trip_id', tripId)
      .order('joined_at', { ascending: true })

    if (membersError) {
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    // Fetch pending invites
    const { data: pendingInvites, error: invitesError } = await supabase
      .from('pending_invites')
      .select('id, email, name, invited_by, created_at')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true })

    if (invitesError) {
      return NextResponse.json({ error: 'Failed to fetch pending invites' }, { status: 500 })
    }

    return NextResponse.json({ members: members || [], pendingInvites: pendingInvites || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/trips/[tripId]/members - Add member by email (organizer only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params

    // Verify user is organizer
    const { data: membership } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'organizer') {
      return NextResponse.json({ error: 'Only organizers can add members' }, { status: 403 })
    }

    const body = await request.json()
    const validation = addMemberSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { email, name } = validation.data

    // Use service client to look up profiles by email — bypasses RLS
    // (authenticated client can only see own profile, not other users')
    const serviceClient = createServiceClient()
    const { data: existingProfile } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingProfile) {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('trip_members')
        .select('id')
        .eq('trip_id', tripId)
        .eq('user_id', existingProfile.id)
        .single()

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a member of this trip' }, { status: 409 })
      }

      // Add as member directly
      const { data: member, error: insertError } = await supabase
        .from('trip_members')
        .insert({
          trip_id: tripId,
          user_id: existingProfile.id,
          role: 'member',
          rsvp_status: 'pending',
        })
        .select('id, role, rsvp_status, budget_cap, joined_at, profiles(id, display_name, email, avatar_url)')
        .single()

      if (insertError) {
        console.error('Error adding member:', insertError)
        return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
      }

      return NextResponse.json({ member, type: 'member' }, { status: 201 })
    } else {
      // Check if already invited
      const { data: existingInvite } = await supabase
        .from('pending_invites')
        .select('id')
        .eq('trip_id', tripId)
        .eq('email', email.toLowerCase())
        .single()

      if (existingInvite) {
        return NextResponse.json({ error: 'An invite is already pending for this email' }, { status: 409 })
      }

      // Create pending invite
      const { data: invite, error: inviteError } = await supabase
        .from('pending_invites')
        .insert({
          trip_id: tripId,
          email: email.toLowerCase(),
          name: name || null,
          invited_by: user.id,
        })
        .select()
        .single()

      if (inviteError) {
        console.error('Error creating invite:', inviteError)
        return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
      }

      return NextResponse.json({ pendingInvite: invite, type: 'pending_invite' }, { status: 201 })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
