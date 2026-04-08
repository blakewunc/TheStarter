'use client'

import { TeeTimeList } from '@/components/golf/TeeTimeList'
import { Leaderboard } from '@/components/golf/Leaderboard'
import { EquipmentCoordination } from '@/components/golf/EquipmentCoordination'
import { GroupMaker } from '@/components/golf/GroupMaker'
import { CourseRatings } from '@/components/golf/CourseRatings'
import { GolfBets } from '@/components/golf/GolfBets'
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
      <div className="space-y-8">
        {/* Tee Times */}
        <TeeTimeList tripId={tripId} />

        {/* Golf Bets */}
        <GolfBets tripId={tripId} />

        {/* Scores + Equipment side by side */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <Leaderboard tripId={tripId} />
          </div>
          <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="mb-4 text-lg font-semibold text-[#252323]">Golf Profiles</h3>
            <EquipmentCoordination tripId={tripId} />
          </div>
        </div>

        {/* Group Maker */}
        <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="mb-4 text-lg font-semibold text-[#252323]">Group Maker</h3>
          <GroupMaker tripId={tripId} />
        </div>
      </div>

      {/* Sidebar: Ad on top, Ratings below */}
      <div className="hidden lg:block">
        <div className="sticky top-20 space-y-6">
          <AdSlot position="sidebar" />
          <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CourseRatings tripId={tripId} />
          </div>
        </div>
      </div>

      {/* Mobile: Ratings below main content */}
      <div className="lg:hidden">
        <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <CourseRatings tripId={tripId} />
        </div>
      </div>
    </div>
  )
}
