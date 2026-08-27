-- Migration 024: AI usage log
--
-- B.5. Every model call records what it cost. Without this there is no way to answer
-- "what does a trip cost us to serve", which is the number that decides whether the
-- unit economics work at all.
--
-- Token counts come straight from the API response and are exact. The cost column is
-- derived from a rate table in the app and is an estimate for reporting — reconcile
-- against the provider console before pricing anything on it.

CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Nullable: trip drafting happens before a trip exists.
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  -- 'trip_draft', 'assistant', 'itinerary_draft', ... one row per user-facing action,
  -- so cost can be read per feature rather than only in aggregate.
  action TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(10, 6),
  latency_ms INTEGER,
  -- False when the model returned something that failed schema validation. Tracking
  -- this separately matters: a call that failed still cost money, and a rising failure
  -- rate is the early signal that a prompt has drifted.
  ok BOOLEAN NOT NULL DEFAULT true,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON public.ai_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON public.ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_action ON public.ai_usage(action);
-- Supports the per-trip daily cap in B.4 without a sequential scan.
CREATE INDEX IF NOT EXISTS idx_ai_usage_trip_day ON public.ai_usage(trip_id, created_at DESC);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- No client policies at all. Rows are written server-side under the service role, and
-- spend data is not something a user should be able to read or forge.
