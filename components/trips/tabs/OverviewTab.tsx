'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { TripMembersCard } from '@/components/trips/overview/TripMembersCard'
import { AnnouncementsCard } from '@/components/trips/overview/AnnouncementsCard'
import { LodgingCard } from '@/components/trips/overview/LodgingCard'
import { PunchList } from '@/components/trips/overview/PunchList'
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

export function OverviewTab({ tripId, trip, isOrganizer, onSwitchTab }: OverviewTabProps) {
  const [proposalEnabled, setProposalEnabled] = useState(trip.proposal_enabled || false)
  const [togglingProposal, setTogglingProposal] = useState(false)
  const [availabilityCount, setAvailabilityCount] = useState(0)

  // E.5. Duplicating asks for dates rather than shifting last year's by 365 days,
  // which lands on the wrong weekday — and for a golf trip the weekday is the point.
  const [duplicating, setDuplicating] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const handleDuplicate = async () => {
    const start = window.prompt('Start date for the new trip (YYYY-MM-DD)')
    if (!start) return
    const end = window.prompt('End date (YYYY-MM-DD)')
    if (!end) return

    setDuplicating(true)
    try {
      const res = await fetch(`/api/trips/${tripId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: start, end_date: end }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Could not duplicate')
      }
      const { trip: created } = await res.json()
      toast.success('Copied — crew carried over, RSVPs reset')
      window.location.href = `/trips/${created.id}`
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setDuplicating(false)
    }
  }

  const handleArchive = async () => {
    const archiving_now = !trip.archived_at
    if (archiving_now && !confirm('Archive this trip? It stays intact, just off the main list.')) return

    setArchiving(true)
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived_at: archiving_now ? new Date().toISOString() : null }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Could not archive')
      }
      toast.success(archiving_now ? 'Archived' : 'Back on the list')
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setArchiving(false)
    }
  }


  const { categories } = useBudget(tripId)
  const { items: itineraryItems } = useItinerary(tripId)

  const members = trip.trip_members || []
  const memberCount = members.length
  // Must match BudgetTab's basis or the same cost reads differently on two tabs.
  const splitCount = Math.max(trip.expected_guests || memberCount, 1)

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const response = await fetch(`/api/trips/${tripId}/availability`)
        if (response.ok) {
          const data = await response.json()
          const uniqueUsers = new Set((data.availability || []).map((a: any) => a.user_id))
          setAvailabilityCount(uniqueUsers.size)
        }
      } catch { /* silently fail */ }
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

  // Budget stats
  const budgetTotal = categories.reduce((sum: number, c: any) => sum + (c.estimated_cost || 0), 0)
  const guestCount = trip.expected_guests || memberCount || 1
  const perPerson = budgetTotal > 0 ? budgetTotal / guestCount : 0

  // Progress
  const respondedCount = members.filter((m: any) => m.rsvp_status === 'accepted' || m.rsvp_status === 'declined' || m.rsvp_status === 'maybe').length
  // Who still owes an answer, which is a task rather than a ratio.
  const pendingRsvpCount = members.filter(
    (m: any) => !m.rsvp_status || m.rsvp_status === 'pending'
  ).length

  // Upcoming activities (next 3 from today)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const upcomingItems = itineraryItems
    .filter((item: any) => {
      const [y, m, d] = item.date.split('-').map(Number)
      return new Date(y, m - 1, d) >= now
    })
    .sort((a: any, b: any) => {
      const cmp = a.date.localeCompare(b.date)
      return cmp !== 0 ? cmp : (a.time || '').localeCompare(b.time || '')
    })
    .slice(0, 3)

  const formatDate = (dateStr: string) =>
    new Date(...(dateStr.split('-').map(Number) as [number, number, number]).map((n, i) => i === 1 ? n - 1 : n) as [number, number, number]).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  // Shared card style
  const card: React.CSSProperties = {
    background: '#fff',
    border: '0.5px solid #D6CFC8',
    borderRadius: '12px',
    overflow: 'hidden',
  }

  const eyebrow: React.CSSProperties = {
    fontFamily: 'var(--sans)',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#6B6460',
    marginBottom: '10px',
  }

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_280px] lg:items-start">

      {/* LEFT COLUMN */}
      <div className="contents lg:flex lg:flex-col lg:gap-6">

        {/* 1. Countdown card */}
        {trip.start_date && (
          <div className="max-lg:order-4" style={{
            ...card,
            border: '1.5px solid #2C2A26',
            padding: '24px',
          }}>
            <PuttingCountdown
              tripStart={trip.start_date}
              tripLabel={[
                trip.start_date && trip.end_date
                  ? `${new Date(trip.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(trip.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : '',
                trip.destination,
              ].filter(Boolean).join(' · ')}
            />
          </div>
        )}

        {/* 2. What's Next */}
        <div className="max-lg:order-3" style={{ ...card, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={eyebrow}>What&apos;s next</p>
            {itineraryItems.length > 0 && (
              <button
                onClick={() => onSwitchTab('itinerary')}
                style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#3B6D11', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                View full itinerary →
              </button>
            )}
          </div>

          {upcomingItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#6B6460', marginBottom: '12px' }}>
                {itineraryItems.length === 0 ? 'No activities planned yet' : 'All activities are in the past'}
              </p>
              <button
                onClick={() => onSwitchTab('itinerary')}
                style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#2C2A26', background: 'transparent', border: '0.5px solid #D6CFC8', borderRadius: '6px', padding: '7px 14px', cursor: 'pointer' }}
              >
                {itineraryItems.length === 0 ? 'Add your first activity' : 'View itinerary'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingItems.map((item: any, i: number) => {
                const dotColor = item.category === 'golf' ? '#3B6D11' : item.category === 'accommodation' ? '#5A6275' : '#D6CFC8'
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '3px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === 0 ? '#3B6D11' : dotColor, flexShrink: 0 }} />
                      {i < upcomingItems.length - 1 && (
                        <div style={{ width: '1px', height: '28px', background: '#EAE6E1', marginTop: '4px' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: '4px' }}>
                      <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#2C2A26', margin: 0, fontWeight: 500 }}>{item.title}</p>
                      <p style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#6B6460', margin: '2px 0 0' }}>
                        {formatDate(item.date)}{item.time ? ` · ${formatTime(item.time)}` : ''}{item.location ? ` · ${item.location}` : ''}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 3. Golf Planner (golf trips only) */}
        {trip.trip_type === 'golf' && (
          <div className="max-lg:order-7" style={{
            background: '#EAF3DE',
            border: '0.5px solid #C0DD97',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <p style={{ ...eyebrow, color: '#3B6D11' }}>Golf planner</p>
            <h3 style={{
              fontFamily: 'var(--serif)',
              fontSize: '22px',
              fontWeight: 400,
              color: '#27500A',
              margin: '0 0 8px',
            }}>
              Tee times &amp; scorecards
            </h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#3B6D11', margin: '0 0 16px', lineHeight: 1.5 }}>
              Schedule rounds, track scores, coordinate equipment, and see the leaderboard.
            </p>
            <button
              onClick={() => onSwitchTab('golf')}
              style={{
                fontFamily: 'var(--sans)',
                fontSize: '13px',
                fontWeight: 500,
                color: '#EAF3DE',
                background: '#3B6D11',
                border: 'none',
                borderRadius: '6px',
                padding: '9px 18px',
                cursor: 'pointer',
              }}
            >
              Open golf planner ⛳
            </button>
          </div>
        )}

        {/* Ski planner (ski trips only) */}
        {trip.trip_type === 'ski' && (
          <div style={{
            background: '#EAF3DE',
            border: '0.5px solid #C0DD97',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <p style={{ ...eyebrow, color: '#3B6D11' }}>Ski planner</p>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 400, color: '#27500A', margin: '0 0 8px' }}>
              Tickets &amp; rentals
            </h3>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#3B6D11', margin: '0 0 16px', lineHeight: 1.5 }}>
              Coordinate lift tickets, track ability levels, and organize equipment rentals.
            </p>
            <button
              onClick={() => onSwitchTab('ski')}
              style={{ fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 500, color: '#EAF3DE', background: '#3B6D11', border: 'none', borderRadius: '6px', padding: '9px 18px', cursor: 'pointer' }}
            >
              Open ski planner ⛷️
            </button>
          </div>
        )}

        {/* 4. Lodging — where you're staying, door code, and the linked cost */}
        <div className="max-lg:order-8 lg:contents">
          <LodgingCard tripId={tripId} isOrganizer={isOrganizer} splitCount={splitCount} />
        </div>

        {/* 5. Announcements */}
        <div className="max-lg:order-9 lg:contents">
          <AnnouncementsCard tripId={tripId} isOrganizer={isOrganizer} />
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="contents lg:flex lg:flex-col lg:gap-4">

        {/* 1. What's left — replaces the "% planned" bar and the counts beside it.
            Those measured "has at least one of each", so a trip with no lodging, no
            tee times and nobody invited still read 75% planned. */}
        <div className="max-lg:order-1">
          <PunchList
            expectedGuests={trip.expected_guests ?? null}
            memberCount={memberCount}
            pendingRsvpCount={pendingRsvpCount}
            roundsPlanned={trip.rounds_planned ?? null}
            teeTimeCount={trip.tee_time_count ?? 0}
            lodgingCount={trip.lodging_count ?? 0}
            budgetCategoryCount={trip.budget_category_count ?? 0}
            isOrganizer={isOrganizer}
            onGo={onSwitchTab}
          />
        </div>

        {/* 2. Budget snapshot */}
        <div className="max-lg:order-2" style={{ ...card, padding: '20px' }}>
          <p style={eyebrow}>Budget snapshot</p>
          {budgetTotal === 0 ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#6B6460', marginBottom: '10px' }}>No budget yet</p>
              <button
                onClick={() => onSwitchTab('financials')}
                style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#2C2A26', background: 'transparent', border: '0.5px solid #D6CFC8', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}
              >
                Add budget
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div style={{ background: '#F5F1ED', borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: '10px', color: '#6B6460', margin: '0 0 2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total est.</p>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: '#2C2A26', margin: 0 }}>${budgetTotal.toLocaleString()}</p>
                </div>
                <div style={{ background: '#F5F1ED', borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: '10px', color: '#6B6460', margin: '0 0 2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Per person</p>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: '#2C2A26', margin: 0 }}>${Math.round(perPerson).toLocaleString()}</p>
                </div>
              </div>
              <div style={{ borderTop: '0.5px solid #EAE6E1', paddingTop: '10px' }}>
                <button
                  onClick={() => onSwitchTab('financials')}
                  style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#3B6D11', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  View full budget →
                </button>
              </div>
            </>
          )}
        </div>

        {/* 3. Who's going */}
        <div className="max-lg:order-6 lg:contents">
          <TripMembersCard
            members={members}
            inviteCode={trip.invite_code}
            tripId={tripId}
            tripTitle={trip.title}
            isOrganizer={isOrganizer}
          />
        </div>

        {/* 4. Organizer Tools — first on mobile: it is the only block that asks
            the organiser to do something. */}
        {isOrganizer && (
          <div className="max-lg:order-5" style={{ ...card, padding: '20px' }}>
            <p style={eyebrow}>Organizer tools</p>

            {/* Proposal toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#2C2A26', margin: 0, fontWeight: 500 }}>Trip Proposal</p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#6B6460', margin: '2px 0 0' }}>Share a public pitch page</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {proposalEnabled && (
                  <button
                    onClick={copyProposalLink}
                    style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#3B6D11', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Copy link
                  </button>
                )}
                <button
                  onClick={handleToggleProposal}
                  disabled={togglingProposal}
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    width: '36px',
                    height: '20px',
                    borderRadius: '10px',
                    background: proposalEnabled ? '#3B6D11' : '#D6CFC8',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: '3px',
                    left: proposalEnabled ? '18px' : '3px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.2s',
                  }} />
                </button>
              </div>
            </div>

            {/* Availability */}
            <div style={{ borderTop: '0.5px solid #EAE6E1', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#2C2A26', margin: 0, fontWeight: 500 }}>Availability</p>
                <p style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#6B6460', margin: '2px 0 0' }}>
                  {availabilityCount > 0 ? `${availabilityCount} of ${memberCount} submitted` : 'No submissions yet'}
                </p>
              </div>
              <button
                onClick={() => onSwitchTab('availability')}
                style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#3B6D11', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                View
              </button>
            </div>

            {/* E.5 — run it again, and get it off the list when it's done. */}
            <div style={{ borderTop: '0.5px solid #EAE6E1', paddingTop: '12px', marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={handleDuplicate}
                disabled={duplicating}
                style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#1C1A17', background: 'none', border: '0.5px solid #D6CFC8', borderRadius: '5px', padding: '8px 12px', minHeight: '36px', cursor: 'pointer' }}
              >
                {duplicating ? 'Duplicating…' : 'Run it again next year'}
              </button>
              <button
                onClick={handleArchive}
                disabled={archiving}
                style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#6B6460', background: 'none', border: '0.5px solid #D6CFC8', borderRadius: '5px', padding: '8px 12px', minHeight: '36px', cursor: 'pointer' }}
              >
                {archiving ? 'Archiving…' : trip.archived_at ? 'Unarchive' : 'Archive'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
