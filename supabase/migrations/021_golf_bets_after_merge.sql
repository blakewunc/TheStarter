-- Migration 021: golf_bets, for databases that reached 020 without applying 016_golf_bets
--
-- 016_golf_bets.sql declares tee_time_id as a foreign key to golf_tee_times. Migration 020
-- renames that table to golf_tee_times_deprecated, so on a database where 016 was skipped,
-- 016 can no longer be applied as written — its foreign key has nothing to point at.
--
-- This is 016 with a single change: tee_time_id references itinerary_items, which is where
-- tee times live after the merge. That is exactly the target 020 would have repointed it to
-- had the table existed at the time.
--
-- Skip this entirely if golf_bets already exists. Check with:
--   SELECT to_regclass('public.golf_bets');

CREATE TABLE IF NOT EXISTS public.golf_bets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  -- The only line that differs from 016: post-merge, a "tee time" is an itinerary_items
  -- row with item_type = 'tee_time'.
  tee_time_id UUID REFERENCES public.itinerary_items(id) ON DELETE SET NULL,
  bet_type TEXT NOT NULL CHECK (bet_type IN ('low_gross', 'low_net', 'closest_to_pin', 'longest_drive', 'nassau', 'skins', 'custom')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  participants UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'settled')),
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expense_id UUID REFERENCES public.shared_expenses(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_golf_bets_trip_id ON public.golf_bets(trip_id);
CREATE INDEX IF NOT EXISTS idx_golf_bets_status ON public.golf_bets(status);
CREATE INDEX IF NOT EXISTS idx_golf_bets_tee_time ON public.golf_bets(tee_time_id);

ALTER TABLE public.golf_bets ENABLE ROW LEVEL SECURITY;

-- Policies match 016 exactly. Dropped first so this file stays re-runnable.
DROP POLICY IF EXISTS "Trip members can view golf bets" ON public.golf_bets;
CREATE POLICY "Trip members can view golf bets"
  ON public.golf_bets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_bets.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Trip members can create golf bets" ON public.golf_bets;
CREATE POLICY "Trip members can create golf bets"
  ON public.golf_bets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_bets.trip_id
      AND trip_members.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

DROP POLICY IF EXISTS "Creators and organizers can update golf bets" ON public.golf_bets;
CREATE POLICY "Creators and organizers can update golf bets"
  ON public.golf_bets FOR UPDATE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_bets.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'organizer'
    )
  );

DROP POLICY IF EXISTS "Creators and organizers can delete golf bets" ON public.golf_bets;
CREATE POLICY "Creators and organizers can delete golf bets"
  ON public.golf_bets FOR DELETE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_bets.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'organizer'
    )
  );

-- Guarded: re-adding a table already in the publication is an error.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'golf_bets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.golf_bets;
  END IF;
END $$;
