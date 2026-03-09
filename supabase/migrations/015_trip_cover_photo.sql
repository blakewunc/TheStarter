-- Migration 015: Trip cover photo

-- Add cover_image_url to trips table
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS cover_image_url TEXT DEFAULT NULL;

-- Create storage bucket for trip cover photos (run in Supabase dashboard or via CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('trip-covers', 'trip-covers', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies (run in Supabase dashboard Storage > trip-covers > Policies)
-- Allow authenticated users to upload to their own folder:
--   (storage.foldername(name))[1] = auth.uid()::text
-- Allow public read access:
--   bucket_id = 'trip-covers'
