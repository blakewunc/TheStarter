import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Destination suggestions, derived from where courses actually are.
 *
 * The brief asks for a places autocomplete to fix the typo class ("Souther Pines, NC"
 * saved as typed) and to give normalized location data. We have no Places key, but we
 * do have 12,989 seeded courses carrying city and state — and a golf trip goes where
 * the courses are, so the set of golf destinations is very close to the set of towns
 * with courses in them.
 *
 * The upside over a generic places API is that each suggestion knows how many courses
 * it has, which is the number an organizer actually cares about when picking a town.
 * The limitation is honest and worth stating: somewhere with no seeded course will not
 * suggest, so free text still has to save.
 */

const MIN_QUERY_LENGTH = 2
const RESULT_LIMIT = 8
const CANDIDATE_LIMIT = 400

export interface DestinationResult {
  /** "Southern Pines, NC" — what gets written to trips.destination */
  label: string
  city: string
  state: string
  courseCount: number
  lat: number | null
  lng: number | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()

  if (q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ destinations: [] })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pattern = `${q.replace(/[%_]/g, (c) => `\\${c}`)}%`

  // Matching on city prefix rather than substring: someone typing "pine" wants
  // Pinehurst, not every town with "pine" buried in the middle of its name.
  const { data, error } = await supabase
    .from('courses')
    .select('city, state, lat, lng')
    .ilike('city', pattern)
    .not('city', 'is', null)
    .not('state', 'is', null)
    .limit(CANDIDATE_LIMIT)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fold to distinct city+state, counting courses and averaging coordinates so the
  // destination has a usable centre for biasing course search later.
  const byPlace = new Map<string, { city: string; state: string; n: number; lat: number; lng: number; geo: number }>()
  for (const row of data || []) {
    const city = (row.city || '').trim()
    const state = (row.state || '').trim()
    if (!city || !state) continue
    const key = `${city.toLowerCase()}|${state.toLowerCase()}`
    const entry = byPlace.get(key) ?? { city, state, n: 0, lat: 0, lng: 0, geo: 0 }
    entry.n += 1
    if (typeof row.lat === 'number' && typeof row.lng === 'number') {
      entry.lat += row.lat
      entry.lng += row.lng
      entry.geo += 1
    }
    byPlace.set(key, entry)
  }

  const destinations: DestinationResult[] = Array.from(byPlace.values())
    // More courses means a more plausible golf destination, so that leads the ranking.
    .sort((a, b) => b.n - a.n || a.city.localeCompare(b.city))
    .slice(0, RESULT_LIMIT)
    .map((e) => ({
      label: `${e.city}, ${e.state}`,
      city: e.city,
      state: e.state,
      courseCount: e.n,
      lat: e.geo > 0 ? e.lat / e.geo : null,
      lng: e.geo > 0 ? e.lng / e.geo : null,
    }))

  return NextResponse.json({ destinations })
}
