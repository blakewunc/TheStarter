import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/golf/ratings - Get aggregated ratings for courses
// Query params: ?course=CourseName (optional, for specific course)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseName = searchParams.get('course')

    if (courseName) {
      // Get ratings for a specific course
      const { data: ratings, error } = await supabase
        .from('golf_course_ratings')
        .select(`
          *,
          profiles:user_id (display_name, email)
        `)
        .eq('course_name', courseName)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const avgRating = ratings && ratings.length > 0
        ? Math.round((ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length) * 10) / 10
        : 0

      return NextResponse.json({
        course_name: courseName,
        average_rating: avgRating,
        total_ratings: ratings?.length || 0,
        ratings: ratings?.map((r: any) => ({
          rating: r.rating,
          review: r.review,
          user_name: r.profiles?.display_name || r.profiles?.email || 'Anonymous',
          created_at: r.created_at,
        })),
      })
    }

    // Get top-rated courses (aggregated)
    const { data: allRatings, error } = await supabase
      .from('golf_course_ratings')
      .select('course_name, course_location, rating')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Aggregate by course name
    const courseMap = new Map<string, { location: string | null; ratings: number[]; total: number }>()
    for (const r of allRatings || []) {
      const existing = courseMap.get(r.course_name)
      if (existing) {
        existing.ratings.push(r.rating)
        existing.total += r.rating
      } else {
        courseMap.set(r.course_name, {
          location: r.course_location,
          ratings: [r.rating],
          total: r.rating,
        })
      }
    }

    const topCourses = Array.from(courseMap.entries())
      .map(([name, data]) => ({
        course_name: name,
        course_location: data.location,
        average_rating: Math.round((data.total / data.ratings.length) * 10) / 10,
        total_ratings: data.ratings.length,
      }))
      .sort((a, b) => b.average_rating - a.average_rating || b.total_ratings - a.total_ratings)
      .slice(0, 10)

    return NextResponse.json({ courses: topCourses })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
