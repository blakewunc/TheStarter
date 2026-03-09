import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/golf/ratings - Get ratings for courses on this trip
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify trip membership
    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get ratings for this trip
    const { data: ratings, error } = await supabase
      .from('golf_course_ratings')
      .select(`
        *,
        profiles:user_id (display_name, email)
      `)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ratings: ratings?.map((r: any) => ({
        id: r.id,
        course_name: r.course_name,
        course_location: r.course_location,
        rating: r.rating,
        review: r.review,
        user_id: r.user_id,
        user_name: r.profiles?.display_name || r.profiles?.email || 'Anonymous',
        created_at: r.created_at,
      })),
      currentUserId: user.id,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/trips/[tripId]/golf/ratings - Submit or update a course rating
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify trip membership
    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { course_name, course_location, rating, review } = body

    if (!course_name || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'course_name and rating (1-5) required' }, { status: 400 })
    }

    // Upsert rating (one per user per course per trip)
    const { data: upserted, error } = await supabase
      .from('golf_course_ratings')
      .upsert(
        {
          trip_id: tripId,
          user_id: user.id,
          course_name,
          course_location: course_location || null,
          rating,
          review: review || null,
        },
        { onConflict: 'trip_id,user_id,course_name' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rating: upserted }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
