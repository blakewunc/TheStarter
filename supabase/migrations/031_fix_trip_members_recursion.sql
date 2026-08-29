-- Migration 031: break the recursive trip_members policy
--
-- The SELECT policy from migration 002 reads:
--
--   auth.uid() IN (SELECT user_id FROM public.trip_members tm2
--                  WHERE tm2.trip_id = trip_members.trip_id)
--
-- A policy on trip_members that queries trip_members re-triggers its own policy, and
-- Postgres stops with "infinite recursion detected in policy for relation
-- trip_members". Verified locally: a plain SELECT on trip_members as an authenticated
-- user fails, and so does any policy that reads it — including the rounds policy added
-- in 029, which is how this surfaced.
--
-- IMPORTANT, BEFORE RUNNING: this deployment is known to have skipped migrations
-- before, so the policy in production may not match what 002 defines. Check first:
--
--   SELECT policyname, qual FROM pg_policies
--    WHERE schemaname='public' AND tablename='trip_members' AND cmd='SELECT';
--
-- If the live policy is already something else and the app works, this migration
-- replaces a working policy with an equivalent, non-recursive one — still an
-- improvement, but worth knowing it is a change rather than purely a fix.

-- SECURITY DEFINER runs as the function owner, so the lookup inside does not re-enter
-- the caller's RLS. That is the whole mechanism, and it is why the body must stay
-- narrow: it answers exactly one question and returns a boolean.
--
-- search_path is pinned so the function cannot be redirected at a table someone else
-- controls — the standard hardening for any SECURITY DEFINER function.
CREATE OR REPLACE FUNCTION public.is_trip_member(p_trip_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_id = p_trip_id
      AND user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_trip_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_trip_member(UUID) TO authenticated;

-- Same rule as before — you can see the membership rows of trips you are on — expressed
-- without the self-reference.
--
-- Dropped by enumeration rather than by name. Permissive policies are ORed together, so
-- leaving the old one in place would keep the recursion no matter what the new one says,
-- and a DROP that silently matches nothing would look like it worked. This deployment
-- has diverged from the migration files before, so the live name is not something to
-- assume.
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'trip_members' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.trip_members', pol.policyname);
  END LOOP;
END $$;
CREATE POLICY "Trip members can view membership"
  ON public.trip_members FOR SELECT
  USING (
    -- Your own row, always: needed so the helper has something to find in the first
    -- place, and so a member can always see that they are on the trip.
    user_id = auth.uid()
    OR public.is_trip_member(trip_id)
  );

-- Rewrite the 029 rounds policy through the same helper, for the same reason.
DROP POLICY IF EXISTS "Trip companions can read rounds" ON public.rounds;
CREATE POLICY "Trip companions can read rounds"
  ON public.rounds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members theirs
      WHERE theirs.user_id = rounds.user_id
        AND public.is_trip_member(theirs.trip_id)
    )
  );


-- =====================================================
-- group_members has the same shape
-- =====================================================
-- Migration 017's policy queries group_members from inside group_members' own policy.
-- It recurses for exactly the same reason, and it surfaced the moment the club-standings
-- policy in 030 tried to read it. Same fix.

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id
      AND user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_group_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO authenticated;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'group_members' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.group_members', pol.policyname);
  END LOOP;
END $$;
CREATE POLICY "Group members can view membership"
  ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_group_member(group_id)
  );

-- And the club-rounds policy from 030, through the helper.
DROP POLICY IF EXISTS "Club members can read rounds" ON public.rounds;
CREATE POLICY "Club members can read rounds"
  ON public.rounds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members theirs
      WHERE theirs.user_id = rounds.user_id
        AND public.is_group_member(theirs.group_id)
    )
  );
