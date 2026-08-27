-- Which migrations have actually been applied to this database?
-- Checks for the objects each migration creates. Read-only, safe to run anytime.

WITH expected(migration, kind, obj, col) AS (VALUES
  ('001 initial',            'table',  'trips',                 NULL),
  ('001 initial',            'table',  'itinerary_items',       NULL),
  ('001 initial',            'table',  'shared_expenses',       NULL),
  ('005 payment profiles',   'column', 'profiles',              'venmo_handle'),
  ('005 payment profiles',   'table',  'settlements',           NULL),
  ('006 supplies',           'table',  'supply_items',          NULL),
  ('007 accommodation',      'table',  'accommodations',        NULL),
  ('007 accommodation',      'table',  'transportation',        NULL),
  ('008 availability',       'table',  'user_availability',     NULL),
  ('008 availability',       'table',  'trip_announcements',    NULL),
  ('009 sport modules',      'column', 'trips',                 'trip_type'),
  ('009 sport modules',      'table',  'golf_tee_times',        NULL),
  ('009 sport modules',      'table',  'golf_scores',           NULL),
  ('011 budget caps',        'column', 'trip_members',          'budget_cap'),
  ('011 budget caps',        'table',  'activity_suggestions',  NULL),
  ('011 budget caps',        'table',  'pending_invites',       NULL),
  ('012 golf handicap',      'column', 'golf_equipment',        'handicap'),
  ('013 par + ratings',      'column', 'golf_tee_times',        'par'),
  ('013 par + ratings',      'table',  'golf_course_ratings',   NULL),
  ('013 profile handicap',   'column', 'profiles',              'handicap'),
  ('013 profile handicap',   'column', 'profiles',              'phone'),
  ('014 expected guests',    'column', 'trips',                 'expected_guests'),
  ('015 cover photo',        'column', 'trips',                 'cover_image_url'),
  ('016 admin role',         'column', 'profiles',              'is_admin'),
  ('016 golf bets',          'table',  'golf_bets',             NULL),
  ('017 groups + league',    'table',  'competitions',          NULL),
  ('017 groups + league',    'table',  'matches',               NULL),
  ('019 match reactions',    'table',  'match_reactions',       NULL),
  -- Every column 020 adds is listed. A partial check here previously reported 020 as
  -- applied while the column the API was actually failing on went unverified.
  ('020 courses + events',   'table',  'courses',               NULL),
  ('020 courses + events',   'column', 'itinerary_items',       'item_type'),
  ('020 courses + events',   'column', 'itinerary_items',       'end_time'),
  ('020 courses + events',   'column', 'itinerary_items',       'all_day'),
  ('020 courses + events',   'column', 'itinerary_items',       'timezone'),
  ('020 courses + events',   'column', 'itinerary_items',       'course_id'),
  ('020 courses + events',   'column', 'itinerary_items',       'course_name'),
  ('020 courses + events',   'column', 'itinerary_items',       'address'),
  ('020 courses + events',   'column', 'itinerary_items',       'lat'),
  ('020 courses + events',   'column', 'itinerary_items',       'lng'),
  ('020 courses + events',   'column', 'itinerary_items',       'num_players'),
  ('020 courses + events',   'column', 'itinerary_items',       'players'),
  ('020 courses + events',   'column', 'itinerary_items',       'par'),
  ('020 courses + events',   'column', 'itinerary_items',       'booking_confirmation'),
  ('020 courses + events',   'column', 'itinerary_items',       'legacy_tee_time'),
  ('021 golf bets',          'table',  'golf_bets',             NULL)
)
SELECT
  migration,
  kind,
  obj || COALESCE('.' || col, '') AS object,
  CASE WHEN kind = 'table' THEN
         CASE WHEN to_regclass('public.' || obj) IS NOT NULL
              THEN 'present' ELSE '*** MISSING ***' END
       ELSE
         CASE WHEN EXISTS (
                SELECT 1 FROM information_schema.columns c
                WHERE c.table_schema='public' AND c.table_name=obj AND c.column_name=col)
              THEN 'present' ELSE '*** MISSING ***' END
  END AS status
FROM expected
ORDER BY migration, object;
