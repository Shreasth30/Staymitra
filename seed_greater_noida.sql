-- Seed Greater Noida Properties
-- Run this in your Supabase SQL Editor!

DO $$
DECLARE
  v_owner_id UUID;
  v_prop1_id UUID;
  v_prop2_id UUID;
  v_prop3_id UUID;
  
  -- Room IDs
  v_p1_r1 UUID;
  v_p1_r2 UUID;
  v_p1_r3 UUID;
  
  v_p2_r1 UUID;
  v_p2_r2 UUID;
  v_p2_r3 UUID;
  
  v_p3_r1 UUID;
  v_p3_r2 UUID;
BEGIN
  -- 1. Find an owner account to attach the properties to.
  -- We'll just grab the first user in the auth.users table. 
  SELECT id INTO v_owner_id FROM auth.users LIMIT 1;
  
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'No users found! Please create an account first.';
  END IF;

  -- Ensure the user is an owner
  UPDATE public.profiles SET role = 'owner' WHERE id = v_owner_id;

  -- Delete existing properties to make script idempotent
  DELETE FROM public.properties 
  WHERE slug IN (
    'alpha-residence-greater-noida', 
    'scholars-hub-knowledge-park-3', 
    'beta-elite-living-greater-noida'
  );

  -------------------------------------------------------------
  -- THE ALPHA RESIDENCE
  -------------------------------------------------------------
  INSERT INTO public.properties (
    user_id, name, slug, type, city, area, address, 
    latitude, longitude, description, min_monthly_rent, max_monthly_rent,
    amenities, published, callback_enabled
  ) VALUES (
    v_owner_id, 
    'The Alpha Residence', 
    'alpha-residence-greater-noida', 
    'pg', 
    'Greater Noida', 
    'Alpha 1', 
    'A-42, Alpha 1 Commercial Belt, Greater Noida, UP 201310',
    28.4849, 
    77.5085,
    'Premium PG accommodation in the heart of Alpha 1. Walking distance to the metro station. Fully furnished rooms with high-speed internet, smart TVs, and daily housekeeping. Ideal for students and young professionals.',
    8000, 
    15000,
    ARRAY['WiFi', 'AC', 'Meal included', 'Laundry', 'Power backup', 'Security'],
    true,
    true
  ) RETURNING id INTO v_prop1_id;

  INSERT INTO public.room_offerings (property_id, label, beds_count, has_ac, monthly_rent, description, sort_order)
  VALUES (v_prop1_id, 'Private Executive Room', 1, true, 15000, 'Spacious private room with king bed and balcony.', 1) RETURNING id INTO v_p1_r1;
  
  INSERT INTO public.room_offerings (property_id, label, beds_count, has_ac, monthly_rent, description, sort_order)
  VALUES (v_prop1_id, 'Twin Sharing Room', 2, true, 10000, 'Comfortable twin sharing with individual wardrobes.', 2) RETURNING id INTO v_p1_r2;
  
  INSERT INTO public.room_offerings (property_id, label, beds_count, has_ac, monthly_rent, description, sort_order)
  VALUES (v_prop1_id, 'Triple Sharing Comfort', 3, false, 8000, 'Economical sharing option for students.', 3) RETURNING id INTO v_p1_r3;

  -- Photos for Alpha Residence
  INSERT INTO public.room_photos (room_offering_id, storage_path, sort_order) VALUES
  (v_p1_r1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop', 1),
  (v_p1_r1, 'https://images.unsplash.com/photo-1536376074432-c71545b77e3f?q=80&w=2670&auto=format&fit=crop', 2),
  (v_p1_r2, 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2670&auto=format&fit=crop', 1),
  (v_p1_r3, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2669&auto=format&fit=crop', 1);

  -------------------------------------------------------------
  -- SCHOLARS HUB HOSTEL
  -------------------------------------------------------------
  INSERT INTO public.properties (
    user_id, name, slug, type, city, area, address, 
    latitude, longitude, description, min_monthly_rent, max_monthly_rent,
    amenities, published, callback_enabled
  ) VALUES (
    v_owner_id, 
    'Scholars Hub Hostel', 
    'scholars-hub-knowledge-park-3', 
    'hostel', 
    'Greater Noida', 
    'Knowledge Park III', 
    'Plot 14, Knowledge Park III, Near GL Bajaj Institute, Greater Noida, UP 201306',
    28.4715, 
    77.4912,
    'A vibrant student community located right next to major educational institutions. We feature dedicated quiet study areas, a cafeteria, indoor games, and 24x7 security. Specifically designed for college students.',
    6000, 
    12000,
    ARRAY['WiFi', 'AC', 'Library/Study Room', 'Cafeteria', 'Power backup', 'CCTV'],
    true,
    true
  ) RETURNING id INTO v_prop2_id;

  INSERT INTO public.room_offerings (property_id, label, beds_count, has_ac, monthly_rent, description, sort_order)
  VALUES (v_prop2_id, 'Deluxe Single', 1, true, 12000, 'Your own space to focus and study.', 1) RETURNING id INTO v_p2_r1;
  
  INSERT INTO public.room_offerings (property_id, label, beds_count, has_ac, monthly_rent, description, sort_order)
  VALUES (v_prop2_id, 'Duo Standard', 2, true, 8000, 'A balanced sharing environment.', 2) RETURNING id INTO v_p2_r2;
  
  INSERT INTO public.room_offerings (property_id, label, beds_count, has_ac, monthly_rent, description, sort_order)
  VALUES (v_prop2_id, 'Quad Dorm', 4, true, 6000, 'Fun and engaging 4-bed dorm room for the full college experience.', 3) RETURNING id INTO v_p2_r3;

  -- Photos for Scholars Hub Hostel
  INSERT INTO public.room_photos (room_offering_id, storage_path, sort_order) VALUES
  (v_p2_r1, 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=2670&auto=format&fit=crop', 1),
  (v_p2_r1, 'https://images.unsplash.com/photo-1505691938895-1758d7def515?q=80&w=2670&auto=format&fit=crop', 2),
  (v_p2_r2, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2669&auto=format&fit=crop', 1),
  (v_p2_r2, 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2669&auto=format&fit=crop', 2),
  (v_p2_r3, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2669&auto=format&fit=crop', 1);

  -------------------------------------------------------------
  -- BETA ELITE LIVING
  -------------------------------------------------------------
  INSERT INTO public.properties (
    user_id, name, slug, type, city, area, address, 
    latitude, longitude, description, min_monthly_rent, max_monthly_rent,
    amenities, published, callback_enabled
  ) VALUES (
    v_owner_id, 
    'Beta Elite Living', 
    'beta-elite-living-greater-noida', 
    'pg', 
    'Greater Noida', 
    'Beta 2', 
    'Block O, Beta 2, Near Omaxe Connaught Place, Greater Noida, UP 201308',
    28.4633, 
    77.5146,
    'Luxury paying guest accommodation for those who prefer modern amenities. Completely contactless entry, fingerprint locks, premium mattresses, and an in-house gym.',
    12000, 
    20000,
    ARRAY['WiFi', 'AC', 'Gym', 'Meal included', 'Laundry', 'Smart Locks', 'Lounge'],
    true,
    true
  ) RETURNING id INTO v_prop3_id;

  INSERT INTO public.room_offerings (property_id, label, beds_count, has_ac, monthly_rent, description, sort_order)
  VALUES (v_prop3_id, 'Luxury Suite AC', 1, true, 20000, 'Premium room with attached lounge area.', 1) RETURNING id INTO v_p3_r1;
  
  INSERT INTO public.room_offerings (property_id, label, beds_count, has_ac, monthly_rent, description, sort_order)
  VALUES (v_prop3_id, 'Premium Double', 2, true, 12000, 'Hotel-style double sharing room.', 2) RETURNING id INTO v_p3_r2;

  -- Photos for Beta Elite Living
  INSERT INTO public.room_photos (room_offering_id, storage_path, sort_order) VALUES
  (v_p3_r1, 'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?q=80&w=2600&auto=format&fit=crop', 1),
  (v_p3_r1, 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2657&auto=format&fit=crop', 2),
  (v_p3_r1, 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=2670&auto=format&fit=crop', 3),
  (v_p3_r1, 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2670&auto=format&fit=crop', 4),
  (v_p3_r2, 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=2670&auto=format&fit=crop', 1);

END $$;
