-- Migration: Add 'Pending' status to booking_status enum
-- Run this in your Supabase SQL Editor

-- 1. Add 'Pending' to the enum
-- Note: PostgreSQL doesn't allow adding values to enums within a transaction in older versions, 
-- but Supabase supports this.
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'Pending' BEFORE 'Upcoming';

-- 2. Update default value for bookings table
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'Pending';

-- 3. Optionally update existing 'Upcoming' bookings that should be 'Pending' 
-- (Only if you want existing mock data to become pending)
-- UPDATE bookings SET status = 'Pending' WHERE status = 'Upcoming';
