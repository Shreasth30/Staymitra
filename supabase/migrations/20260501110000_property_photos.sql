-- Add property_photos table
CREATE TABLE IF NOT EXISTS public.property_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties (id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS property_photos_property_idx ON public.property_photos (property_id);

ALTER TABLE public.property_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_photos_read"
  ON public.property_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_photos.property_id
        AND (p.published = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "property_photos_owner_write"
  ON public.property_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_photos.property_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_photos.property_id AND p.user_id = auth.uid()
    )
  );
