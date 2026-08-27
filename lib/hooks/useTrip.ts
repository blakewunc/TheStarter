import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchErrorMessage } from '@/lib/hooks/fetchError'

interface Profile {
  id: string
  email: string
  display_name: string | null
}

interface TripMember {
  id: string
  role: string
  rsvp_status: string
  budget_cap: number | null
  created_at: string
  profiles: Profile
}

interface Trip {
  id: string
  title: string
  destination: string
  trip_type: 'golf' | 'ski' | 'bachelor_party' | 'bachelorette_party' | 'general'
  start_date: string
  end_date: string
  description: string | null
  budget_total: number | null
  status: string
  invite_code: string
  proposal_enabled: boolean
  created_at: string
  trip_members: TripMember[]
}

export function useTrip(tripId: string) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial trip data
    async function fetchTrip() {
      try {
        const response = await fetch(`/api/trips/${tripId}`)
        if (!response.ok) {
          throw new Error(await fetchErrorMessage(response, 'Failed to fetch trip'))
        }
        const data = await response.json()
        setTrip(data.trip)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTrip()

    // Set up real-time subscription for trip_members
    const channel = supabase
      .channel(`trip_${tripId}_members`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_members',
          filter: `trip_id=eq.${tripId}`,
        },
        async () => {
          // Refetch trip data when members change
          fetchTrip()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe()
    }
  }, [tripId, supabase])

  return { trip, loading, error, refetch: () => setLoading(true) }
}
