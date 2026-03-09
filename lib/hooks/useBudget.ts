import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  email: string
  display_name: string | null
}

interface BudgetSplit {
  id: string
  user_id: string
  amount: number
  profiles: Profile
}

export interface BudgetCategory {
  id: string
  name: string
  estimated_cost: number
  split_type: 'equal' | 'custom' | 'none'
  created_at: string
  budget_splits: BudgetSplit[]
}

export function useBudget(tripId: string) {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())

  const fetchBudget = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/trips/${tripId}/budget`)
      if (!response.ok) {
        throw new Error('Failed to fetch budget')
      }
      const data = await response.json()
      setCategories(data.categories)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    fetchBudget()

    const supabase = supabaseRef.current

    // Set up real-time subscription for budget_categories
    const categoriesChannel = supabase
      .channel(`trip_${tripId}_budget_categories`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_categories',
          filter: `trip_id=eq.${tripId}`,
        },
        () => fetchBudget()
      )
      .subscribe()

    // Set up real-time subscription for budget_splits
    const splitsChannel = supabase
      .channel(`trip_${tripId}_budget_splits`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_splits',
        },
        () => fetchBudget()
      )
      .subscribe()

    return () => {
      categoriesChannel.unsubscribe()
      splitsChannel.unsubscribe()
    }
  }, [tripId, fetchBudget])

  return { categories, loading, error, refetch: fetchBudget }
}
