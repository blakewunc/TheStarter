import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const MIN_QUERY_LENGTH = 2
const CANDIDATE_LIMIT = 50
const RESULT_LIMIT = 10

export interface CourseResult {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  lat: number | null
  lng: number | null
  timezone: string | null
  access: string | null
  par: number | null
}

/** Great-circle distance in km. Used only to rank, so precision beyond ~1km is irrelevant. */
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371
  const dLat = ((bLat - aLat) * Math.PI) / 180
  const dLng = ((bLng - aLng) * Math.PI) / 180
  const lat1 = (aLat * Math.PI) / 180
  const lat2 = (bLat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

function parseNear(near: string | null): { lat: number; lng: number } | null {
  if (!near) return null
  const [latStr, lngStr] = near.split(',')
  const lat = Number(latStr)
  const lng = Number(lngStr)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()
  const near = parseNear(searchParams.get('near'))

  if (q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ courses: [] })
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Escape the LIKE wildcards a user might legitimately type in a course name.
  const pattern = `%${q.replace(/[%_]/g, (c) => `\\${c}`)}%`

  const { data, error } = await supabase
    .from('courses')
    .select('id, name, address, city, state, lat, lng, timezone, access, par')
    .ilike('name', pattern)
    .limit(CANDIDATE_LIMIT)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const courses = (data || []) as CourseResult[]
  const lower = q.toLowerCase()

  const ranked = courses.slice().sort((a, b) => {
    // A name that starts with the query beats one that merely contains it.
    const aPrefix = a.name.toLowerCase().startsWith(lower) ? 0 : 1
    const bPrefix = b.name.toLowerCase().startsWith(lower) ? 0 : 1
    if (aPrefix !== bPrefix) return aPrefix - bPrefix

    // Then bias toward the trip destination — the course they want is almost always
    // near where they are already going.
    if (near) {
      const aHas = a.lat != null && a.lng != null
      const bHas = b.lat != null && b.lng != null
      if (aHas && bHas) {
        const d = distanceKm(near.lat, near.lng, a.lat!, a.lng!) -
          distanceKm(near.lat, near.lng, b.lat!, b.lng!)
        if (Math.abs(d) > 1) return d
      } else if (aHas !== bHas) {
        return aHas ? -1 : 1
      }
    }

    return a.name.localeCompare(b.name)
  })

  return NextResponse.json({ courses: ranked.slice(0, RESULT_LIMIT) })
}
