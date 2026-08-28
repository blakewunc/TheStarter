'use client'

import { use, useEffect, useRef, useState } from 'react'
import { parseLocalDate } from '@/lib/dates'
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
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpEmail, setRsvpEmail] = useState('')
  const [rsvp, setRsvp] = useState<'accepted' | 'declined' | 'maybe' | null>(null)
  const [responded, setResponded] = useState(false)
  const [rsvpError, setRsvpError] = useState<string | null>(null)
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

  const submitRsvp = async (status: 'accepted' | 'declined' | 'maybe') => {
    if (!rsvpName.trim()) return
    setJoining(true)
    setRsvpError(null)
    try {
      const res = await fetch(`/api/invite/${inviteCode}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: rsvpName, email: rsvpEmail, rsvp_status: status }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Could not save that')
      }
      setRsvp(status)
      setResponded(true)
    } catch (err: any) {
      setRsvpError(err.message)
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1ED]">
        <p className="text-[#6B6460]">Loading trip details...</p>
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
    <div className="flex min-h-screen items-center justify-center bg-[#F5F1ED] px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#3B6D11]">
            You&rsquo;re invited
          </p>
          <CardTitle className="text-3xl">{trip.title}</CardTitle>
          <CardDescription className="text-lg">{trip.destination}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-[#6B6460]">Start Date</p>
              <p className="text-lg font-medium">
                {parseLocalDate(trip.start_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#6B6460]">End Date</p>
              <p className="text-lg font-medium">
                {parseLocalDate(trip.end_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {trip.description && (
            <div>
              <p className="text-sm font-medium text-[#6B6460]">Description</p>
              <p className="mt-1 text-[#1C1A17]">{trip.description}</p>
            </div>
          )}

          <div className="rounded-[5px] border border-[#DAD2BC] bg-[#F5F1ED] p-4">
            <h3 className="mb-2 font-semibold">What's included?</h3>
            <ul className="space-y-2 text-sm text-[#6B6460]">
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

          {/* E.8 — answering must not require an account. This link is the whole
              experience for most of the group, and it used to dead-end at /login. */}
          {responded ? (
            <div className="rounded-[5px] bg-[#EAF3DE] p-4 text-center">
              <p className="font-medium text-[#3B6D11]">
                {rsvp === 'accepted'
                  ? "You're in. The organizer can see it."
                  : rsvp === 'maybe'
                  ? 'Marked as maybe. You can change it any time.'
                  : 'Marked as out. Thanks for letting them know.'}
              </p>
              <button
                onClick={() => setResponded(false)}
                className="mt-2 text-sm text-[#6B6460] underline-offset-2 hover:text-[#1C1A17] hover:underline"
              >
                Change my answer
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label htmlFor="rsvp-name" className="mb-1 block text-sm font-medium text-[#1C1A17]">
                  Your name
                </label>
                <input
                  id="rsvp-name"
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="So they know who's coming"
                  className="flex h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-4 text-base text-[#1C1A17] placeholder:text-[#6B6460] focus:border-[#3B6D11] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="rsvp-email" className="mb-1 block text-sm font-medium text-[#1C1A17]">
                  Email <span className="font-normal text-[#6B6460]">(optional)</span>
                </label>
                <input
                  id="rsvp-email"
                  type="email"
                  value={rsvpEmail}
                  onChange={(e) => setRsvpEmail(e.target.value)}
                  placeholder="Only so you can update your answer later"
                  className="flex h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-4 text-base text-[#1C1A17] placeholder:text-[#6B6460] focus:border-[#3B6D11] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {([
                  ['accepted', "I'm in"],
                  ['maybe', 'Maybe'],
                  ['declined', "Can't go"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => submitRsvp(value)}
                    disabled={joining || !rsvpName.trim()}
                    className={`min-h-11 rounded-[5px] border px-3 text-sm font-medium transition-colors disabled:opacity-40 ${
                      value === 'accepted'
                        ? 'border-[#1C1A17] bg-[#1C1A17] text-white hover:opacity-90'
                        : 'border-[#DAD2BC] bg-white text-[#1C1A17] hover:bg-[#F5F1ED]'
                    }`}
                  >
                    {joining ? '…' : label}
                  </button>
                ))}
              </div>

              {rsvpError && (
                <p className="text-sm text-[#8B4444]">{rsvpError}</p>
              )}

              <p className="text-center text-xs text-[#6B6460]">
                No account needed. Sign in later only if you want to add expenses or
                scores.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
