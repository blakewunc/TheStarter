'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SnapshotData {
  trip: any
  accommodation: any | null
  transportation: any[]
  itinerary: any[]
  teeTimes: any[]
  expenses: any[]
  members: any[]
  currentUserId: string | null
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatTime(time: string) {
  const [h, min] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${min.toString().padStart(2, '0')} ${ampm}`
}

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

const transportTypeLabels: Record<string, string> = {
  carpool: '🚗 Carpool',
  flight: '✈️ Flight',
  train: '🚂 Train',
  other: '🚌 Other',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h2 className="mb-4 border-b border-[#F5F1ED] pb-2 text-lg font-bold text-[#252323]">{title}</h2>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-[#A99985]">{label}</span>
      <span className="text-sm text-[#252323]">{value}</span>
    </div>
  )
}

export default function SnapshotPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [data, setData] = useState<SnapshotData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        // TEMPORARILY DISABLED for Google AdSense review - re-enable after approval
        // if (!user) { router.push('/login'); return }

        const [tripRes, accRes, transRes, itinRes, expRes] = await Promise.all([
          fetch(`/api/trips/${tripId}`),
          fetch(`/api/trips/${tripId}/accommodation`),
          fetch(`/api/trips/${tripId}/transportation`),
          fetch(`/api/trips/${tripId}/itinerary`),
          fetch(`/api/trips/${tripId}/expenses`),
        ])

        if (!tripRes.ok) {
          setError('Trip not found or you do not have access.')
          return
        }

        const tripData = await tripRes.json()
        const accData = accRes.ok ? await accRes.json() : {}
        const transData = transRes.ok ? await transRes.json() : {}
        const itinData = itinRes.ok ? await itinRes.json() : {}
        const expData = expRes.ok ? await expRes.json() : {}

        // Fetch tee times for golf trips
        let teeTimes: any[] = []
        if (tripData.trip?.trip_type === 'golf') {
          const teeRes = await fetch(`/api/trips/${tripId}/golf/tee-times`)
          if (teeRes.ok) {
            const teeData = await teeRes.json()
            teeTimes = teeData.tee_times || []
          }
        }

        setData({
          trip: tripData.trip,
          accommodation: accData.accommodation || null,
          transportation: transData.transportation || [],
          itinerary: itinData.items || [],
          teeTimes,
          expenses: expData.expenses || [],
          members: tripData.trip?.trip_members || [],
          currentUserId: user.id,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load snapshot')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [tripId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1ED]">
        <p className="text-[#A99985]">Loading trip brief...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1ED]">
        <div className="text-center">
          <p className="text-[#8B4444]">{error || 'Something went wrong'}</p>
          <button onClick={() => router.back()} className="mt-4 text-sm text-[#70798C] hover:underline">
            Go back
          </button>
        </div>
      </div>
    )
  }

  const { trip, accommodation, transportation, itinerary, teeTimes, expenses, members, currentUserId } = data

  const confirmedMembers = members.filter((m: any) => m.rsvp_status === 'accepted')
  const isOrganizer = members.some((m: any) => m.profiles?.id === currentUserId && m.role === 'organizer')

  // Group itinerary by date
  const byDate = itinerary.reduce((acc: Record<string, any[]>, item: any) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {})

  const [sy, sm, sd] = trip.start_date.split('-').map(Number)
  const [ey, em, ed] = trip.end_date.split('-').map(Number)
  const start = new Date(sy, sm - 1, sd)
  const end = new Date(ey, em - 1, ed)
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // Expense summary for organizer
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
  const memberExpenses: Record<string, number> = {}
  expenses.forEach((exp: any) => {
    if (exp.paid_by) {
      memberExpenses[exp.paid_by] = (memberExpenses[exp.paid_by] || 0) + (exp.amount || 0)
    }
  })

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      {/* Print-friendly header */}
      <div className="border-b border-[#DAD2BC] bg-white px-6 py-4 print:border-0 print:py-2">
        <div className="mx-auto flex max-w-[900px] items-center justify-between">
          <div>
            <button
              onClick={() => router.push(`/trips/${tripId}`)}
              className="mb-1 text-sm text-[#A99985] hover:text-[#252323] print:hidden"
            >
              ← Back to trip
            </button>
            <h1 className="text-xl font-bold text-[#252323]">{trip.title} — Trip Brief</h1>
            <p className="text-sm text-[#A99985]">{trip.destination} · {startStr} – {endStr}</p>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-[5px] border border-[#DAD2BC] bg-white px-4 py-2 text-sm font-medium text-[#252323] transition-colors hover:bg-[#F5F1ED] print:hidden"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[900px] space-y-6 px-6 py-6">
        {/* Who's Coming */}
        <Section title={`Who's Coming (${confirmedMembers.length} confirmed)`}>
          {confirmedMembers.length === 0 ? (
            <p className="text-sm text-[#A99985]">No confirmed members yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {confirmedMembers.map((m: any) => (
                <div key={m.id} className="flex items-center gap-2 rounded-[5px] bg-[#F5F1ED] px-3 py-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#70798C] text-xs font-bold text-white">
                    {(m.profiles?.display_name || m.profiles?.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="truncate text-sm text-[#252323]">
                    {m.profiles?.display_name || m.profiles?.email}
                  </span>
                  {m.role === 'organizer' && (
                    <span className="ml-auto shrink-0 text-xs text-[#A99985]">org</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Accommodation */}
        {accommodation && (
          <Section title="Accommodation">
            <div className="divide-y divide-[#F5F1ED]">
              {accommodation.name && <InfoRow label="Property" value={accommodation.name} />}
              {accommodation.address && (
                <InfoRow
                  label="Address"
                  value={
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(accommodation.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#70798C] hover:underline"
                    >
                      {accommodation.address}
                    </a>
                  }
                />
              )}
              {accommodation.check_in && (
                <InfoRow label="Check-in" value={formatDateTime(accommodation.check_in)} />
              )}
              {accommodation.check_out && (
                <InfoRow label="Check-out" value={formatDateTime(accommodation.check_out)} />
              )}
              {accommodation.door_code && (
                <InfoRow
                  label="Door Code"
                  value={<span className="font-mono text-base font-bold text-[#4A7C59]">{accommodation.door_code}</span>}
                />
              )}
              {accommodation.wifi_name && (
                <InfoRow
                  label="WiFi"
                  value={
                    <span>
                      {accommodation.wifi_name}
                      {accommodation.wifi_password && (
                        <span className="ml-2 font-mono text-[#70798C]">· {accommodation.wifi_password}</span>
                      )}
                    </span>
                  }
                />
              )}
              {accommodation.house_rules && (
                <InfoRow label="House Rules" value={accommodation.house_rules} />
              )}
              {accommodation.notes && (
                <InfoRow label="Notes" value={accommodation.notes} />
              )}
            </div>
          </Section>
        )}

        {/* Transportation */}
        {transportation.length > 0 && (
          <Section title="Transportation">
            <div className="space-y-3">
              {transportation.map((t: any) => (
                <div key={t.id} className="rounded-[5px] border border-[#DAD2BC] p-3">
                  <p className="text-sm font-semibold text-[#252323]">{transportTypeLabels[t.type] || t.type}</p>
                  {(t.departure_location || t.arrival_location) && (
                    <p className="mt-0.5 text-sm text-[#A99985]">
                      {t.departure_location}
                      {t.departure_location && t.arrival_location && ' → '}
                      {t.arrival_location}
                    </p>
                  )}
                  {t.departure_time && (
                    <p className="mt-0.5 text-xs text-[#A99985]">
                      Departs {formatDateTime(t.departure_time)}
                      {t.arrival_time && ` · Arrives ${formatDateTime(t.arrival_time)}`}
                    </p>
                  )}
                  {t.seats_available != null && (
                    <p className="mt-0.5 text-xs text-[#A99985]">{t.seats_available} seats available</p>
                  )}
                  {t.notes && <p className="mt-0.5 text-xs text-[#70798C]">{t.notes}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Golf: Tee Times */}
        {trip.trip_type === 'golf' && teeTimes.length > 0 && (
          <Section title="⛳ Tee Times">
            <div className="space-y-3">
              {teeTimes.map((tt: any) => {
                const teeDate = new Date(tt.tee_time)
                return (
                  <div key={tt.id} className="rounded-[5px] border border-[#DAD2BC] p-3">
                    <p className="font-medium text-[#252323]">{tt.course_name}</p>
                    {tt.course_location && <p className="text-xs text-[#A99985]">📍 {tt.course_location}</p>}
                    <p className="mt-1 text-sm text-[#70798C]">
                      {teeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' at '}
                      {teeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                    {tt.par && <p className="text-xs text-[#A99985]">Par {tt.par}</p>}
                    {tt.notes && <p className="mt-1 text-xs text-[#A99985]">{tt.notes}</p>}
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {/* Itinerary */}
        {itinerary.length > 0 && (
          <Section title="Itinerary">
            <div className="space-y-5">
              {Object.keys(byDate).sort().map((date) => (
                <div key={date}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#A99985]">
                    {formatDate(date)}
                  </p>
                  <div className="space-y-2">
                    {byDate[date]
                      .sort((a: any, b: any) => (a.time || '').localeCompare(b.time || ''))
                      .map((item: any, i: number) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`mt-0.5 h-2 w-2 rounded-full ${i === 0 ? 'bg-[#4A7C59]' : 'bg-[#DAD2BC]'}`} />
                            {i < byDate[date].length - 1 && <div className="mt-1 h-6 w-px bg-[#DAD2BC]" />}
                          </div>
                          <div className="min-w-0 flex-1 pb-1">
                            <p className="text-sm font-medium text-[#252323]">{item.title}</p>
                            <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-[#A99985]">
                              {item.time && <span>{formatTime(item.time)}</span>}
                              {item.location && <span>📍 {item.location}</span>}
                            </div>
                            {item.description && (
                              <p className="mt-0.5 text-xs text-[#A99985]">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Expenses (organizer only) */}
        {isOrganizer && expenses.length > 0 && (
          <Section title="Expense Summary (Organizer View)">
            <div className="mb-4 flex items-center justify-between rounded-[5px] bg-[#F5F1ED] px-4 py-3">
              <span className="text-sm font-medium text-[#252323]">Total tracked expenses</span>
              <span className="text-lg font-bold text-[#252323]">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="space-y-2">
              {expenses.slice(0, 10).map((exp: any) => (
                <div key={exp.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <span className="text-[#252323]">{exp.title || exp.description}</span>
                    {exp.paid_by_profile && (
                      <span className="ml-2 text-xs text-[#A99985]">
                        paid by {exp.paid_by_profile.display_name || exp.paid_by_profile.email}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 font-medium text-[#252323]">
                    ${(exp.amount || 0).toFixed(2)}
                  </span>
                </div>
              ))}
              {expenses.length > 10 && (
                <p className="text-xs text-[#A99985]">+ {expenses.length - 10} more expenses</p>
              )}
            </div>
          </Section>
        )}

        {/* Empty state */}
        {!accommodation && transportation.length === 0 && itinerary.length === 0 && (
          <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[#A99985]">No details have been added yet.</p>
            <p className="mt-1 text-sm text-[#A99985]">
              Fill in accommodation, transportation, and itinerary to see your trip brief.
            </p>
            <button
              onClick={() => router.push(`/trips/${tripId}`)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-[5px] border border-[#DAD2BC] px-4 py-2 text-sm font-medium text-[#252323] transition-colors hover:bg-[#F5F1ED]"
            >
              Go to trip planner
            </button>
          </div>
        )}

        <p className="pb-8 text-center text-xs text-[#A99985] print:hidden">
          This brief was generated from your GroupTrip trip plan.
        </p>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
