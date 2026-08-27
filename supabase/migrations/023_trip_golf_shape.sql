-- Migration 023: give a trip its golf shape at creation
--
-- A trip is currently created with title, destination, dates, headcount and budget, then
-- retrofitted into a golf trip through the Itinerary tab. These columns let the create
-- form capture the shape up front, which is also what the AI draft needs somewhere to land.

ALTER TABLE public.trips
  -- How many rounds the group intends to play. Distinct from tee times actually booked,
  -- which live in itinerary_items — this is the plan, those are the facts.
  ADD COLUMN IF NOT EXISTS rounds_planned INTEGER,
  -- Courses the group hopes to play, as free text. Deliberately not FKs to courses:
  -- at create time people type "Pinehurst" meaning the resort, not a specific course,
  -- and forcing a match here would block the form for the sake of tidy data.
  ADD COLUMN IF NOT EXISTS target_courses TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS default_format TEXT
    CHECK (default_format IN ('nassau', 'skins', 'wolf', 'stroke_play')),
  -- Free text on purpose: "$10 per side", "beers", "dinner's on the loser".
  ADD COLUMN IF NOT EXISTS stakes TEXT;

COMMENT ON COLUMN public.trips.rounds_planned IS
  'Intended number of rounds. Booked tee times live in itinerary_items.';
COMMENT ON COLUMN public.trips.target_courses IS
  'Free-text course wishlist captured at trip creation; not linked to public.courses.';
