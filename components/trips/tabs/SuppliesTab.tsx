'use client'

import { PuttingCountdown } from '@/components/trips/PuttingCountdown'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddSupplyDialog } from '@/components/supplies/AddSupplyDialog'
import { SupplyList } from '@/components/supplies/SupplyList'
import { useSupplies } from '@/lib/hooks/useSupplies'

interface SuppliesTabProps {
  tripId: string
  trip: any
  currentUserId: string | null
  isOrganizer: boolean
}

export function SuppliesTab({ tripId, trip, currentUserId }: SuppliesTabProps) {
  const { supplies, loading, error } = useSupplies(tripId)

  const handleClaim = async (supplyId: string, claim: boolean) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/supplies/${supplyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimed_by: claim ? currentUserId : null,
          status: claim ? 'claimed' : 'needed',
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to claim item')
      }
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleToggleStatus = async (supplyId: string, newStatus: 'needed' | 'claimed' | 'packed') => {
    try {
      const response = await fetch(`/api/trips/${tripId}/supplies/${supplyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to update status')
      }
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleDelete = async (supplyId: string) => {
    if (!confirm('Delete this item?')) return

    try {
      const response = await fetch(`/api/trips/${tripId}/supplies/${supplyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to delete item')
      }
    } catch (error: any) {
      alert(error.message)
    }
  }

  // Calculate stats
  const totalItems = supplies.length
  const claimedItems = supplies.filter(s => s.status === 'claimed' || s.status === 'packed').length
  const packedItems = supplies.filter(s => s.status === 'packed').length
  const totalCost = supplies.reduce((sum, s) => sum + (s.cost || 0), 0)

  if (loading || !currentUserId) {
    return <p className="text-[#A99985]">Loading supplies...</p>
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
          <h2 className="text-2xl font-bold tracking-tight text-[#252323]">Supplies & Packing</h2>
          <p className="text-[#A99985]">Shared packing list for {trip.title}</p>
        </div>
        <AddSupplyDialog tripId={tripId} onSuccess={() => {}} />
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Items</CardDescription>
            <CardTitle className="text-3xl">{totalItems}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Claimed</CardDescription>
            <CardTitle className="text-3xl">{claimedItems}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Packed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{packedItems}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Cost</CardDescription>
            <CardTitle className="text-3xl">${totalCost.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Supply List */}
      <SupplyList
        supplies={supplies}
        currentUserId={currentUserId}
        tripId={tripId}
        onClaim={handleClaim}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />

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
