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
