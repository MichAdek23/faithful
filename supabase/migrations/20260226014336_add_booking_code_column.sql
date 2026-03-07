/*
  # Add 8-Digit Booking Code Column

  1. Changes
    - Add `booking_code` column to bookings table
      - Type: text
      - Unique constraint to prevent duplicates
      - Not null with no default (will be generated in application)
    
  2. Purpose
    - Replace UUID with user-friendly 8-digit booking code
    - Easier for customers to reference their bookings
    - Unique codes ensure no duplication
*/

-- Add booking_code column (nullable initially for existing records)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_code text UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
