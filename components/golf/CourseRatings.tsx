'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface CourseRatingsProps {
  tripId: string
}

interface TripRating {
  id: string
  course_name: string
  course_location: string | null
  rating: number
  review: string | null
  user_id: string
  user_name: string
}

interface TopCourse {
  course_name: string
  course_location: string | null
  average_rating: number
  total_ratings: number
}

export function CourseRatings({ tripId }: CourseRatingsProps) {
  const [tripRatings, setTripRatings] = useState<TripRating[]>([])
  const [topCourses, setTopCourses] = useState<TopCourse[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [courses, setCourses] = useState<{ name: string; location: string | null }[]>([])
  const [loading, setLoading] = useState(true)

  // Form state per course
  const [ratingInputs, setRatingInputs] = useState<Record<string, { rating: number; review: string }>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)

  // Fetch tee times to get courses played, trip ratings, and top courses
  useEffect(() => {
    async function fetchData() {
      try {
        const [teeTimesRes, tripRatingsRes, topRes] = await Promise.all([
          fetch(`/api/trips/${tripId}/golf/tee-times`),
          fetch(`/api/trips/${tripId}/golf/ratings`),
          fetch('/api/golf/ratings'),
        ])

        if (teeTimesRes.ok) {
          const ttData = await teeTimesRes.json()
          // Get unique courses from tee times
          const courseMap = new Map<string, string | null>()
          for (const tt of ttData.teeTimes || []) {
            if (!courseMap.has(tt.course_name)) {
              courseMap.set(tt.course_name, tt.course_location)
            }
          }
          setCourses(Array.from(courseMap.entries()).map(([name, location]) => ({ name, location })))
        }

        if (tripRatingsRes.ok) {
          const rData = await tripRatingsRes.json()
          setTripRatings(rData.ratings || [])
          setCurrentUserId(rData.currentUserId || null)

          // Pre-fill existing ratings
          const existing: Record<string, { rating: number; review: string }> = {}
          for (const r of rData.ratings || []) {
            if (r.user_id === rData.currentUserId) {
              existing[r.course_name] = { rating: r.rating, review: r.review || '' }
            }
          }
          setRatingInputs(existing)
        }

        if (topRes.ok) {
          const tData = await topRes.json()
          setTopCourses(tData.courses || [])
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tripId])

  const handleRate = async (courseName: string, courseLocation: string | null) => {
    const input = ratingInputs[courseName]
    if (!input || !input.rating) {
      toast.error('Select a rating')
      return
    }

    setSubmitting(courseName)
    try {
      const response = await fetch(`/api/trips/${tripId}/golf/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_name: courseName,
          course_location: courseLocation,
          rating: input.rating,
          review: input.review || null,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to submit rating')
      }

      toast.success('Rating saved!')

      // Refresh ratings
      const refreshRes = await fetch(`/api/trips/${tripId}/golf/ratings`)
      if (refreshRes.ok) {
        const rData = await refreshRes.json()
        setTripRatings(rData.ratings || [])
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(null)
    }
  }

  const renderStars = (courseName: string, interactive: boolean) => {
    const current = ratingInputs[courseName]?.rating || 0

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => {
              if (!interactive) return
              setRatingInputs((prev) => ({
                ...prev,
                [courseName]: { ...prev[courseName], rating: star, review: prev[courseName]?.review || '' },
              }))
            }}
            className={`text-lg ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
              star <= current ? 'text-[#B8956A]' : 'text-[#DAD2BC]'
            }`}
          >
            &#9733;
          </button>
        ))}
      </div>
    )
  }

  const renderAvgStars = (avg: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${star <= Math.round(avg) ? 'text-[#B8956A]' : 'text-[#DAD2BC]'}`}
          >
            &#9733;
          </span>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rate Courses Played on This Trip */}
      {courses.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#A99985]">
            Rate Courses
          </h3>
          <div className="space-y-3">
            {courses.map((course) => {
              const myRating = tripRatings.find(
                (r) => r.course_name === course.name && r.user_id === currentUserId
              )

              return (
                <div
                  key={course.name}
                  className="rounded-[5px] border border-[#DAD2BC] bg-white p-3 space-y-2"
                >
                  <div>
                    <p className="text-sm font-medium text-[#252323]">{course.name}</p>
                    {course.location && (
                      <p className="text-xs text-[#A99985]">{course.location}</p>
                    )}
                  </div>

                  {renderStars(course.name, true)}

                  <Textarea
                    placeholder="Quick review (optional)..."
                    value={ratingInputs[course.name]?.review || ''}
                    onChange={(e) =>
                      setRatingInputs((prev) => ({
                        ...prev,
                        [course.name]: {
                          ...prev[course.name],
                          rating: prev[course.name]?.rating || 0,
                          review: e.target.value,
                        },
                      }))
                    }
                    className="text-sm"
                    rows={2}
                  />

                  <Button
                    size="sm"
                    onClick={() => handleRate(course.name, course.location)}
                    disabled={submitting === course.name || !ratingInputs[course.name]?.rating}
                    className="w-full"
                  >
                    {submitting === course.name
                      ? 'Saving...'
                      : myRating
                        ? 'Update Rating'
                        : 'Submit Rating'}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top Rated Courses (Global) */}
      {topCourses.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#A99985]">
            Top Rated Courses
          </h3>
          <div className="space-y-2">
            {topCourses.slice(0, 5).map((course, i) => (
              <div
                key={course.course_name}
                className="flex items-center justify-between rounded-[5px] bg-[#F5F1ED] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#A99985]">#{i + 1}</span>
                    <p className="truncate text-sm font-medium text-[#252323]">{course.course_name}</p>
                  </div>
                  {course.course_location && (
                    <p className="ml-6 text-xs text-[#A99985]">{course.course_location}</p>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  {renderAvgStars(course.average_rating)}
                  <span className="text-[10px] text-[#A99985]">
                    {course.average_rating} ({course.total_ratings})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {courses.length === 0 && topCourses.length === 0 && (
        <div className="py-6 text-center">
          <p className="text-sm text-[#A99985]">No courses to rate yet</p>
          <p className="mt-1 text-xs text-[#A99985]">
            Schedule tee times to rate courses
          </p>
        </div>
      )}
    </div>
  )
}
