'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LiftTicketCoordination } from '@/components/ski/LiftTicketCoordination'
import { AbilityLevelTracker } from '@/components/ski/AbilityLevelTracker'
import { EquipmentRentals } from '@/components/ski/EquipmentRentals'

export default function SkiPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1C1A17]">
              ⛷️ Ski Module
            </h1>
            <p className="text-[#6B6460]">Manage lift tickets, abilities, and rentals</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            ← Back to Trip
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Lift Tickets */}
            <Card>
              <CardHeader>
                <CardTitle>Lift Tickets</CardTitle>
                <CardDescription>Coordinate ticket purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <LiftTicketCoordination tripId={tripId} />
              </CardContent>
            </Card>

            {/* Equipment Rentals */}
            <Card>
              <CardHeader>
                <CardTitle>Equipment Rentals</CardTitle>
                <CardDescription>Track rental needs and sizing</CardDescription>
              </CardHeader>
              <CardContent>
                <EquipmentRentals tripId={tripId} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Ability Levels */}
            <Card>
              <CardHeader>
                <CardTitle>Ability Levels</CardTitle>
                <CardDescription>Group members by skill level</CardDescription>
              </CardHeader>
              <CardContent>
                <AbilityLevelTracker tripId={tripId} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
