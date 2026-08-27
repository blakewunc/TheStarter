-- Migration 022: multiple properties per trip, lodging <-> budget link, wall-clock stays
--
-- Three changes:
--   1. A trip may have more than one property (drops the UNIQUE on accommodations.trip_id).
--   2. A budget category can point at a property, so cost and logistics are one thing
--      viewed from two places rather than two things typed twice.
--   3. check_in / check_out become a calendar date plus a wall clock at the property,
--      for the same reason tee times did in migration 020.
--
-- TIMEZONE NOTE, same as 020: check_in / check_out are TIMESTAMPTZ with no record of the
-- originating offset, so recovering the wall clock means assuming a zone. We assume
-- America/New_York. Hotel check-ins are afternoon local and check-outs late morning, and
-- every US zone is UTC-4..UTC-10, so the calendar day survives regardless of which US zone
-- the organiser was actually in; only the clock time can be off, and the original instants
-- are preserved in legacy_check_in / legacy_check_out. Change the literals below if your
-- trips were authored predominantly outside US Eastern.

-- =====================================================
-- 1. MULTIPLE PROPERTIES PER TRIP
-- =====================================================
-- Auto-generated name from migration 007. IF EXISTS keeps this re-runnable and tolerant
-- of a deployment where the constraint was never created under that name.

ALTER TABLE public.accommodations DROP CONSTRAINT IF EXISTS accommodations_trip_id_key;

CREATE INDEX IF NOT EXISTS idx_accommodations_trip_id ON public.accommodations(trip_id);

-- =====================================================
-- 2. PROPERTY DETAILS
-- =====================================================
-- Deliberately no cost column here. Money lives on budget_categories.estimated_cost so
-- there is exactly one source of truth; the lodging card reads it through the link below.
-- Two editable cost fields that must agree is a reconciliation bug waiting to happen.

ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS booking_url TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_number TEXT,
  ADD COLUMN IF NOT EXISTS check_in_date DATE,
  ADD COLUMN IF NOT EXISTS check_in_time TIME,
  ADD COLUMN IF NOT EXISTS check_out_date DATE,
  ADD COLUMN IF NOT EXISTS check_out_time TIME,
  ADD COLUMN IF NOT EXISTS legacy_check_in TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS legacy_check_out TIMESTAMPTZ;

-- Backfill the split fields from the old timestamps, once, only where not already set.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'accommodations' AND column_name = 'check_in'
  ) THEN
    EXECUTE $q$
      UPDATE public.accommodations
         SET check_in_date   = COALESCE(check_in_date,  (check_in  AT TIME ZONE 'America/New_York')::date),
             check_in_time   = COALESCE(check_in_time,  (check_in  AT TIME ZONE 'America/New_York')::time),
             legacy_check_in = COALESCE(legacy_check_in, check_in)
       WHERE check_in IS NOT NULL
    $q$;
    EXECUTE $q$
      UPDATE public.accommodations
         SET check_out_date   = COALESCE(check_out_date,  (check_out AT TIME ZONE 'America/New_York')::date),
             check_out_time   = COALESCE(check_out_time,  (check_out AT TIME ZONE 'America/New_York')::time),
             legacy_check_out = COALESCE(legacy_check_out, check_out)
       WHERE check_out IS NOT NULL
    $q$;
  END IF;
END $$;

-- The old TIMESTAMPTZ columns are left in place rather than dropped, so nothing that still
-- reads them breaks and the pre-split values stay recoverable. Drop them once every reader
-- has moved to the date/time pair.

-- =====================================================
-- 3. LODGING <-> BUDGET LINK
-- =====================================================

ALTER TABLE public.budget_categories
  ADD COLUMN IF NOT EXISTS accommodation_id UUID
    REFERENCES public.accommodations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_type TEXT NOT NULL DEFAULT 'other'
    CHECK (category_type IN ('lodging', 'travel', 'food', 'golf', 'activity', 'other'));

CREATE INDEX IF NOT EXISTS idx_budget_categories_accommodation
  ON public.budget_categories(accommodation_id);

-- A property is referenced by at most one budget category, so "the cost of this stay" is
-- unambiguous. Partial index: many categories may have a NULL accommodation_id.
CREATE UNIQUE INDEX IF NOT EXISTS idx_budget_categories_accommodation_unique
  ON public.budget_categories(accommodation_id)
  WHERE accommodation_id IS NOT NULL;
