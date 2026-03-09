import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { JoinButton } from './JoinButton'

interface ProposalData {
  trip: {
    id: string
    title: string
    destination: string | null
    start_date: string | null
    end_date: string | null
    description: string | null
    budget_total: number | null
    trip_type: string
    status: string
    invite_code: string
    member_count: number
    accepted_count: number
    expected_guests: number | null
  }
  categories: Array<{
    id: string
    name: string
    estimated_cost: number
    split_type: string
  }>
  itinerary: Array<{
    id: string
    title: string
    description: string | null
    date: string
    time: string | null
    location: string | null
  }>
}

async function fetchProposal(inviteCode: string): Promise<ProposalData | null> {
  const supabase = createServiceClient()

  const { data: trip, error } = await supabase
    .from('trips')
    .select(`
      id, title, destination, start_date, end_date, description,
      budget_total, expected_guests, trip_type, status, proposal_enabled,
      invite_code, trip_members(id, rsvp_status)
    `)
    .eq('invite_code', inviteCode)
    .single()

  if (error || !trip || !trip.proposal_enabled) return null

  const [{ data: categories }, { data: itinerary }] = await Promise.all([
    supabase
      .from('budget_categories')
      .select('id, name, estimated_cost, split_type')
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('itinerary_items')
      .select('id, title, description, date, time, location')
      .eq('trip_id', trip.id)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(10),
  ])

  const memberCount = trip.trip_members?.length || 0
  const acceptedCount = trip.trip_members?.filter((m: any) => m.rsvp_status === 'accepted').length || 0

  return {
    trip: {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      description: trip.description,
      budget_total: trip.budget_total,
      trip_type: trip.trip_type,
      status: trip.status,
      invite_code: trip.invite_code,
      member_count: memberCount,
      accepted_count: acceptedCount,
      expected_guests: (trip as any).expected_guests || null,
    },
    categories: categories || [],
    itinerary: itinerary || [],
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return null
  const startStr = formatDate(start)
  if (!end) return startStr
  return `${startStr} – ${formatDate(end)}`
}

export async function generateMetadata(
  { params }: { params: Promise<{ inviteCode: string }> }
): Promise<Metadata> {
  const { inviteCode } = await params
  const data = await fetchProposal(inviteCode)

  if (!data) {
    return { title: 'Trip Proposal' }
  }

  const { trip, categories } = data
  const totalBudget = categories.reduce((sum, cat) => sum + (cat.estimated_cost || 0), 0)
  const guestCount = trip.expected_guests || trip.member_count || 1
  const perPerson = guestCount > 0 ? Math.round(totalBudget / guestCount) : 0
  const isGolf = trip.trip_type === 'golf'
  const appName = isGolf ? 'The Back Nine' : 'GroupTrip'

  const dateRange = formatDateRange(trip.start_date, trip.end_date)
  const parts = [
    trip.destination,
    dateRange,
    trip.member_count > 0 ? `${trip.member_count} invited` : null,
    perPerson > 0 ? `Est. $${perPerson.toLocaleString()}/person` : null,
  ].filter(Boolean)

  const description = parts.join(' · ')

  return {
    title: `${trip.title} — ${appName}`,
    description,
    openGraph: {
      title: trip.title,
      description,
      type: 'website',
      siteName: appName,
    },
    twitter: {
      card: 'summary',
      title: trip.title,
      description,
    },
  }
}

export default async function ProposalPage(
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  const { inviteCode } = await params
  const data = await fetchProposal(inviteCode)

  if (!data) notFound()

  const { trip, categories, itinerary } = data
  const totalBudget = categories.reduce((sum, cat) => sum + (cat.estimated_cost || 0), 0)
  const guestCount = trip.expected_guests || trip.member_count || 1
  const perPerson = guestCount > 0 ? Math.round(totalBudget / guestCount) : 0
  const isGolf = trip.trip_type === 'golf'
  const brandName = isGolf ? 'The Back Nine' : 'GroupTrip'
  const dateRange = formatDateRange(trip.start_date, trip.end_date)

  const itineraryByDate = itinerary.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {} as Record<string, typeof itinerary>)
  const dates = Object.keys(itineraryByDate).sort()

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      {/* Hero */}
      <div className="bg-gradient-to-b from-white to-[#F5F1ED]">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#70798C]">
            Trip Proposal
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#252323] sm:text-5xl">
            {trip.title}
          </h1>
          {trip.destination && (
            <p className="mb-2 text-lg text-[#A99985]">{trip.destination}</p>
          )}
          {dateRange && (
            <p className="text-base text-[#A99985]">{dateRange}</p>
          )}
          {trip.description && (
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#A99985]">
              {trip.description}
            </p>
          )}

          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <span className="text-[#A99985]">{trip.member_count} invited</span>
            <span className="text-[#DAD2BC]">&bull;</span>
            <span className="font-semibold text-[#4A7C59]">
              {trip.accepted_count} confirmed
            </span>
          </div>

          <div className="mt-8">
            <JoinButton inviteCode={inviteCode} size="lg" />
            <p className="mt-3 text-xs text-[#A99985]">Free to join — no credit card required</p>
          </div>
        </div>
      </div>

      {/* Budget */}
      {categories.length > 0 && (
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-[#70798C]">
            Estimated Budget
          </h2>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[8px] border-2 border-[#70798C] bg-white p-5 text-center shadow-[0_2px_6px_rgba(0,0,0,0.08)] sm:order-first">
              <p className="text-4xl font-bold text-[#70798C]">
                ${perPerson.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#A99985]">Per Person</p>
            </div>
            <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-2xl font-bold text-[#252323]">
                ${totalBudget.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-[#A99985]">Total Budget</p>
            </div>
            <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-2xl font-bold text-[#252323]">
                {guestCount}
              </p>
              <p className="mt-1 text-xs text-[#A99985]">{trip.expected_guests ? 'Expected' : 'People'}</p>
            </div>
          </div>

          <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#252323]">
              Breakdown
            </h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between border-b border-[#F5F1ED] pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-[#252323]">{cat.name}</span>
                  <span className="text-sm font-medium text-[#252323]">
                    ${cat.estimated_cost.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Itinerary */}
      {dates.length > 0 && (
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-[#70798C]">
            Planned Activities
          </h2>

          <div className="space-y-6">
            {dates.map((date) => (
              <div key={date}>
                <h3 className="mb-3 text-base font-semibold text-[#252323]">
                  {formatDate(date)}
                </h3>
                <div className="space-y-2">
                  {itineraryByDate[date].map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[5px] border border-[#DAD2BC] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
                    >
                      <div className="flex items-stretch">
                        <div className="w-1 flex-shrink-0 bg-[#70798C]" />
                        <div className="flex items-start gap-3 p-4">
                          {item.time && (
                            <span className="mt-0.5 min-w-[48px] text-sm font-semibold text-[#70798C]">
                              {item.time}
                            </span>
                          )}
                          <div>
                            <p className="font-medium text-[#252323]">{item.title}</p>
                            {item.location && (
                              <p className="mt-0.5 text-sm text-[#A99985]">{item.location}</p>
                            )}
                            {item.description && (
                              <p className="mt-1 text-sm text-[#A99985]">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="mb-3 text-2xl font-bold text-[#252323]">Ready to join?</h2>
          <p className="mb-6 text-[#A99985]">
            Sign up to confirm your spot and start collaborating with the group.
          </p>
          <JoinButton inviteCode={inviteCode} size="lg" />
          <p className="mt-3 text-xs text-[#A99985]">Free to join — no credit card required</p>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <p className="text-xs text-[#A99985]">Powered by {brandName}</p>
      </div>
    </div>
  )
}
