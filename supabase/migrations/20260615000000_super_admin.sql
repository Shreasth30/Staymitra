-- Staymitra Super Admin: role + RLS policies for admin access
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- ============================================================
-- 1. Allow 'super_admin' as a profile role
-- ============================================================
DO $$ BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('seeker', 'owner', 'super_admin'));

-- ============================================================
-- 2. Helper function: is current user a super_admin?
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- ============================================================
-- 3. Super-admin RLS bypass policies on all tables
-- ============================================================

-- profiles: super_admin can read/update/delete any profile
CREATE POLICY "profiles_super_admin_select"
  ON public.profiles FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "profiles_super_admin_update"
  ON public.profiles FOR UPDATE
  USING (public.is_super_admin());

CREATE POLICY "profiles_super_admin_delete"
  ON public.profiles FOR DELETE
  USING (public.is_super_admin());

-- properties: super_admin has full access
CREATE POLICY "properties_super_admin_select"
  ON public.properties FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "properties_super_admin_insert"
  ON public.properties FOR INSERT
  WITH CHECK (public.is_super_admin());

CREATE POLICY "properties_super_admin_update"
  ON public.properties FOR UPDATE
  USING (public.is_super_admin());

CREATE POLICY "properties_super_admin_delete"
  ON public.properties FOR DELETE
  USING (public.is_super_admin());

-- room_offerings: super_admin has full access
CREATE POLICY "room_offerings_super_admin"
  ON public.room_offerings FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- room_photos: super_admin has full access
CREATE POLICY "room_photos_super_admin"
  ON public.room_photos FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- property_photos: super_admin has full access
CREATE POLICY "property_photos_super_admin"
  ON public.property_photos FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- visit_requests: super_admin has full access
CREATE POLICY "visit_requests_super_admin_select"
  ON public.visit_requests FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "visit_requests_super_admin_insert"
  ON public.visit_requests FOR INSERT
  WITH CHECK (public.is_super_admin());

CREATE POLICY "visit_requests_super_admin_update"
  ON public.visit_requests FOR UPDATE
  USING (public.is_super_admin());

CREATE POLICY "visit_requests_super_admin_delete"
  ON public.visit_requests FOR DELETE
  USING (public.is_super_admin());

-- callback_requests: super_admin has full access
CREATE POLICY "callback_requests_super_admin_select"
  ON public.callback_requests FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "callback_requests_super_admin_insert"
  ON public.callback_requests FOR INSERT
  WITH CHECK (public.is_super_admin());

CREATE POLICY "callback_requests_super_admin_update"
  ON public.callback_requests FOR UPDATE
  USING (public.is_super_admin());

CREATE POLICY "callback_requests_super_admin_delete"
  ON public.callback_requests FOR DELETE
  USING (public.is_super_admin());

-- storage: super_admin can manage all property images
CREATE POLICY "storage_super_admin_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images' AND public.is_super_admin());

CREATE POLICY "storage_super_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND public.is_super_admin());

CREATE POLICY "storage_super_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'property-images' AND public.is_super_admin());

CREATE POLICY "storage_super_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-images' AND public.is_super_admin());
