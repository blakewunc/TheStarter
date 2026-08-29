-- Migration 027: archive a trip without deleting it
--
-- E.5. The trips list shows everything ever created, forever. An organiser who has run
-- three annual trips is scrolling past two dead ones to reach the live one, and the
-- only alternative today is deleting a trip — which takes the itinerary, the scores,
-- the settled expenses and the recap with it.
--
-- A timestamp rather than a status value. `status` already means where the trip is in
-- its own lifecycle (planning, confirmed, completed, cancelled), and archiving is
-- orthogonal to that: a completed trip and a cancelled one can both be archived, and
-- overloading status would make "completed" and "archived" mutually exclusive when
-- they are not. It also records *when*, which a status enum cannot.

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Partial: the common query is "the trips that are not archived", and most rows have
-- a NULL here, so indexing only the archived ones keeps it small.
CREATE INDEX IF NOT EXISTS idx_trips_archived
  ON public.trips(archived_at)
  WHERE archived_at IS NOT NULL;

COMMENT ON COLUMN public.trips.archived_at IS
  'Set when an organizer archives a trip. Hidden from the default list, never deleted. Orthogonal to status.';
