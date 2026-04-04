/*
  # Add vehicle details, condition and surcharge columns to bookings table

  1. New Columns
    - `vehicle_details` (text) — arbitrary details provided by the customer about the vehicle
    - `vehicle_condition` (text) — indicates how dirty the vehicle is (e.g. 'mild', 'medium', 'very_dirty')
    - `condition_fee` (numeric) — extra fee charged based on the selected condition
    - `location_surcharge` (numeric) — extra fee applied if the booking address is more than five minutes from the service area

  2. Notes
    - All new columns default to empty string or zero to avoid breaking existing records.
    - The `IF NOT EXISTS` checks ensure migrations remain idempotent when re-run.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'vehicle_details'
  ) THEN
    ALTER TABLE bookings ADD COLUMN vehicle_details text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'vehicle_condition'
  ) THEN
    ALTER TABLE bookings ADD COLUMN vehicle_condition text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'condition_fee'
  ) THEN
    ALTER TABLE bookings ADD COLUMN condition_fee numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'location_surcharge'
  ) THEN
    ALTER TABLE bookings ADD COLUMN location_surcharge numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'same_day_fee'
  ) THEN
    ALTER TABLE bookings ADD COLUMN same_day_fee numeric DEFAULT 0;
  END IF;
END $$;