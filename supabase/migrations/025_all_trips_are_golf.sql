-- Migration 025: The Starter is a golf product, so a trip is a golf trip
--
-- The schema inherited a trip_type discriminator from when this codebase served
-- bachelor, bachelorette, ski and general trips as well as golf. The product has since
-- narrowed to golf only, but the column default stayed 'general' — and because
-- createTripSchema was silently dropping trip_type (zod strips unknown keys), every
-- trip created through the form landed on that default and lost its golf features.

-- New trips default to golf rather than general.
ALTER TABLE public.trips ALTER COLUMN trip_type SET DEFAULT 'golf';

-- Backfill the trips the dropped-field bug mislabelled.
--
-- Deliberately scoped to 'general' and NULL. Rows explicitly set to 'ski',
-- 'bachelor_party' or 'bachelorette_party' were a real choice someone made in the
-- older product, and silently rewriting them would destroy that intent with no way
-- back. If those should also become golf trips, that is a judgement call to make
-- knowingly:
--
--   UPDATE public.trips SET trip_type = 'golf' WHERE trip_type <> 'golf';
--
-- To see what is there before deciding:
--
--   SELECT trip_type, count(*) FROM public.trips GROUP BY trip_type ORDER BY 2 DESC;

UPDATE public.trips
   SET trip_type = 'golf'
 WHERE trip_type IS NULL
    OR trip_type = 'general';
