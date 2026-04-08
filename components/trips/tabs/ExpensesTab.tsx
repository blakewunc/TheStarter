'use client'

import { PuttingCountdown } from '@/components/trips/PuttingCountdown'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { BalanceSheet } from '@/components/expenses/BalanceSheet'
import { useExpenses } from '@/lib/hooks/useExpenses'
import { createClient } from '@/lib/supabase/client'

interface ProfileWithDisplayName {
  id: string
  email: string
  display_name: string | null
}

interface ExpensesTabProps {
  tripId: string
  trip: any
  currentUserId: string | null
  isOrganizer: boolean
}

export function ExpensesTab({ tripId, trip, currentUserId }: ExpensesTabProps) {
  const supabase = createClient()
  const { expenses, loading, error } = useExpenses(tripId)
  const [paymentProfiles, setPaymentProfiles] = useState<Record<string, any>>({})

  // Fetch payment profiles for all members
  useEffect(() => {
    async function fetchPaymentProfiles() {
      if (!trip?.trip_members) return

      const memberIds = trip.trip_members.map((m: any) => m.profiles.id)
      const { data } = await supabase
        .from('profiles')
        .select('id, venmo_handle, zelle_email, cashapp_handle')
        .in('id', memberIds)

      if (data) {
        const profiles = data.reduce((acc: Record<string, any>, profile: any) => {
          acc[profile.id] = {
            venmo_handle: profile.venmo_handle,
            zelle_email: profile.zelle_email,
            cashapp_handle: profile.cashapp_handle,
          }
          return acc
        }, {})
        setPaymentProfiles(profiles)
      }
    }

    fetchPaymentProfiles()
  }, [trip, supabase])

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Delete this expense?')) return

    try {
      const response = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to delete expense')
      }
    } catch (error: any) {
      alert(error.message)
    }
  }

  // Prepare members list
  const members = (trip?.trip_members || []).map((m: any) => {
    const profile = m.profiles as ProfileWithDisplayName
    return {
      id: profile.id,
      name: profile.display_name || profile.email,
      paymentProfile: paymentProfiles[profile.id],
    }
  })

  if (loading || !currentUserId) {
    return <p className="text-[#A99985]">Loading expenses...</p>
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#252323]">Expenses</h2>
          <p className="text-[#A99985]">Track and settle expenses for {trip.title}</p>
        </div>
        <AddExpenseDialog
          tripId={tripId}
          members={members}
          currentUserId={currentUserId}
          onSuccess={() => {}}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-xl font-bold text-[#252323]">All Expenses</h3>
          <ExpenseList
            expenses={expenses}
            currentUserId={currentUserId}
            onDelete={handleDelete}
          />
        </div>

        <div>
          <h3 className="mb-4 text-xl font-bold text-[#252323]">Balances</h3>
          <BalanceSheet
            expenses={expenses}
            members={members}
            currentUserId={currentUserId}
            tripTitle={trip.title}
          />
        </div>
      </div>

      {trip.start_date && (
        <PuttingCountdown
          tripStart={trip.start_date}
          tripLabel={[
            trip.end_date
              ? `${new Date(trip.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(trip.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : new Date(trip.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            trip.destination,
          ].filter(Boolean).join(' · ')}
        />
      )}
    </div>
  )
}
