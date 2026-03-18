import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDateRange } from '@/lib/utils/date'
import { DEMO_TRIP } from '@/lib/demo-trip'

const AVATAR_COLORS = ['#0d1f2d', '#2a5c3f', '#4a3728', '#3d4a6b', '#5a3d3d']

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  const src = name || email || '?'
  return src.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function AvatarStack({ members }: { members: { display_name?: string | null; email?: string | null }[] }) {
  const shown = members.slice(0, 4)
  const overflow = members.length - shown.length
  return (
    <div className="flex items-center">
      <div className="flex" style={{ direction: 'ltr' }}>
        {shown.map((m, i) => (
          <div
            key={i}
            title={m.display_name || m.email || undefined}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: AVATAR_COLORS[i % AVATAR_COLORS.length],
              border: '2px solid #fff',
              marginLeft: i === 0 ? 0 : '-6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: 600,
              color: '#F5F1ED',
              zIndex: shown.length - i,
              position: 'relative',
            }}
          >
            {getInitials(m.display_name, m.email)}
          </div>
        ))}
      </div>
      {overflow > 0 && (
        <span style={{ fontSize: '12px', color: '#70798C', marginLeft: '6px' }}>+{overflow}</span>
      )}
      <span style={{ fontSize: '12px', color: '#70798C', marginLeft: overflow > 0 ? '4px' : '8px' }}>
        {members.length} {members.length === 1 ? 'player' : 'players'}
      </span>
    </div>
  )
}

interface TripCardData {
  id: string
  title: string
  destination: string | null
  start_date: string | null
  end_date: string | null
  status: string | null
  members: { display_name?: string | null; email?: string | null; rsvp_status?: string | null }[]
  budgetTotal: number
  roundsCount: number
}

function TripCard({ trip }: { trip: TripCardData }) {
  const memberCount = trip.members.length
  const perPerson = memberCount > 0 && trip.budgetTotal > 0
    ? Math.round(trip.budgetTotal / memberCount)
    : null
  const respondedCount = trip.members.filter(m => m.rsvp_status && m.rsvp_status !== 'pending').length
  const allResponded = respondedCount === memberCount && memberCount > 0

  return (
    <Link href={`/trips/${trip.id}`} className="block">
      <div
        style={{ background: '#ffffff', border: '1px solid #e8e3dd', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}
        className="transition-shadow hover:shadow-md"
      >
        {/* Dark header */}
        <div style={{ background: '#0d1f2d', padding: '20px', position: 'relative' }}>
          {trip.status && (
            <span
              style={{ position: 'absolute', top: '14px', right: '14px', background: '#1a3347', color: '#8fa3b1', fontSize: '10px', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}
            >
              {trip.status}
            </span>
          )}
          {trip.destination && (
            <p style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#4a6070', textTransform: 'uppercase', marginBottom: '4px' }}>
              {trip.destination}
            </p>
          )}
          <h2
            style={{ fontSize: '20px', color: '#F5F1ED', fontWeight: 400, lineHeight: 1.2, fontFamily: 'Georgia, "Times New Roman", serif', marginBottom: '6px', paddingRight: '70px' }}
          >
            {trip.title}
          </h2>
          {(trip.start_date || trip.end_date) && (
            <p style={{ fontSize: '12px', color: '#8fa3b1' }}>
              {formatDateRange(trip.start_date ?? '', trip.end_date ?? '')}
            </p>
          )}
        </div>

        {/* Light body */}
        <div style={{ background: '#ffffff', padding: '16px 20px' }}>
          <div className="mb-3">
            <AvatarStack members={trip.members} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div style={{ background: '#F5F1ED', borderRadius: '6px', padding: '10px 12px' }}>
              <p style={{ fontSize: '10px', color: '#9a9590', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Per person
              </p>
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#0d1f2d' }}>
                {perPerson ? `$${perPerson.toLocaleString()}` : 'Not set'}
              </p>
            </div>
            <div style={{ background: '#F5F1ED', borderRadius: '6px', padding: '10px 12px' }}>
              <p style={{ fontSize: '10px', color: '#9a9590', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Rounds
              </p>
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#0d1f2d' }}>
                {trip.roundsCount > 0 ? `${trip.roundsCount} booked` : 'None yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0ebe5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center gap-2">
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: allResponded ? '#4a8c63' : respondedCount > 0 ? '#c4a060' : '#4a6070', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: '#70798C' }}>
              {allResponded
                ? 'All responded'
                : memberCount > 0
                ? `${respondedCount} of ${memberCount} responded`
                : 'Getting started'}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#2a5c3f', fontWeight: 500 }}>
            Open trip →
          </span>
        </div>
      </div>
    </Link>
  )
}

function NewTripCard() {
  return (
    <Link href="/trips/new" className="block">
      <div
        style={{ border: '1.5px dashed #d4cfc9', background: 'transparent', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px', cursor: 'pointer' }}
        className="transition-colors hover:border-[#2a5c3f]"
      >
        <div className="text-center">
          <div
            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1.5px dashed #d4cfc9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9590" strokeWidth="1.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#0d1f2d', marginBottom: '4px' }}>Plan a new trip</p>
          <p style={{ fontSize: '12px', color: '#9a9590' }}>Invite your crew with one link</p>
        </div>
      </div>
    </Link>
  )
}

export default async function TripsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Unauthenticated: show demo
  if (!user) {
    const demoTrip: TripCardData = {
      id: 'demo',
      title: DEMO_TRIP.title,
      destination: DEMO_TRIP.destination,
      start_date: null,
      end_date: null,
      status: 'demo',
      members: Array.from({ length: DEMO_TRIP.players }, (_, i) => ({
        display_name: `Player ${i + 1}`,
        email: null,
        rsvp_status: 'confirmed',
      })),
      budgetTotal: DEMO_TRIP.totalPerPerson * DEMO_TRIP.players,
      roundsCount: DEMO_TRIP.rounds.length,
    }

    return (
      <div className="min-h-screen" style={{ background: '#F5F1ED' }}>
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#70798C', textTransform: 'uppercase', marginBottom: '8px' }}>
                My Golf Trips
              </p>
              <h1 style={{ fontSize: '24px', fontWeight: 400, color: '#0d1f2d', fontFamily: 'Georgia, "Times New Roman", serif' }}>
                Where are you headed?
              </h1>
            </div>
            <Link
              href="/signup"
              style={{ background: '#0d1f2d', color: '#F5F1ED', fontSize: '13px', padding: '9px 18px', borderRadius: '6px', whiteSpace: 'nowrap' }}
              className="transition-opacity hover:opacity-80"
            >
              + Plan a trip
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <TripCard trip={demoTrip} />
              <div style={{ position: 'absolute', top: '-8px', left: '16px', background: '#70798C', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.06em' }}>
                SAMPLE TRIP
              </div>
            </div>
            <NewTripCard />
          </div>

          <div className="mt-6 rounded-[5px] border border-[#e8e3dd] bg-white p-8 text-center">
            <p className="mb-1 text-base font-semibold" style={{ color: '#0d1f2d' }}>This is a sample trip</p>
            <p className="mb-4 text-sm" style={{ color: '#70798C' }}>
              Create a free account to plan your own golf trip — tee times, scores, expenses, and more.
            </p>
            <Link
              href="/signup"
              style={{ background: '#0d1f2d', color: '#F5F1ED', fontSize: '14px', padding: '10px 24px', borderRadius: '6px', display: 'inline-block' }}
              className="transition-opacity hover:opacity-80"
            >
              Plan Your Own Golf Trip →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated: get user's trip IDs
  const { data: membershipData } = await supabase
    .from('trip_members')
    .select('trip_id')
    .eq('user_id', user.id)

  const tripIds = membershipData?.map(m => m.trip_id) ?? []

  let trips: TripCardData[] = []

  if (tripIds.length > 0) {
    const { data: tripData } = await supabase
      .from('trips')
      .select(`
        id, title, destination, start_date, end_date, status,
        trip_members(
          user_id, rsvp_status,
          profiles(display_name, email)
        ),
        budget_categories(estimated_cost),
        golf_tee_times(id)
      `)
      .in('id', tripIds)
      .order('created_at', { ascending: false })

    trips = (tripData ?? []).map((t: any) => ({
      id: t.id,
      title: t.title,
      destination: t.destination,
      start_date: t.start_date,
      end_date: t.end_date,
      status: t.status,
      members: (t.trip_members ?? []).map((m: any) => ({
        display_name: m.profiles?.display_name ?? null,
        email: m.profiles?.email ?? null,
        rsvp_status: m.rsvp_status,
      })),
      budgetTotal: (t.budget_categories ?? []).reduce((sum: number, c: any) => sum + (c.estimated_cost ?? 0), 0),
      roundsCount: (t.golf_tee_times ?? []).length,
    }))
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F1ED' }}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#70798C', textTransform: 'uppercase', marginBottom: '8px' }}>
              My Golf Trips
            </p>
            <h1 style={{ fontSize: '24px', fontWeight: 400, color: '#0d1f2d', fontFamily: 'Georgia, "Times New Roman", serif' }}>
              Where are you headed?
            </h1>
          </div>
          <Link
            href="/trips/new"
            style={{ background: '#0d1f2d', color: '#F5F1ED', fontSize: '13px', padding: '9px 18px', borderRadius: '6px', whiteSpace: 'nowrap' }}
            className="transition-opacity hover:opacity-80"
          >
            + Plan a trip
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} />
          ))}
          <NewTripCard />
        </div>
      </div>
    </div>
  )
}
