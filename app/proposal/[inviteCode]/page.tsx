'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface ProposalData {
  trip: {
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

function ProposalSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-white to-[#F5F1ED] px-6 py-16">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-10 w-2/3 mx-auto" />
          <Skeleton className="h-5 w-40 mx-auto" />
          <Skeleton className="h-5 w-32 mx-auto" />
          <Skeleton className="h-11 w-40 mx-auto mt-6" />
        </div>
      </div>
      {/* Budget skeleton */}
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
        <Skeleton className="h-4 w-32 mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}

export default function ProposalPage() {
  const params = useParams()
  const router = useRouter()
  const inviteCode = params.inviteCode as string
  const [data, setData] = useState<ProposalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const response = await fetch(`/api/proposal/${inviteCode}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('This proposal is not available.')
          } else {
            setError('Something went wrong.')
          }
          return
        }
        const result = await response.json()
        setData(result)
      } catch {
        setError('Failed to load proposal.')
      } finally {
        setLoading(false)
      }
    }

    fetchProposal()
  }, [inviteCode])

  if (loading) return <ProposalSkeleton />

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1ED]">
        <div className="max-w-md rounded-[8px] border border-[#DAD2BC] bg-white p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F1ED] mx-auto">
            <svg className="h-6 w-6 text-[#A99985]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-bold text-[#252323]">Proposal Not Found</h1>
          <p className="text-[#A99985]">{error || 'This proposal does not exist or has been disabled.'}</p>
          <button
            onClick={() => router.back()}
            className="mt-6 text-sm text-[#70798C] underline-offset-2 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  const { trip, categories, itinerary } = data

  const totalBudget = categories.reduce((sum, cat) => sum + (cat.estimated_cost || 0), 0)
  const perPerson = trip.member_count > 0 ? totalBudget / trip.member_count : totalBudget
  const isGolf = trip.trip_type === 'golf'

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateRange = () => {
    if (!trip.start_date) return null
    const start = formatDate(trip.start_date)
    if (!trip.end_date) return start
    const end = formatDate(trip.end_date)
    return `${start} \u2013 ${end}`
  }

  const itineraryByDate = itinerary.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {} as Record<string, typeof itinerary>)

  const dates = Object.keys(itineraryByDate).sort()

  const handleJoin = () => router.push(`/login?next=/invite/${inviteCode}`)

  const brandName = isGolf ? 'The Back Nine' : 'GroupTrip'

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
          {formatDateRange() && (
            <p className="text-base text-[#A99985]">{formatDateRange()}</p>
          )}
          {trip.description && (
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#A99985]">
              {trip.description}
            </p>
          )}

          {/* Social proof */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <span className="text-[#A99985]">{trip.member_count} invited</span>
            <span className="text-[#DAD2BC]">&bull;</span>
            <span className="font-semibold text-[#4A7C59]">
              {trip.accepted_count} confirmed
            </span>
          </div>

          {/* Above-fold CTA */}
          <div className="mt-8">
            <Button size="lg" onClick={handleJoin} className="px-10">
              Join This Trip
            </Button>
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
            {/* Per Person — most prominent */}
            <div className="rounded-[8px] border-2 border-[#70798C] bg-white p-5 text-center shadow-[0_2px_6px_rgba(0,0,0,0.08)] sm:order-first">
              <p className="text-4xl font-bold text-[#70798C]">
                ${Math.round(perPerson).toLocaleString()}
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
                {trip.member_count}
              </p>
              <p className="mt-1 text-xs text-[#A99985]">People</p>
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
                        {/* Colored left border accent */}
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
          <Button size="lg" onClick={handleJoin} className="px-10">
            Join This Trip
          </Button>
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
