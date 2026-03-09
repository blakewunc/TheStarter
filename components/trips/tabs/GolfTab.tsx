'use client'

import { TeeTimeList } from '@/components/golf/TeeTimeList'
import { Leaderboard } from '@/components/golf/Leaderboard'
import { EquipmentCoordination } from '@/components/golf/EquipmentCoordination'
import { GroupMaker } from '@/components/golf/GroupMaker'
import { CourseRatings } from '@/components/golf/CourseRatings'
import { AdSlot } from '@/components/ads/AdSlot'

interface GolfTabProps {
  tripId: string
  trip: any
  currentUserId: string | null
  isOrganizer: boolean
}

export function GolfTab({ tripId }: GolfTabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Main content */}
      <div className="space-y-6">
        <TeeTimeList tripId={tripId} />
        <div className="grid gap-6 sm:grid-cols-2">
          <Leaderboard tripId={tripId} />
          <EquipmentCoordination tripId={tripId} />
        </div>
        <GroupMaker tripId={tripId} />
      </div>

      {/* Sidebar: Ratings + Ad */}
      <div className="hidden lg:block">
        <div className="sticky top-20 space-y-6">
          <CourseRatings tripId={tripId} />
          <AdSlot position="sidebar" />
        </div>
      </div>

      {/* Mobile: Ratings below main content */}
      <div className="lg:hidden">
        <CourseRatings tripId={tripId} />
      </div>
    </div>
  )
}
