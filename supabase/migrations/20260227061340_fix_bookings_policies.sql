/*
  # Fix Bookings Table Policies

  1. Policy Changes
    - Drop all existing policies on bookings table
    - Recreate policies with proper configuration
    - Ensure anon users have full access for development

  2. Security Notes
    - These policies allow unauthenticated access
    - Suitable for development environment
    - Should be restricted in production
*/

-- Drop all existing policies on bookings table
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Anon users can update bookings" ON bookings;
DROP POLICY IF EXISTS "Anon users can delete bookings" ON bookings;

-- Recreate policies for full anon access
CREATE POLICY "Anon users can insert bookings"
  ON bookings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can select bookings"
  ON bookings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can update bookings"
  ON bookings FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete bookings"
  ON bookings FOR DELETE
  TO anon
  USING (true);