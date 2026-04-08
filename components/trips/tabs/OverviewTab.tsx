'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { BudgetSnapshotCard } from '@/components/trips/overview/BudgetSnapshotCard'
import { TripMembersCard } from '@/components/trips/overview/TripMembersCard'
import { AnnouncementsCard } from '@/components/trips/overview/AnnouncementsCard'
import { PuttingCountdown } from '@/components/trips/PuttingCountdown'
import { useBudget } from '@/lib/hooks/useBudget'
import { useItinerary } from '@/lib/hooks/useItinerary'

interface OverviewTabProps {
  tripId: string
  trip: any
  currentUserId: string | null
  isOrganizer: boolean
  onSwitchTab: (tab: string) => void
}

export function OverviewTab({ tripId, trip, currentUserId, isOrganizer, onSwitchTab }: OverviewTabProps) {
  const [proposalEnabled, setProposalEnabled] = useState(trip.proposal_enabled || false)
  const [togglingProposal, setTogglingProposal] = useState(false)
  const [availabilityCount, setAvailabilityCount] = useState(0)

  const { categories } = useBudget(tripId)
  const { items: itineraryItems } = useItinerary(tripId)

  const members = trip.trip_members || []
  const memberCount = members.length

  const currentMember = members.find(
    (member: any) => member.profiles.id === currentUserId
  )

  // Fetch availability count
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const response = await fetch(`/api/trips/${tripId}/availability`)
        if (response.ok) {
          const data = await response.json()
          const uniqueUsers = new Set((data.availability || []).map((a: any) => a.user_id))
          setAvailabilityCount(uniqueUsers.size)
        }
      } catch {
        // Silently fail
      }
    }
    fetchAvailability()
  }, [tripId])

  const handleToggleProposal = async () => {
    setTogglingProposal(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/proposal`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_enabled: !proposalEnabled }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to toggle proposal')
      setProposalEnabled(!proposalEnabled)
      toast.success(proposalEnabled ? 'Proposal page disabled' : 'Proposal page enabled!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setTogglingProposal(false)
    }
  }

  const copyProposalLink = () => {
    const link = `${window.location.origin}/proposal/${trip.invite_code}`
    navigator.clipboard.writeText(link)
    toast.success('Proposal link copied!')
  }

  // Compute stats
  const respondedCount = members.filter((m: any) => m.rsvp_status === 'accepted' || m.rsvp_status === 'declined' || m.rsvp_status === 'maybe').length
  const budgetTotal = categories.reduce((sum: number, c: any) => sum + (c.estimated_cost || 0), 0)
  const guestCount = trip.expected_guests || memberCount || 1
  const perPerson = budgetTotal / guestCount
  const currentBudgetCap = currentMember?.budget_cap || null

  // Get upcoming activities (next 3 from today)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const upcomingItems = itineraryItems
    .filter((item: any) => {
      const [y, m, d] = item.date.split('-').map(Number)
      return new Date(y, m - 1, d) >= now
    })
    .sort((a: any, b: any) => {
      const cmp = a.date.localeCompare(b.date)
      if (cmp !== 0) return cmp
      return (a.time || '').localeCompare(b.time || '')
    })
    .slice(0, 3)

  // Progress stats
  const rsvpDone = respondedCount === memberCount && memberCount > 0
  const budgetDone = categories.length >= 1
  const activitiesDone = itineraryItems.length >= 1
  const progressParts = [rsvpDone, budgetDone, activitiesDone, availabilityCount > 0]
  const progressPercent = Math.round((progressParts.filter(Boolean).length / progressParts.length) * 100)

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  return (
    <div className="space-y-6">
      {/* Progress Line */}
      <div className="flex items-center gap-3 rounded-[8px] border border-[#DAD2BC] bg-white px-5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F5F1ED]">
          <div
            className="h-full rounded-full bg-[#4A7C59] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-[#4A7C59]">{progressPercent}%</span>
        <span className="hidden text-xs text-[#A99985] sm:inline">
          {respondedCount}/{memberCount} responded
          {categories.length > 0 && ` · ${categories.length} budget categories`}
          {itineraryItems.length > 0 && ` · ${itineraryItems.length} activities`}
        </span>
      </div>

      {/* 2-Column Dashboard */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* What's Next */}
          <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#252323]">What's Next</h3>
              {itineraryItems.length > 0 && (
                <button
                  onClick={() => onSwitchTab('itinerary')}
                  className="text-sm font-medium text-[#70798C] transition-colors hover:text-[#252323]"
                >
                  View All
                </button>
              )}
            </div>

            {upcomingItems.length === 0 ? (
              <div className="py-6 text-center">
                <p className="mb-3 text-sm text-[#A99985]">
                  {itineraryItems.length === 0
                    ? 'No activities planned yet'
                    : 'All activities are in the past'}
                </p>
                <button
                  onClick={() => onSwitchTab('itinerary')}
                  className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#DAD2BC] px-4 py-2 text-sm font-medium text-[#252323] transition-colors hover:bg-[#F5F1ED]"
                >
                  {itineraryItems.length === 0 ? 'Add your first activity' : 'View Itinerary'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingItems.map((item: any, i: number) => (
                  <div key={item.id} className="flex items-start gap-3">
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center">
                      <div className={`h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-[#4A7C59]' : 'bg-[#DAD2BC]'}`} />
                      {i < upcomingItems.length - 1 && (
                        <div className="mt-1 h-8 w-px bg-[#DAD2BC]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pb-2">
                      <p className="text-sm font-medium text-[#252323]">{item.title}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-[#A99985]">
                        <span>{formatDate(item.date)}</span>
                        {item.time && <span>{formatTime(item.time)}</span>}
                        {item.location && <span>{item.location}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements */}
          <AnnouncementsCard tripId={tripId} isOrganizer={isOrganizer} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Sport Module Card — golf/ski trips only */}
          {trip.trip_type === 'golf' && (
            <div className="overflow-hidden rounded-[8px] border border-[#DAD2BC] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="bg-[#252323] px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#A99985]">Golf Planner</p>
                <p className="mt-0.5 text-lg font-bold text-white">Tee Times & Scorecards</p>
              </div>
              <div className="px-6 py-4">
                <p className="mb-4 text-sm text-[#A99985]">
                  Schedule rounds, track scores, coordinate equipment, and rank the leaderboard.
                </p>
                <button
                  onClick={() => onSwitchTab('golf')}
                  className="w-full rounded-[5px] bg-[#252323] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a3838]"
                >
                  Open Golf Planner &#x26F3;
                </button>
              </div>
            </div>
          )}

          {trip.trip_type === 'ski' && (
            <div className="overflow-hidden rounded-[8px] border border-[#DAD2BC] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="bg-[#252323] px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#A99985]">Ski Planner</p>
                <p className="mt-0.5 text-lg font-bold text-white">Tickets & Rentals</p>
              </div>
              <div className="px-6 py-4">
                <p className="mb-4 text-sm text-[#A99985]">
                  Coordinate lift tickets, track ability levels, and organize equipment rentals.
                </p>
                <button
                  onClick={() => onSwitchTab('ski')}
                  className="w-full rounded-[5px] bg-[#252323] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a3838]"
                >
                  Open Ski Planner &#x26F7;&#xFE0F;
                </button>
              </div>
            </div>
          )}

          {/* Budget at a Glance */}
          <BudgetSnapshotCard
            totalEstimated={budgetTotal}
            perPerson={perPerson}
            budgetCap={currentBudgetCap}
            onViewBudget={() => onSwitchTab('budget')}
            onAddCategory={() => onSwitchTab('budget')}
          />

          {/* Members */}
          <TripMembersCard
            members={members}
            inviteCode={trip.invite_code}
            tripId={tripId}
            tripTitle={trip.title}
            isOrganizer={isOrganizer}
          />

          {/* Organizer Tools */}
          {isOrganizer && (
            <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h3 className="mb-4 text-lg font-semibold text-[#252323]">Organizer Tools</h3>

              {/* Trip Proposal Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#252323]">Trip Proposal</p>
                  <p className="text-xs text-[#A99985]">Share a proposal page with friends</p>
                </div>
                <div className="flex items-center gap-3">
                  {proposalEnabled && (
                    <button
                      onClick={copyProposalLink}
                      className="text-xs font-medium text-[#70798C] transition-colors hover:text-[#252323]"
                    >
                      Copy Link
                    </button>
                  )}
                  <button
                    onClick={handleToggleProposal}
                    disabled={togglingProposal}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      proposalEnabled ? 'bg-[#4A7C59]' : 'bg-[#DAD2BC]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        proposalEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Availability */}
              <div className="mt-4 border-t border-[#F5F1ED] pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#252323]">Availability</p>
                    <p className="text-xs text-[#A99985]">
                      {availabilityCount > 0
                        ? `${availabilityCount} of ${memberCount} submitted`
                        : 'No submissions yet'}
                    </p>
                  </div>
                  <button
                    onClick={() => onSwitchTab('availability')}
                    className="text-xs font-medium text-[#70798C] transition-colors hover:text-[#252323]"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Putting Countdown — only when trip has a start date */}
      {trip.start_date && (
        <PuttingCountdown
          tripStart={trip.start_date}
          tripLabel={[
            trip.start_date && trip.end_date
              ? `${new Date(trip.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(trip.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : '',
            trip.destination,
          ].filter(Boolean).join(' · ')}
        />
      )}
    </div>
  )
}
