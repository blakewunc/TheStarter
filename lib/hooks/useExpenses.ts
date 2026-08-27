import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchErrorMessage } from '@/lib/hooks/fetchError'

interface Profile {
  id: string
  email: string
  display_name: string | null
}

interface ExpenseSplit {
  id: string
  user_id: string
  amount: number
  profiles: Profile
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: string | null
  date: string
  paid_by: string
  created_at: string
  profiles: Profile
  expense_splits: ExpenseSplit[]
}

export function useExpenses(tripId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial expenses data
    async function fetchExpenses() {
      try {
        const response = await fetch(`/api/trips/${tripId}/expenses`)
        if (!response.ok) {
          throw new Error(await fetchErrorMessage(response, 'Failed to fetch expenses'))
        }
        const data = await response.json()
        setExpenses(data.expenses)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()

    // Set up real-time subscription for shared_expenses
    const expensesChannel = supabase
      .channel(`trip_${tripId}_expenses`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_expenses',
          filter: `trip_id=eq.${tripId}`,
        },
        async () => {
          // Refetch expenses when they change
          fetchExpenses()
        }
      )
      .subscribe()

    // Set up real-time subscription for expense_splits
    const splitsChannel = supabase
      .channel(`trip_${tripId}_expense_splits`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expense_splits',
        },
        async () => {
          // Refetch expenses when splits change
          fetchExpenses()
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      expensesChannel.unsubscribe()
      splitsChannel.unsubscribe()
    }
  }, [tripId, supabase])

  return { expenses, loading, error, refetch: () => setLoading(true) }
}
