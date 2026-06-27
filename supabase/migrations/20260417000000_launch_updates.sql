-- Staymitra launch updates: geo coordinates, address, amenities

-- Add geo coordinates for Mappls map integration
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';

-- Add amenities as a text array for flexible tagging
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}';

-- Index for geo queries (only index rows that have coordinates)
CREATE INDEX IF NOT EXISTS properties_geo_idx
  ON public.properties (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Allow any authenticated user to read basic profile info (for showing seeker names in leads)
DROP POLICY IF EXISTS "profiles_public_read_basic" ON public.profiles;
CREATE POLICY "profiles_public_read_basic"
  ON public.profiles FOR SELECT
  USING (true);
