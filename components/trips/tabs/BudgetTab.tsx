'use client'


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
  // Budgets get built before the crew is fully invited, so dividing by the current
  // member count reports the organiser owing the entire cost. expected_guests is the
  // planned headcount and is what OverviewTab already divides by; the two tabs
  // disagreed until this used the same basis.
  const expectedGuests = trip.expected_guests || null
  const splitCount = Math.max(expectedGuests || memberCount, 1)

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
            Splitting {splitCount} {splitCount === 1 ? 'way' : 'ways'}
            {expectedGuests
              ? ` · ${expectedGuests} expected, ${memberCount} joined so far`
              : ` · based on ${memberCount} ${memberCount === 1 ? 'member' : 'members'}`}
            {!expectedGuests && (
              <>
                {' '}
                — set <span className="font-medium">Expected Guests</span> in trip settings
                to split by your planned headcount instead
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryList
            categories={categories}
            tripId={tripId}
            splitCount={splitCount}
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
    </div>
  )
}
