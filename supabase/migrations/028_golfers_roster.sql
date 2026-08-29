-- Migration 028: the crew, as something that survives a trip
--
-- Workstream C.1. Today a person exists only as an attendee inside one trip, so trip #2
-- starts from an empty form. The roster is the asset; the trip is the event. Carrying
-- the roster, the preferences and the split rules is the switching cost, and it is the
-- only thing here a competitor cannot clone in a weekend.
--
-- WHAT THIS IS NOT: a replacement for profiles. Thirty-nine columns across this schema
-- reference profiles(id) — scores, bets, matches, expenses, comments. Repointing
-- trip_members at golfers would cascade through all of them for no user-visible gain.
-- profiles remains identity; golfers is the organiser's address book beside it, and the
-- two are joined by linked_user_id when the same person is both.
--
-- Never called a CRM in the UI. It is "your crew".

CREATE TABLE IF NOT EXISTS public.golfers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  -- Whose address book this entry belongs to. A golfer is not a global record: two
  -- organisers who both play with the same person each keep their own entry, with
  -- their own notes, because "Marcus RSVPs late" is one organiser's observation.
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- Set when this person has an account. Null for someone who has only ever been a
  -- name and a phone number, which is most of a crew.
  linked_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Self-reported. D.4 will compute a separate index from posted rounds; this is what
  -- they say, not what the maths says, and the two are deliberately different columns.
  handicap_index NUMERIC(4,1),
  home_course TEXT,
  city TEXT,

  -- "venmo @handle", "zelle 555…", "cash only". Free text: the point is that the
  -- organiser stops asking every year, not that the app processes a payment.
  pays_via TEXT,

  -- walk|ride, early|late tee times, room sharing, dietary notes, club rental.
  -- jsonb because this list will grow and none of it is worth a migration each time.
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- One entry per person per address book, when that person has an account.
CREATE UNIQUE INDEX IF NOT EXISTS idx_golfers_owner_linked
  ON public.golfers(owner_id, linked_user_id)
  WHERE linked_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_golfers_owner ON public.golfers(owner_id);
CREATE INDEX IF NOT EXISTS idx_golfers_owner_name ON public.golfers(owner_id, lower(full_name));

ALTER TABLE public.golfers ENABLE ROW LEVEL SECURITY;

-- An address book is private. These rows hold phone numbers, payment handles and
-- freeform notes an organiser wrote about their friends; nobody else reads them.
DROP POLICY IF EXISTS "Owners manage their own crew" ON public.golfers;
CREATE POLICY "Owners manage their own crew"
  ON public.golfers FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Links a membership back to the roster entry, so history accrues per golfer (C.2)
-- without moving the identity graph off profiles.
ALTER TABLE public.trip_members
  ADD COLUMN IF NOT EXISTS golfer_id UUID REFERENCES public.golfers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_trip_members_golfer ON public.trip_members(golfer_id);

-- =====================================================
-- BACKFILL
-- =====================================================
-- Seed each organiser's roster from everyone they have actually been on a trip with,
-- so the crew list is useful on day one rather than empty until someone types it in.

INSERT INTO public.golfers (owner_id, linked_user_id, full_name, email)
SELECT DISTINCT
  organiser.user_id                                   AS owner_id,
  attendee.user_id                                    AS linked_user_id,
  COALESCE(p.display_name, split_part(p.email, '@', 1), 'Unknown') AS full_name,
  p.email
FROM public.trip_members organiser
JOIN public.trip_members attendee
  ON attendee.trip_id = organiser.trip_id
 AND attendee.user_id <> organiser.user_id
JOIN public.profiles p ON p.id = attendee.user_id
WHERE organiser.role = 'organizer'
ON CONFLICT DO NOTHING;

-- Point existing memberships at the roster entry now that it exists.
UPDATE public.trip_members tm
   SET golfer_id = g.id
  FROM public.golfers g,
       public.trip_members organiser
 WHERE organiser.trip_id = tm.trip_id
   AND organiser.role = 'organizer'
   AND g.owner_id = organiser.user_id
   AND g.linked_user_id = tm.user_id
   AND tm.golfer_id IS NULL;
