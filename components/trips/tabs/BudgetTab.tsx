'use client'

import { PuttingCountdown } from '@/components/trips/PuttingCountdown'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBudget } from '@/lib/hooks/useBudget'
import { AddCategoryDialog } from '@/components/budget/AddCategoryDialog'
import { CategoryList } from '@/components/budget/CategoryList'
import { BudgetCaps } from '@/components/budget/BudgetCaps'

interface BudgetTabProps {
  tripId: string
  trip: any
  currentUserId: string | null
  isOrganizer: boolean
}

export function BudgetTab({ tripId, trip, currentUserId, isOrganizer }: BudgetTabProps) {
  const { categories, loading, error, refetch } = useBudget(tripId)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const memberCount = trip.trip_members?.length || 0

  if (loading) {
    return <p className="text-[#A99985]">Loading budget...</p>
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
          <h2 className="text-2xl font-bold tracking-tight text-[#252323]">Budget</h2>
          <p className="text-[#A99985]">Plan and track expenses for {trip.title}</p>
        </div>
        {isOrganizer && (
          <Button onClick={() => setAddDialogOpen(true)}>Add Category</Button>
        )}
      </div>

      {/* Budget Categories */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
          <CardDescription>
            {memberCount} {memberCount === 1 ? 'person' : 'people'} on this trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryList
            categories={categories}
            tripId={tripId}
            memberCount={memberCount}
            isOrganizer={isOrganizer}
            onRefresh={refetch}
          />
        </CardContent>
      </Card>

      {/* Personal Budget Caps */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Caps</CardTitle>
          <CardDescription>
            Personal spending limits for trip members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetCaps
            tripId={tripId}
            members={trip.trip_members || []}
            currentUserId={currentUserId}
            isOrganizer={isOrganizer}
          />
        </CardContent>
      </Card>

      <AddCategoryDialog
        tripId={tripId}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={refetch}
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
