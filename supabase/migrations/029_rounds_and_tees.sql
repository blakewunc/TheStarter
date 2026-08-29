-- Migration 029: a round is the atomic unit
--
-- D.1. The trip is annual; a round is weekly. Everything the club needs — standings,
-- rivalries, the ticker — derives from rounds, and posting one has to be the fastest
-- thing in the app: course, tees, score, done.
--
-- WHOSE ROUND: the brief specifies rounds.golfer_id, but golfers (migration 028) is a
-- per-owner address book — two organisers keep separate entries for the same person.
-- Keying a round to one of those would attach a score to somebody's contact card rather
-- than to the player, and the same round would exist twice with different owners.
-- Rounds key to profiles, the identity everything else already uses.

-- =====================================================
-- TEE SETS — the hard dependency (D.2)
-- =====================================================
-- Comparing a round in Charlotte to a round in Austin needs course rating and slope per
-- tee set, not gross scores. That data is not openly licensed, so it is crowdsourced:
-- the first person to log a round at a course enters it once, and it is there for
-- everyone afterwards.
--
-- entered_by is kept so a wrong value is traceable and correctable rather than
-- anonymous. Nothing here is treated as authoritative — see the note on rounds below.

CREATE TABLE IF NOT EXISTS public.course_tees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  -- "Blue", "White", "Championship" — whatever the card calls them.
  tee_set TEXT NOT NULL,
  -- USGA course rating: strokes a scratch golfer is expected to take. Typically 62-78.
  course_rating NUMERIC(4,1) NOT NULL CHECK (course_rating BETWEEN 55 AND 85),
  -- Slope: difficulty for a bogey golfer relative to scratch. 55-155, 113 is neutral.
  slope INTEGER NOT NULL CHECK (slope BETWEEN 55 AND 155),
  par INTEGER NOT NULL CHECK (par BETWEEN 27 AND 80),
  yardage INTEGER,
  -- Stroke index per hole, 1-18. Needed for Stableford and skins (D.3 phase 2), and a
  -- heavier ask than rating/slope, so it stays optional.
  hole_stroke_index JSONB,
  entered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_tees_unique
  ON public.course_tees(course_id, lower(tee_set));
CREATE INDEX IF NOT EXISTS idx_course_tees_course ON public.course_tees(course_id);

ALTER TABLE public.course_tees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone signed in can read tee sets" ON public.course_tees;
CREATE POLICY "Anyone signed in can read tee sets"
  ON public.course_tees FOR SELECT TO authenticated USING (true);

-- Crowdsourced, so signed-in users may add and correct. The alternative is that the
-- data never arrives, which makes the whole of Workstream D inert.
DROP POLICY IF EXISTS "Signed in users can add tee sets" ON public.course_tees;
CREATE POLICY "Signed in users can add tee sets"
  ON public.course_tees FOR INSERT TO authenticated WITH CHECK (auth.uid() = entered_by);

DROP POLICY IF EXISTS "Signed in users can correct tee sets" ON public.course_tees;
CREATE POLICY "Signed in users can correct tee sets"
  ON public.course_tees FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- ROUNDS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.rounds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Null when the course is not in the seeded table; course_name always carries what
  -- the player typed. Same rule as tee times: a course we do not know must never block
  -- someone posting a score.
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  course_name TEXT NOT NULL,
  -- Null until the tee set has rating and slope entered. A round without it still
  -- counts as a round played; it just cannot enter a cross-course standing.
  tee_id UUID REFERENCES public.course_tees(id) ON DELETE SET NULL,

  played_on DATE NOT NULL,
  gross_score INTEGER CHECK (gross_score BETWEEN 18 AND 200),
  -- Per-hole scores, optional. Unlocks Stableford and skins later.
  hole_scores JSONB,

  -- True when the round is attached to a trip or attested by another member. D.4
  -- weights verified rounds more heavily than solo posts, because people lie.
  verified BOOLEAN NOT NULL DEFAULT false,
  -- Set when the round came from a trip's scorecard rather than being posted solo.
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rounds_user ON public.rounds(user_id, played_on DESC);
CREATE INDEX IF NOT EXISTS idx_rounds_course ON public.rounds(course_id);
CREATE INDEX IF NOT EXISTS idx_rounds_played ON public.rounds(played_on DESC);

ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

-- Own rounds, always.
DROP POLICY IF EXISTS "Users manage their own rounds" ON public.rounds;
CREATE POLICY "Users manage their own rounds"
  ON public.rounds FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- And rounds of people you have been on a trip with, which is what makes a standing or
-- a head-to-head possible without exposing scores to strangers.
DROP POLICY IF EXISTS "Trip companions can read rounds" ON public.rounds;
CREATE POLICY "Trip companions can read rounds"
  ON public.rounds FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.trip_members mine
      JOIN public.trip_members theirs ON theirs.trip_id = mine.trip_id
      WHERE mine.user_id = auth.uid()
        AND theirs.user_id = rounds.user_id
    )
  );

COMMENT ON TABLE public.rounds IS
  'One posted round. The atomic unit of the club: standings, rivalries and the ticker all derive from these.';
COMMENT ON COLUMN public.rounds.tee_id IS
  'Null until the tee set has rating and slope. The round still counts; it just cannot be compared across courses.';
