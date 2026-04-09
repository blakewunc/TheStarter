'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TripDetailHeader } from '@/components/trips/TripDetailHeader'
import { PeopleBar } from '@/components/trips/PeopleBar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { OverviewTab } from '@/components/trips/tabs/OverviewTab'
import { FinancialsTab } from '@/components/trips/tabs/FinancialsTab'
import { ItineraryTab } from '@/components/trips/tabs/ItineraryTab'
import { GolfTab } from '@/components/trips/tabs/GolfTab'
import { SkiTab } from '@/components/trips/tabs/SkiTab'
import { AvailabilityTab } from '@/components/trips/tabs/AvailabilityTab'
import { AIAssistantPanel } from '@/components/trips/AIAssistantPanel'
import { createClient } from '@/lib/supabase/client'
import { useTrip } from '@/lib/hooks/useTrip'
import { Suspense } from 'react'
import { Sparkles } from 'lucide-react'

// Redirect old tab param values to new consolidated tabs
const TAB_ALIASES: Record<string, string> = {
  budget: 'financials',
  expenses: 'financials',
  supplies: 'itinerary',
  accommodation: 'itinerary',
}

const BASE_TABS = ['overview', 'itinerary', 'financials', 'availability'] as const

function TripDetailContent({ tripId }: { tripId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { trip, loading, error } = useTrip(tripId)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [aiHovered, setAiHovered] = useState(false)

  const sportTab = trip?.trip_type === 'golf' ? 'golf' : trip?.trip_type === 'ski' ? 'ski' : null
  const validTabs: string[] = sportTab
    ? [...BASE_TABS, sportTab]
    : [...BASE_TABS]

  const tabParam = searchParams.get('tab')
  // Resolve aliases (budget → financials, supplies → itinerary, etc.)
  const resolvedParam = tabParam ? (TAB_ALIASES[tabParam] ?? tabParam) : null
  const activeTab = resolvedParam && validTabs.includes(resolvedParam) ? resolvedParam : 'overview'

  const handleTabChange = (value: string) => {
    const url = new URL(window.location.href)
    if (value === 'overview') {
      url.searchParams.delete('tab')
    } else {
      url.searchParams.set('tab', value)
    }
    window.history.replaceState({}, '', url.toString())
    router.replace(`/trips/${tripId}${value === 'overview' ? '' : `?tab=${value}`}`, { scroll: false })
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null)
    })
  }, [supabase.auth])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F1ED', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#888780' }}>Loading trip…</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F1ED', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: '#FDE8E8', border: '0.5px solid #F3B8B8', borderRadius: '8px', padding: '16px', color: '#8B4444', fontFamily: 'var(--sans)', fontSize: '13px' }}>
            {error || 'Trip not found'}
          </div>
          <button
            onClick={() => router.push('/trips')}
            style={{ marginTop: '16px', fontFamily: 'var(--sans)', fontSize: '13px', color: '#2C2A26', background: 'transparent', border: '0.5px solid #D6CFC8', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Back to trips
          </button>
        </div>
      </div>
    )
  }

  const isOrganizer = !!(currentUserId && trip.trip_members?.some(
    (member: any) => member.profiles.id === currentUserId && member.role === 'organizer'
  ))

  return (
    <div style={{ minHeight: '100vh', background: '#F5F1ED' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px 80px' }}
           className="px-4 sm:px-6 lg:px-10">

        {/* Header: breadcrumb + title + actions */}
        <TripDetailHeader
          trip={trip}
          isOrganizer={isOrganizer}
        />

        {/* RSVP row — above tab bar with top border separator */}
        <div style={{ marginTop: '20px' }}>
          <PeopleBar
            tripId={tripId}
            members={trip.trip_members || []}
            currentUserId={currentUserId}
            inviteCode={trip.invite_code}
          />
        </div>

        {/* Tabs — sticky, cream background */}
        <div style={{ marginTop: '24px', position: 'sticky', top: '52px', zIndex: 20, background: '#F5F1ED' }}>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              {sportTab === 'golf' && <TabsTrigger value="golf">Golf ⛳</TabsTrigger>}
              {sportTab === 'ski' && <TabsTrigger value="ski">Ski ⛷️</TabsTrigger>}
              {isOrganizer && <TabsTrigger value="availability">Availability</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab
                tripId={tripId}
                trip={trip}
                currentUserId={currentUserId}
                isOrganizer={isOrganizer}
                onSwitchTab={handleTabChange}
              />
            </TabsContent>

            <TabsContent value="itinerary">
              <ItineraryTab
                tripId={tripId}
                trip={trip}
                currentUserId={currentUserId}
                isOrganizer={isOrganizer}
              />
            </TabsContent>

            <TabsContent value="financials">
              <FinancialsTab
                tripId={tripId}
                trip={trip}
                currentUserId={currentUserId}
                isOrganizer={isOrganizer}
              />
            </TabsContent>

            {sportTab === 'golf' && (
              <TabsContent value="golf">
                <GolfTab
                  tripId={tripId}
                  trip={trip}
                  currentUserId={currentUserId}
                  isOrganizer={isOrganizer}
                />
              </TabsContent>
            )}

            {sportTab === 'ski' && (
              <TabsContent value="ski">
                <SkiTab
                  tripId={tripId}
                  trip={trip}
                  currentUserId={currentUserId}
                  isOrganizer={isOrganizer}
                />
              </TabsContent>
            )}

            <TabsContent value="availability">
              <AvailabilityTab
                tripId={tripId}
                trip={trip}
                currentUserId={currentUserId}
                isOrganizer={isOrganizer}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Floating AI Planner button */}
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <button
          onClick={() => setAiPanelOpen(true)}
          onMouseEnter={() => setAiHovered(true)}
          onMouseLeave={() => setAiHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: aiHovered ? '8px' : '0',
            padding: aiHovered ? '0 20px' : '0',
            width: aiHovered ? 'auto' : '44px',
            height: '44px',
            borderRadius: aiHovered ? '22px' : '50%',
            background: '#2C2A26',
            color: '#F5F1ED',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            justifyContent: 'center',
          }}
        >
          <Sparkles size={16} style={{ flexShrink: 0 }} />
          {aiHovered && (
            <span style={{ fontFamily: 'var(--sans)', fontSize: '12px', fontWeight: 500 }}>
              Ask the AI planner
            </span>
          )}
        </button>
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        tripId={tripId}
        tripTitle={trip.title}
        tripDestination={trip.destination}
        tripType={trip.trip_type}
        open={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
      />
    </div>
  )
}

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)

  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F5F1ED', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '13px', color: '#888780' }}>Loading trip…</p>
        </div>
      </div>
    }>
      <TripDetailContent tripId={tripId} />
    </Suspense>
  )
}
