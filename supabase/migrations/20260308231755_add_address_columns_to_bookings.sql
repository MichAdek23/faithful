/*
  # Add address columns to bookings table

  1. Modified Tables
    - `bookings`
      - `house_number` (text) - House or flat number
      - `street_name` (text) - Street name
      - `post_code` (text) - UK postal code
      - `city` (text) - Town or city

  2. Important Notes
    - All columns are nullable to avoid breaking existing bookings
    - Default values set to empty string for new rows
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'house_number'
  ) THEN
    ALTER TABLE bookings ADD COLUMN house_number text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'street_name'
  ) THEN
    ALTER TABLE bookings ADD COLUMN street_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'post_code'
  ) THEN
    ALTER TABLE bookings ADD COLUMN post_code text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'city'
  ) THEN
    ALTER TABLE bookings ADD COLUMN city text DEFAULT '';
  END IF;
END $$;