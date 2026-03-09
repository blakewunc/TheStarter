-- Migration 013: Add course par to tee times + course ratings table
-- Enables score-relative-to-par display and group course recommendations

-- Add par to tee times so scores can be shown relative to par
ALTER TABLE public.golf_tee_times
ADD COLUMN par INTEGER DEFAULT 72;

-- Course ratings table (ratings are tied to a trip but viewable globally)
CREATE TABLE IF NOT EXISTS public.golf_course_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_name TEXT NOT NULL,
  course_location TEXT,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id, course_name)
);

-- Indexes
CREATE INDEX idx_golf_course_ratings_course ON public.golf_course_ratings(course_name);
CREATE INDEX idx_golf_course_ratings_trip ON public.golf_course_ratings(trip_id);

-- RLS
ALTER TABLE public.golf_course_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view ratings (they're public/global for discovery)
CREATE POLICY "Authenticated users can view course ratings"
  ON public.golf_course_ratings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Trip members can create ratings for courses played on their trip
CREATE POLICY "Trip members can create course ratings"
  ON public.golf_course_ratings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_course_ratings.trip_id
      AND trip_members.user_id = auth.uid()
    )
    AND auth.uid() = user_id
  );

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON public.golf_course_ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings"
  ON public.golf_course_ratings FOR DELETE
  USING (auth.uid() = user_id);
