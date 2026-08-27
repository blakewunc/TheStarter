-- Migration 020: Courses reference table + typed itinerary events + tee time merge
--
-- Three things happen here, in order:
--   1. Create a `courses` reference table (name, address, coords, timezone, access).
--   2. Give `itinerary_items` an event-type discriminator plus venue/tee-time columns.
--   3. Merge `golf_tee_times` into `itinerary_items` as item_type = 'tee_time',
--      preserving each row's UUID so the scoring/betting foreign keys can simply be
--      repointed instead of rewritten.
--
-- TIMEZONE NOTE ON THE MERGE (read before running):
--   `golf_tee_times.tee_time` is TIMESTAMPTZ, written by the browser as
--   `new Date(`${date}T${time}`).toISOString()` — i.e. the organizer's local wall clock
--   converted to UTC, with the originating offset not recorded. Recovering the wall clock
--   therefore requires assuming a zone. We assume America/New_York.
--
--   Why that is safe for the DATE: US tee times are morning-to-afternoon local, and every
--   US zone is UTC-4..UTC-10, so the UTC instant lands on the same calendar day. The date
--   survives regardless of which US zone the organizer was actually in.
--
--   Why the TIME may be off: a 8:40am Pacific tee time reads back as 11:40am Eastern.
--   The original instant is preserved verbatim in `legacy_tee_time` so nothing is lost and
--   any row can be recomputed later. If your trips were authored predominantly outside US
--   Eastern, change the two 'America/New_York' literals below before running.

-- =====================================================
-- 1. COURSES
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  timezone TEXT,
  access TEXT CHECK (access IN ('public', 'resort', 'private', 'municipal', 'semi_private')),
  holes INTEGER,
  par INTEGER,
  google_place_id TEXT UNIQUE,
  -- OpenStreetMap id ("way/12345"), kept for provenance and idempotent re-seeding.
  osm_id TEXT UNIQUE,
  -- 'seed' = shipped reference data, 'user' = written back from a free-text entry,
  -- 'places' = resolved via Google Places
  source TEXT NOT NULL DEFAULT 'seed' CHECK (source IN ('seed', 'user', 'places')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigram index powers fuzzy name search (ilike '%query%' stays sargable).
CREATE INDEX IF NOT EXISTS idx_courses_name_trgm
  ON public.courses USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_courses_state ON public.courses(state);
CREATE INDEX IF NOT EXISTS idx_courses_latlng ON public.courses(lat, lng);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Courses are shared reference data: any signed-in user may read them.
CREATE POLICY "Authenticated users can view courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (true);

-- No INSERT, UPDATE or DELETE policy: courses are read-only from the client.
--
-- Write-back (promoting a free-text entry into a real course row) is deliberately NOT
-- exposed here. A client-side insert path would let any signed-in user push unvalidated
-- rows into every other user's search results, and free text is typo-prone by nature.
-- When write-back lands it should run server-side under the service role with
-- de-duplication against existing rows. Seeding likewise uses the service role.

-- =====================================================
-- 2. TYPED ITINERARY EVENTS
-- =====================================================

ALTER TABLE public.itinerary_items
  ADD COLUMN IF NOT EXISTS item_type TEXT NOT NULL DEFAULT 'other'
    CHECK (item_type IN ('tee_time', 'lodging', 'meal', 'travel', 'other')),
  ADD COLUMN IF NOT EXISTS end_time TIME,
  ADD COLUMN IF NOT EXISTS all_day BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS course_name TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS num_players INTEGER,
  ADD COLUMN IF NOT EXISTS players UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS par INTEGER,
  ADD COLUMN IF NOT EXISTS booking_confirmation TEXT,
  ADD COLUMN IF NOT EXISTS legacy_tee_time TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_itinerary_items_type ON public.itinerary_items(item_type);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_course ON public.itinerary_items(course_id);

-- =====================================================
-- 3. MERGE golf_tee_times -> itinerary_items
-- =====================================================

-- Same UUID is carried over, which is what makes step 4 a constraint swap rather than
-- a data migration. ON CONFLICT DO NOTHING makes this re-runnable.
INSERT INTO public.itinerary_items (
  id, trip_id, date, time, title, description, location,
  item_type, course_name, address, num_players, players, par,
  legacy_tee_time, created_by, created_at, updated_at
)
SELECT
  t.id,
  t.trip_id,
  (t.tee_time AT TIME ZONE 'America/New_York')::date,
  (t.tee_time AT TIME ZONE 'America/New_York')::time,
  t.course_name,
  t.notes,
  t.course_location,
  'tee_time',
  t.course_name,
  t.course_location,
  t.num_players,
  COALESCE(t.players, '{}'),
  t.par,
  t.tee_time,
  t.created_by,
  t.created_at,
  t.updated_at
FROM public.golf_tee_times t
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. REPOINT FOREIGN KEYS
-- =====================================================
-- The UUIDs are unchanged, so golf_scores.tee_time_id and golf_bets.tee_time_id already
-- hold values that now exist in itinerary_items. Only the constraint target moves.

ALTER TABLE public.golf_scores DROP CONSTRAINT IF EXISTS golf_scores_tee_time_id_fkey;
ALTER TABLE public.golf_scores
  ADD CONSTRAINT golf_scores_tee_time_id_fkey
  FOREIGN KEY (tee_time_id) REFERENCES public.itinerary_items(id) ON DELETE CASCADE;

ALTER TABLE public.golf_bets DROP CONSTRAINT IF EXISTS golf_bets_tee_time_id_fkey;
ALTER TABLE public.golf_bets
  ADD CONSTRAINT golf_bets_tee_time_id_fkey
  FOREIGN KEY (tee_time_id) REFERENCES public.itinerary_items(id) ON DELETE SET NULL;

-- =====================================================
-- 5. RETIRE THE OLD TABLE
-- =====================================================
-- Renamed rather than dropped so the pre-merge rows stay recoverable. Once the merge is
-- verified in production, drop it manually:
--   DROP TABLE public.golf_tee_times_deprecated;

ALTER TABLE IF EXISTS public.golf_tee_times RENAME TO golf_tee_times_deprecated;

-- itinerary_items is already in the supabase_realtime publication with REPLICA IDENTITY
-- FULL (migration 003), so tee times gain realtime as a side effect of the merge.
-- golf_tee_times never was in that publication, which is why the existing
-- useGolfTeeTimes subscription never fired.
