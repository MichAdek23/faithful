/*
  # Fix price columns to support decimal values

  1. Changes
    - Change `service_price` from integer to numeric to support decimal prices from discount calculations
    - Change `original_price` from integer to numeric for consistency

  2. Problem
    - First-time customer discount (15%) produces decimal prices (e.g., Premium £55 * 0.85 = £46.75)
    - Integer column rejects decimal values, causing booking failures for new customers

  3. Notes
    - Existing integer data is safely converted to numeric without data loss
    - No changes to RLS policies needed
*/

ALTER TABLE bookings ALTER COLUMN service_price TYPE numeric;
ALTER TABLE bookings ALTER COLUMN original_price TYPE numeric;
