-- Staymitra Dashboard V2 Schema Enhancements
-- Safe ALTER COLUMN additions — can be run multiple times

-- ============================================================
-- 1. ROOM OFFERINGS — Enhanced inventory fields
-- ============================================================
ALTER TABLE public.room_offerings ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'shared'
  CHECK (room_type IN ('single', 'double', 'triple', 'shared'));

ALTER TABLE public.room_offerings ADD COLUMN IF NOT EXISTS security_deposit NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.room_offerings ADD COLUMN IF NOT EXISTS is_furnished BOOLEAN DEFAULT false;
ALTER TABLE public.room_offerings ADD COLUMN IF NOT EXISTS has_attached_washroom BOOLEAN DEFAULT false;

ALTER TABLE public.room_offerings ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available'
  CHECK (availability_status IN ('available', 'few_beds_left', 'full', 'reserved', 'coming_soon'));

ALTER TABLE public.room_offerings ADD COLUMN IF NOT EXISTS total_occupancy INT DEFAULT 1 CHECK (total_occupancy >= 1);
ALTER TABLE public.room_offerings ADD COLUMN IF NOT EXISTS current_occupancy INT DEFAULT 0 CHECK (current_occupancy >= 0);

-- ============================================================
-- 2. VISIT REQUESTS — Enhanced lead statuses + source + notes
-- ============================================================

-- Drop old CHECK constraint and add new one with expanded statuses
-- We need to use a DO block because ALTER TABLE ... DROP CONSTRAINT IF EXISTS is PG 9.x+
DO $$ BEGIN
  -- Remove old constraint (name may vary, try common patterns)
  ALTER TABLE public.visit_requests DROP CONSTRAINT IF EXISTS visit_requests_status_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.visit_requests ADD CONSTRAINT visit_requests_status_check
  CHECK (status IN ('pending', 'confirmed', 'declined', 'done', 'new', 'contacted', 'interested', 'visit_scheduled', 'closed', 'rejected'));

ALTER TABLE public.visit_requests ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';
ALTER TABLE public.visit_requests ADD COLUMN IF NOT EXISTS owner_notes TEXT DEFAULT '';

-- ============================================================
-- 3. CALLBACK REQUESTS — Enhanced lead statuses + source + notes
-- ============================================================
DO $$ BEGIN
  ALTER TABLE public.callback_requests DROP CONSTRAINT IF EXISTS callback_requests_status_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.callback_requests ADD CONSTRAINT callback_requests_status_check
  CHECK (status IN ('pending', 'done', 'new', 'contacted', 'interested', 'visit_scheduled', 'closed', 'rejected'));

ALTER TABLE public.callback_requests ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';
ALTER TABLE public.callback_requests ADD COLUMN IF NOT EXISTS owner_notes TEXT DEFAULT '';

-- ============================================================
-- 4. INDEXES for new columns
-- ============================================================
CREATE INDEX IF NOT EXISTS room_offerings_availability_idx ON public.room_offerings (availability_status);
CREATE INDEX IF NOT EXISTS visit_requests_status_idx ON public.visit_requests (status);
CREATE INDEX IF NOT EXISTS callback_requests_status_idx ON public.callback_requests (status);
