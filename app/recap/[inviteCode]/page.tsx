import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'

async function fetchRecap(inviteCode: string) {
  const supabase = createServiceClient()

  const { data: trip, error } = await supabase
    .from('trips')
    .select(`
      id, title, destination, start_date, end_date, description,
      trip_type, status, invite_code,
      trip_members(id, rsvp_status, profiles(id, display_name, email))
    `)
    .eq('invite_code', inviteCode)
    .single()

  if (error || !trip) return null

  const [{ data: itinerary }, { data: teeTimes }] = await Promise.all([
    supabase
      .from('itinerary_items')
      .select('id, title, description, date, time, location')
      .eq('trip_id', trip.id)
      .order('date', { ascending: true })
      .order('time', { ascending: true }),
    trip.trip_type === 'golf'
      ? supabase
          .from('golf_tee_times')
          .select('id, course_name, tee_time, par, golf_scores(user_id, score, profiles(display_name, email))')
          .eq('trip_id', trip.id)
          .order('tee_time', { ascending: true })
      : Promise.resolve({ data: null }),
  ])

  const members: any[] = trip.trip_members || []
  const attendees = members.filter((m) => m.rsvp_status === 'accepted')

  return {
    trip: {
      title: trip.title,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      description: trip.description,
      trip_type: trip.trip_type,
      status: trip.status,
      invite_code: trip.invite_code,
    },
    itinerary: itinerary || [],
    attendees: attendees.map((m) => ({
      id: m.profiles.id,
      name: m.profiles.display_name || m.profiles.email.split('@')[0],
    })),
    golfRounds: teeTimes || [],
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric',
  })
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return null
  if (!end || start === end) return formatDate(start)
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return `${formatDate(start)} – ${formatDate(end)} · ${days} days`
}

export async function generateMetadata(
  { params }: { params: Promise<{ inviteCode: string }> }
): Promise<Metadata> {
  const { inviteCode } = await params
  const data = await fetchRecap(inviteCode)
  if (!data) return { title: 'Trip Recap' }

  const { trip, attendees, itinerary } = data
  const isGolf = trip.trip_type === 'golf'
  const appName = isGolf ? 'The Back Nine' : 'GroupTrip'
  const description = [
    trip.destination,
    formatDateRange(trip.start_date, trip.end_date),
    attendees.length > 0 ? `${attendees.length} travelers` : null,
    itinerary.length > 0 ? `${itinerary.length} activities` : null,
  ].filter(Boolean).join(' · ')

  return {
    title: `${trip.title} — Trip Recap`,
    description,
    openGraph: {
      title: `${trip.title} — Trip Recap`,
      description,
      type: 'website',
      siteName: appName,
    },
    twitter: {
      card: 'summary',
      title: `${trip.title} — Trip Recap`,
      description,
    },
  }
}

export default async function RecapPage(
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  const { inviteCode } = await params
  const data = await fetchRecap(inviteCode)
  if (!data) notFound()

  const { trip, itinerary, attendees, golfRounds } = data
  const isGolf = trip.trip_type === 'golf'
  const brandName = isGolf ? 'The Back Nine' : 'GroupTrip'
  const brandDomain = isGolf ? 'https://thebacknine.app' : 'https://grouptrip-mu.vercel.app'
  const dateRange = formatDateRange(trip.start_date, trip.end_date)

  const itineraryByDate = itinerary.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {} as Record<string, typeof itinerary>)
  const dates = Object.keys(itineraryByDate).sort()

  // Build golf leaderboard across all rounds
  const scoreMap: Record<string, { name: string; totalScore: number; totalPar: number; rounds: number }> = {}
  for (const round of golfRounds as any[]) {
    for (const gs of (round.golf_scores || [])) {
      if (!gs.score) continue
      const name = gs.profiles?.display_name || gs.profiles?.email?.split('@')[0] || 'Unknown'
      if (!scoreMap[gs.user_id]) scoreMap[gs.user_id] = { name, totalScore: 0, totalPar: 0, rounds: 0 }
      scoreMap[gs.user_id].totalScore += gs.score
      scoreMap[gs.user_id].totalPar += round.par || 72
      scoreMap[gs.user_id].rounds += 1
    }
  }
  const leaderboard = Object.values(scoreMap)
    .sort((a, b) => (a.totalScore - a.totalPar) - (b.totalScore - b.totalPar))

  const AVATAR_COLORS = ['#70798C', '#A99985', '#8B7355', '#6B8E7B', '#7C6B8E']

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      {/* Hero */}
      <div className={`${isGolf ? 'bg-gradient-to-b from-[#0B442D] to-[#092D3D]' : 'bg-gradient-to-b from-[#252323] to-[#3A3838]'} px-6 py-16`}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/60">
            Trip Recap
          </p>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {trip.title}
          </h1>
          {trip.destination && (
            <p className="mb-1 text-lg text-white/70">{trip.destination}</p>
          )}
          {dateRange && (
            <p className="text-sm text-white/60">{dateRange}</p>
          )}

          {/* Attendee avatars */}
          {attendees.length > 0 && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <div className="flex -space-x-2">
                {attendees.slice(0, 8).map((a, i) => (
                  <div
                    key={a.id}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20"
                    style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                    title={a.name}
                  >
                    <span className="text-xs font-semibold text-white">
                      {a.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ))}
                {attendees.length > 8 && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-white/10">
                    <span className="text-xs font-semibold text-white">+{attendees.length - 8}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-white/60">
                {attendees.length} {attendees.length === 1 ? 'traveler' : 'travelers'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 space-y-12">
        {/* Golf Leaderboard */}
        {isGolf && leaderboard.length > 0 && (
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#70798C]">
              Leaderboard
            </h2>
            <div className="rounded-[5px] border border-[#DAD2BC] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
              {leaderboard.map((player, i) => {
                const diff = player.totalScore - player.totalPar
                const diffStr = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`
                const isWinner = i === 0
                return (
                  <div
                    key={player.name}
                    className={`flex items-center justify-between px-5 py-3.5 ${i < leaderboard.length - 1 ? 'border-b border-[#F5F1ED]' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 text-sm font-bold ${isWinner ? 'text-[#B8956A]' : 'text-[#A99985]'}`}>
                        {i + 1}
                      </span>
                      <span className="font-medium text-[#252323]">{player.name}</span>
                      {isWinner && <span className="text-sm">🏆</span>}
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${diff < 0 ? 'text-[#4A7C59]' : diff > 0 ? 'text-[#8B4444]' : 'text-[#A99985]'}`}>
                        {diffStr}
                      </span>
                      <span className="ml-1.5 text-xs text-[#A99985]">({player.totalScore})</span>
                    </div>
                  </div>
                )
              })}
            </div>
            {(golfRounds as any[]).length > 1 && (
              <p className="mt-2 text-xs text-[#A99985] text-right">
                {(golfRounds as any[]).length} rounds total
              </p>
            )}
          </div>
        )}

        {/* Itinerary */}
        {dates.length > 0 && (
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#70798C]">
              What We Did
            </h2>
            <div className="space-y-6">
              {dates.map((date) => (
                <div key={date}>
                  <h3 className="mb-3 text-sm font-semibold text-[#252323]">{formatDate(date)}</h3>
                  <div className="space-y-2">
                    {itineraryByDate[date].map((item) => (
                      <div key={item.id} className="rounded-[5px] border border-[#DAD2BC] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                        <div className="flex items-stretch">
                          <div className={`w-1 flex-shrink-0 ${isGolf ? 'bg-[#12733C]' : 'bg-[#70798C]'}`} />
                          <div className="flex items-start gap-3 p-4">
                            {item.time && (
                              <span className={`mt-0.5 min-w-[48px] text-sm font-semibold ${isGolf ? 'text-[#12733C]' : 'text-[#70798C]'}`}>
                                {item.time}
                              </span>
                            )}
                            <div>
                              <p className="font-medium text-[#252323]">{item.title}</p>
                              {item.location && <p className="mt-0.5 text-sm text-[#A99985]">{item.location}</p>}
                              {item.description && <p className="mt-1 text-sm text-[#A99985]">{item.description}</p>}
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

        {/* CTA */}
        <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="mb-2 text-base font-semibold text-[#252323]">
            {isGolf ? 'Ready for the next round?' : 'Plan your own trip'}
          </p>
          <p className="mb-4 text-sm text-[#A99985]">
            {isGolf
              ? 'The Back Nine makes it easy to organize your next golf getaway.'
              : 'GroupTrip handles the itinerary, budget, and RSVPs — all in one place.'}
          </p>
          <Link
            href={`${brandDomain}?utm_source=recap&utm_medium=referral&utm_campaign=trip_share`}
            className="inline-flex items-center gap-2 rounded-[5px] bg-[#70798C] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5A6270]"
          >
            {isGolf ? 'Plan a Golf Trip' : 'Plan a Trip'} →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <a
          href={`${brandDomain}?utm_source=recap&utm_medium=referral&utm_campaign=trip_share`}
          className="text-xs text-[#A99985] underline-offset-2 hover:underline"
        >
          Powered by {brandName}
        </a>
      </div>
    </div>
  )
}
