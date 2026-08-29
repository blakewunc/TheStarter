-- Migration 030: club members can see each other's rounds
--
-- D.3. Standings rank a club by rounds played, but the rounds policy from 029 only
-- admits your own rounds plus those of people you have shared a *trip* with.
--
-- The Club exists precisely for people who do not travel together — the Charlotte-vs-
-- Austin case the brief describes. Under the trip-only policy those members are
-- invisible to each other, so a standings table would show them with no rounds and no
-- index: not an error, just quietly and confidently wrong, which is the failure mode
-- that makes people stop trusting a league.

DROP POLICY IF EXISTS "Club members can read rounds" ON public.rounds;
CREATE POLICY "Club members can read rounds"
  ON public.rounds FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_members mine
      JOIN public.group_members theirs ON theirs.group_id = mine.group_id
      WHERE mine.user_id = auth.uid()
        AND theirs.user_id = rounds.user_id
    )
  );

-- This sits alongside the trip-companion policy rather than replacing it: Postgres ORs
-- permissive policies together, so a round is readable if either relationship holds.
-- Sharing a club is a deliberate act by both people, the same as sharing a trip, so it
-- is the same standard of consent — and it still exposes nothing to a stranger.
