-- Staymitra schema: profiles, properties, room offerings, photos, leads

-- Profiles (1:1 with auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'seeker' CHECK (role IN ('seeker', 'owner')),
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- New user: profile row from metadata (role validated)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r TEXT;
BEGIN
  r := COALESCE(NEW.raw_user_meta_data->>'role', 'seeker');
  IF r NOT IN ('seeker', 'owner') THEN
    r := 'seeker';
  END IF;
  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    r,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- Properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('hostel', 'pg')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  area TEXT DEFAULT '',
  min_monthly_rent NUMERIC(12, 2) NOT NULL DEFAULT 0,
  max_monthly_rent NUMERIC(12, 2) NOT NULL DEFAULT 0,
  callback_enabled BOOLEAN NOT NULL DEFAULT true,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX properties_user_id_idx ON public.properties (user_id);
CREATE INDEX properties_published_city_idx ON public.properties (published, city);
CREATE INDEX properties_rent_idx ON public.properties (min_monthly_rent, max_monthly_rent);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties_public_read"
  ON public.properties FOR SELECT
  USING (published = true OR auth.uid() = user_id);

CREATE POLICY "properties_owner_insert"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "properties_owner_update"
  ON public.properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "properties_owner_delete"
  ON public.properties FOR DELETE
  USING (auth.uid() = user_id);

-- Room offerings
CREATE TABLE public.room_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties (id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  beds_count INT NOT NULL DEFAULT 1 CHECK (beds_count >= 1),
  has_ac BOOLEAN NOT NULL DEFAULT false,
  monthly_rent NUMERIC(12, 2) NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX room_offerings_property_idx ON public.room_offerings (property_id);

ALTER TABLE public.room_offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "room_offerings_read"
  ON public.room_offerings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = room_offerings.property_id
        AND (p.published = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "room_offerings_owner_write"
  ON public.room_offerings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = room_offerings.property_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = room_offerings.property_id AND p.user_id = auth.uid()
    )
  );

-- Room photos (storage path in bucket property-images)
CREATE TABLE public.room_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_offering_id UUID NOT NULL REFERENCES public.room_offerings (id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX room_photos_room_idx ON public.room_photos (room_offering_id);

ALTER TABLE public.room_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "room_photos_read"
  ON public.room_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.room_offerings ro
      JOIN public.properties p ON p.id = ro.property_id
      WHERE ro.id = room_photos.room_offering_id
        AND (p.published = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "room_photos_owner_write"
  ON public.room_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.room_offerings ro
      JOIN public.properties p ON p.id = ro.property_id
      WHERE ro.id = room_photos.room_offering_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.room_offerings ro
      JOIN public.properties p ON p.id = ro.property_id
      WHERE ro.id = room_photos.room_offering_id AND p.user_id = auth.uid()
    )
  );

-- Visit requests
CREATE TABLE public.visit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties (id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  preferred_at TIMESTAMPTZ NOT NULL,
  note TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX visit_requests_property_idx ON public.visit_requests (property_id);
CREATE INDEX visit_requests_seeker_idx ON public.visit_requests (seeker_id);

ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visit_seeker_insert"
  ON public.visit_requests FOR INSERT
  WITH CHECK (
    auth.uid() = seeker_id
    AND EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND p.published = true
    )
  );

CREATE POLICY "visit_seeker_select_own"
  ON public.visit_requests FOR SELECT
  USING (auth.uid() = seeker_id);

CREATE POLICY "visit_owner_select"
  ON public.visit_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = visit_requests.property_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "visit_owner_update"
  ON public.visit_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = visit_requests.property_id AND p.user_id = auth.uid()
    )
  );

-- Callback requests
CREATE TABLE public.callback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties (id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  contact_phone TEXT NOT NULL,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX callback_requests_property_idx ON public.callback_requests (property_id);

ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "callback_seeker_insert"
  ON public.callback_requests FOR INSERT
  WITH CHECK (
    auth.uid() = seeker_id
    AND EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND p.published = true AND p.callback_enabled = true
    )
  );

CREATE POLICY "callback_seeker_select_own"
  ON public.callback_requests FOR SELECT
  USING (auth.uid() = seeker_id);

CREATE POLICY "callback_owner_select"
  ON public.callback_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = callback_requests.property_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "callback_owner_update"
  ON public.callback_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = callback_requests.property_id AND p.user_id = auth.uid()
    )
  );

-- Storage bucket (run in Supabase SQL or dashboard if needed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "property_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "property_images_owner_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "property_images_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "property_images_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE OR REPLACE FUNCTION public.touch_properties_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE PROCEDURE public.touch_properties_updated_at();
