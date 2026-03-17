import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateRange } from '@/lib/utils/date'

export default async function TripsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // TEMPORARILY DISABLED for Google AdSense review - re-enable after approval
  // if (!user) {
  //   redirect('/login')
  // }

  // Fetch user's trips (returns empty if not logged in)
  const { data: trips } = user ? await supabase
    .from('trips')
    .select(
      `
      *,
      trip_members!inner(role, rsvp_status)
    `
    )
    .eq('trip_members.user_id', user.id)
    .order('created_at', { ascending: false }) : { data: [] }

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#252323]">My Trips</h1>
            <p className="mt-2 text-[#A99985]">Plan and manage your group adventures</p>
          </div>
          <Link href="/trips/new">
            <Button>Create Trip</Button>
          </Link>
        </div>

        {trips && trips.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip: any) => (
              <Link key={trip.id} href={`/trips/${trip.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle>{trip.title}</CardTitle>
                    <CardDescription>{trip.destination}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDateRange(trip.start_date, trip.end_date)}
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            trip.status === 'planning'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : trip.status === 'confirmed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          {trip.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : !user ? (
          /* Unauthenticated: show demo trip card */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/trips/demo" className="group">
              <div className="relative rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow group-hover:shadow-md">
                {/* Demo badge */}
                <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-[#70798C]/10 px-2.5 py-0.5 text-xs font-semibold text-[#70798C] border border-[#70798C]/20">
                  Demo Trip
                </span>

                <h3 className="pr-20 text-lg font-bold text-[#252323]">Pinehurst Boys Trip</h3>
                <p className="mt-0.5 text-sm text-[#A99985]">Pinehurst, NC</p>

                <div className="mt-4 space-y-2 text-sm text-[#70798C]">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    May 15 – 18, 2025
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    8 players
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pinehurst No. 2 & No. 4
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#F5F1ED] pt-4">
                  <span className="inline-flex items-center rounded-full border border-[#4A7C59]/20 bg-[#4A7C59]/10 px-2.5 py-0.5 text-xs font-semibold text-[#4A7C59]">
                    confirmed
                  </span>
                  <span className="text-sm font-medium text-[#70798C] group-hover:text-[#252323] transition-colors">
                    View demo →
                  </span>
                </div>
              </div>
            </Link>

            {/* CTA to sign up */}
            <div className="flex flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-[#DAD2BC] p-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F1ED]">
                <svg className="h-6 w-6 text-[#A99985]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h3 className="mb-1 text-base font-semibold text-[#252323]">Plan your own trip</h3>
              <p className="mb-4 text-sm text-[#A99985]">Sign up to organize tee times, split expenses, and coordinate with your crew.</p>
              <Link href="/signup">
                <Button size="sm">Create Your Own Trip →</Button>
              </Link>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <svg
                className="mb-4 h-12 w-12 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                />
              </svg>
              <h3 className="mb-2 text-lg font-semibold">No trips yet</h3>
              <p className="mb-4 text-sm text-zinc-500">Start planning your next adventure!</p>
              <Link href="/trips/new">
                <Button>Create Your First Trip</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
