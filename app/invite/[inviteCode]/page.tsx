'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Trip {
  id: string
  title: string
  destination: string
  start_date: string
  end_date: string
  description: string | null
  status: string
  invite_code: string
  created_at: string
}

export default function InvitePage({ params }: { params: Promise<{ inviteCode: string }> }) {
  const { inviteCode } = use(params)
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [joining, setJoining] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current

    // Check if user is authenticated
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      setAuthLoading(false)
    })

    // Fetch trip details
    async function fetchTrip() {
      try {
        const response = await fetch(`/api/invite/${inviteCode}`)
        if (!response.ok) {
          throw new Error('Trip not found or invite code is invalid')
        }
        const data = await response.json()
        setTrip(data.trip)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTrip()
  }, [inviteCode])

  const handleJoinTrip = async () => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?next=/invite/${inviteCode}`)
      return
    }

    if (!trip) return

    setJoining(true)
    try {
      const response = await fetch(`/api/trips/${trip.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvp_status: 'accepted' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join trip')
      }

      // Redirect to trip detail page
      router.push(`/trips/${trip.id}`)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1ED]">
        <p className="text-[#A99985]">Loading trip details...</p>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1ED] px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Trip Not Found</CardTitle>
            <CardDescription>
              {error || 'The invite link you followed is invalid or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 dark:from-zinc-900 dark:to-zinc-950">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="mb-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            You've been invited!
          </div>
          <CardTitle className="text-3xl">{trip.title}</CardTitle>
          <CardDescription className="text-lg">{trip.destination}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-[#A99985]">Start Date</p>
              <p className="text-lg font-medium">
                {new Date(trip.start_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#A99985]">End Date</p>
              <p className="text-lg font-medium">
                {new Date(trip.end_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {trip.description && (
            <div>
              <p className="text-sm font-medium text-[#A99985]">Description</p>
              <p className="mt-1 text-zinc-700 dark:text-zinc-300">{trip.description}</p>
            </div>
          )}

          <div className="rounded-lg border border-zinc-200 bg-[#F5F1ED] p-4 dark:border-zinc-800">
            <h3 className="mb-2 font-semibold">What's included?</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center">
                <span className="mr-2">✓</span> Shared trip itinerary
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Budget and expense splitting
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Real-time updates and comments
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Group availability calendar
              </li>
            </ul>
          </div>

          <Button onClick={handleJoinTrip} disabled={joining || authLoading} className="w-full" size="lg">
            {joining ? 'Joining...' : authLoading ? 'Loading...' : user ? 'Join This Trip' : 'Sign In to Join'}
          </Button>

          {!user && (
            <p className="text-center text-sm text-[#A99985]">
              You'll need to sign in or create an account to join this trip
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
