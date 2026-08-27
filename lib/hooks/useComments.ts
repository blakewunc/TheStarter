import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchErrorMessage } from '@/lib/hooks/fetchError'

interface Profile {
  id: string
  email: string
  display_name: string | null
}

export interface Comment {
  id: string
  text: string
  itinerary_item_id: string
  created_at: string
  user_id: string
  profiles: Profile
}

export function useComments(tripId: string, itineraryItemId?: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial comments data
    async function fetchComments() {
      try {
        const url = itineraryItemId
          ? `/api/trips/${tripId}/comments?itinerary_item_id=${itineraryItemId}`
          : `/api/trips/${tripId}/comments`

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(await fetchErrorMessage(response, 'Failed to fetch comments'))
        }
        const data = await response.json()
        setComments(data.comments)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()

    // Set up real-time subscription for comments
    const channel = supabase
      .channel(`trip_${tripId}_comments${itineraryItemId ? `_item_${itineraryItemId}` : ''}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: itineraryItemId
            ? `trip_id=eq.${tripId},itinerary_item_id=eq.${itineraryItemId}`
            : `trip_id=eq.${tripId}`,
        },
        async () => {
          // Refetch comments when they change
          fetchComments()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe()
    }
  }, [tripId, itineraryItemId, supabase])

  return { comments, loading, error, refetch: () => setLoading(true) }
}
