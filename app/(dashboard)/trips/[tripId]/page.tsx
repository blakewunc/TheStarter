'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TripDetailHeader } from '@/components/trips/TripDetailHeader'
import { PeopleBar } from '@/components/trips/PeopleBar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { OverviewTab } from '@/components/trips/tabs/OverviewTab'
import { BudgetTab } from '@/components/trips/tabs/BudgetTab'
import { ItineraryTab } from '@/components/trips/tabs/ItineraryTab'
import { ExpensesTab } from '@/components/trips/tabs/ExpensesTab'
import { SuppliesTab } from '@/components/trips/tabs/SuppliesTab'
import { AccommodationTab } from '@/components/trips/tabs/AccommodationTab'
import { GolfTab } from '@/components/trips/tabs/GolfTab'
import { SkiTab } from '@/components/trips/tabs/SkiTab'
import { AvailabilityTab } from '@/components/trips/tabs/AvailabilityTab'
import { AIAssistantPanel } from '@/components/trips/AIAssistantPanel'
import { createClient } from '@/lib/supabase/client'
import { useTrip } from '@/lib/hooks/useTrip'
import { Suspense } from 'react'
import {
  LayoutGrid,
  DollarSign,
  Calendar,
  Receipt,
  Package,
  BedDouble,
  Users,
} from 'lucide-react'

const BASE_TABS = ['overview', 'budget', 'itinerary', 'expenses', 'supplies', 'accommodation', 'availability'] as const

function TripDetailContent({ tripId }: { tripId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { trip, loading, error } = useTrip(tripId)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)

  const validTabs: string[] = trip?.trip_type === 'golf' || trip?.trip_type === 'ski'
    ? [...BASE_TABS, trip!.trip_type as string]
    : [...BASE_TABS]

  const tabParam = searchParams.get('tab')
  const activeTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'overview'

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
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[#A99985]">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            {error || 'Trip not found'}
          </div>
          <Button onClick={() => router.push('/trips')} className="mt-4">
            Back to Trips
          </Button>
        </div>
      </div>
    )
  }

  const isOrganizer = !!(currentUserId && trip.trip_members?.some(
    (member: any) => member.profiles.id === currentUserId && member.role === 'organizer'
  ))

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        {/* Compact Header */}
        <div className="mb-3">
          <TripDetailHeader
            trip={trip}
            isOrganizer={isOrganizer}
            onOpenAI={() => setAiPanelOpen(true)}
          />
        </div>

        {/* People & RSVP Bar */}
        <div className="mb-6">
          <PeopleBar
            tripId={tripId}
            members={trip.trip_members || []}
            currentUserId={currentUserId}
            inviteCode={trip.invite_code}
          />
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="sticky top-0 z-20 mb-6 bg-white rounded-[8px] px-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <TabsTrigger value="overview">
              <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="budget">
              <DollarSign className="mr-1.5 h-3.5 w-3.5" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="itinerary">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="expenses">
              <Receipt className="mr-1.5 h-3.5 w-3.5" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="supplies">
              <Package className="mr-1.5 h-3.5 w-3.5" />
              Supplies
            </TabsTrigger>
            <TabsTrigger value="accommodation">
              <BedDouble className="mr-1.5 h-3.5 w-3.5" />
              Accommodation
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Availability
            </TabsTrigger>
            {/* Golf/Ski tabs are accessed via the Overview sport card, not the tab bar */}
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

          <TabsContent value="budget">
            <BudgetTab
              tripId={tripId}
              trip={trip}
              currentUserId={currentUserId}
              isOrganizer={isOrganizer}
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

          <TabsContent value="expenses">
            <ExpensesTab
              tripId={tripId}
              trip={trip}
              currentUserId={currentUserId}
              isOrganizer={isOrganizer}
            />
          </TabsContent>

          <TabsContent value="supplies">
            <SuppliesTab
              tripId={tripId}
              trip={trip}
              currentUserId={currentUserId}
              isOrganizer={isOrganizer}
            />
          </TabsContent>

          <TabsContent value="accommodation">
            <AccommodationTab
              tripId={tripId}
              trip={trip}
              currentUserId={currentUserId}
              isOrganizer={isOrganizer}
            />
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityTab
              tripId={tripId}
              trip={trip}
              currentUserId={currentUserId}
              isOrganizer={isOrganizer}
            />
          </TabsContent>

          {trip.trip_type === 'golf' && (
            <TabsContent value="golf">
              <GolfTab
                tripId={tripId}
                trip={trip}
                currentUserId={currentUserId}
                isOrganizer={isOrganizer}
              />
            </TabsContent>
          )}

          {trip.trip_type === 'ski' && (
            <TabsContent value="ski">
              <SkiTab
                tripId={tripId}
                trip={trip}
                currentUserId={currentUserId}
                isOrganizer={isOrganizer}
              />
            </TabsContent>
          )}
        </Tabs>
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
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[#A99985]">Loading trip...</p>
        </div>
      </div>
    }>
      <TripDetailContent tripId={tripId} />
    </Suspense>
  )
}
