-- Migration 026: let an invitee RSVP without making an account
--
-- E.8. The shared link is the entire experience for seven of the eight people on a
-- trip, and today it dead-ends at /login: saying "I'm in" requires creating a password
-- account first. That is the wall the 60-year-old invitee walks into, and it is also
-- where the growth loop leaks.
--
-- pending_invites cannot carry this. It is organiser-driven (invited_by is NOT NULL,
-- the organiser adds someone by email) and has no RSVP state.

CREATE TABLE IF NOT EXISTS public.invite_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  rsvp_status TEXT NOT NULL CHECK (rsvp_status IN ('accepted', 'declined', 'maybe')),
  -- Set when the responder later signs in with a matching email, which is what turns
  -- an unverified response into a real member.
  claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- One response per person per trip, so changing your mind updates rather than adds.
--
-- Two things this index deliberately is not:
--   Not on lower(email). The route lowercases before writing, and ON CONFLICT cannot
--   target an expression index.
--   Not partial. A partial index can only be targeted by restating its predicate in the
--   ON CONFLICT clause, which PostgREST's onConflict parameter cannot express — the
--   upsert fails with "no unique or exclusion constraint matching", so changing your
--   answer would error.
--
-- A plain unique index is safe here because Postgres treats NULLs as distinct: several
-- responses with no email happily coexist, while emails still deduplicate.
CREATE UNIQUE INDEX IF NOT EXISTS idx_invite_responses_trip_email
  ON public.invite_responses(trip_id, email);

CREATE INDEX IF NOT EXISTS idx_invite_responses_trip ON public.invite_responses(trip_id);

ALTER TABLE public.invite_responses ENABLE ROW LEVEL SECURITY;

-- Trip members can read responses; that is the point of collecting them.
DROP POLICY IF EXISTS "Trip members can view invite responses" ON public.invite_responses;
CREATE POLICY "Trip members can view invite responses"
  ON public.invite_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = invite_responses.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

-- No INSERT or UPDATE policy on purpose. Responses are written server-side after the
-- route has checked the invite code, so a valid link is required and the table cannot
-- be written to directly by anyone who guesses a trip id.
--
-- Worth being clear about what this does and does not prove: anyone holding the link
-- can respond under any name, exactly like a shared form. These are unverified by
-- construction, they are surfaced to the organiser as such, and they never grant
-- access to the trip — only trip_members does that.

-- E.8 also asks for the public pitch page to be on by default. It is the shared link
-- that does the selling, and defaulting it off means most trips never have one.
ALTER TABLE public.trips ALTER COLUMN proposal_enabled SET DEFAULT true;
