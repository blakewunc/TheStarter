import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface TeeTime {
  id: string
  trip_id: string
  /** YYYY-MM-DD calendar day at the course. No timezone. */
  date: string
  /** HH:MM:SS wall clock at the course, or null. */
  time: string | null
  end_time: string | null
  title: string
  description: string | null
  location: string | null
  item_type: string
  /** Null when the organizer typed a course that isn't in the courses table. */
  course_id: string | null
  course_name: string | null
  address: string | null
  lat: number | null
  lng: number | null
  timezone: string | null
  num_players: number | null
  players: string[] | null
  par: number | null
  booking_confirmation: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export function useGolfTeeTimes(tripId: string) {
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTeeTimes() {
      try {
        const response = await fetch(`/api/trips/${tripId}/golf/tee-times`)
        if (!response.ok) {
          throw new Error('Failed to fetch tee times')
        }
        const data = await response.json()
        setTeeTimes(data.teeTimes || [])
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTeeTimes()

    // itinerary_items is in the supabase_realtime publication, so unlike the old
    // golf_tee_times subscription this one actually fires.
    const channel = supabase
      .channel(`tee_times_${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'itinerary_items',
          filter: `trip_id=eq.${tripId}`,
        },
        async () => {
          fetchTeeTimes()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [tripId, supabase])

  return { teeTimes, loading, error }
}
