/**
 * Seed script — loads the US golf course reference table.
 *
 * Data source: OpenStreetMap, queried via the QLever SPARQL endpoint for the OSM planet
 * (https://qlever.dev/api/osm-planet) for objects tagged leisure=golf_course within the
 * United States, with centroids derived from each object's geometry.
 *
 * Licence: Open Database License (ODbL) 1.0 — © OpenStreetMap contributors.
 * https://www.openstreetmap.org/copyright
 *
 * Upserts on osm_id, so re-running refreshes rows in place rather than duplicating them.
 * Rows added by users (source = 'user') are never touched.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (or env) — the courses table has no
 * client-side insert policy for seed rows.
 *
 * Run:
 *   npx tsx scripts/seed-courses.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CSV_PATH = path.resolve(process.cwd(), 'scripts/data/courses.csv')
const BATCH_SIZE = 500

/** Minimal RFC-4180 parser — the file contains quoted fields with embedded commas. */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...body] = rows
  return body
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])))
}

function nullIfBlank(s: string | undefined): string | null {
  const t = (s || '').trim()
  return t.length > 0 ? t : null
}

async function main() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local.')
    process.exit(1)
  }

  const raw = fs.readFileSync(CSV_PATH, 'utf8')
  const records = parseCsv(raw)
  console.log(`Parsed ${records.length} courses from ${path.relative(process.cwd(), CSV_PATH)}`)

  const rows = records.map((r) => ({
    osm_id: r.osm_id,
    name: r.name,
    address: nullIfBlank(r.address),
    city: nullIfBlank(r.city),
    state: nullIfBlank(r.state),
    country: 'US',
    lat: Number(r.lat),
    lng: Number(r.lng),
    // Deliberately left null: OpenStreetMap carries no reliable IANA zone for these,
    // and a guessed timezone is worse than an absent one. Nothing reads it yet — date
    // and time are stored as venue wall clock, so display is unaffected.
    timezone: null as string | null,
    access: nullIfBlank(r.access),
    holes: r.holes ? Number(r.holes) : null,
    source: 'seed' as const,
  }))

  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('courses')
      .upsert(batch, { onConflict: 'osm_id', ignoreDuplicates: false })

    if (error) {
      console.error(`Batch at offset ${i} failed:`, error.message)
      process.exit(1)
    }

    inserted += batch.length
    process.stdout.write(`\rSeeded ${inserted}/${rows.length}`)
  }

  console.log(`\nDone. ${inserted} courses upserted.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
