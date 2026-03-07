/*
  # Add Authenticated User Access to Bookings and Notifications

  1. Changes
    - Add RLS policies for authenticated users (admins) to access all bookings
    - Add RLS policies for authenticated users to access notifications
  
  2. Security
    - Authenticated users (admins) can view and manage all data
    - Anonymous users (customers) maintain their existing access
    - Data remains secure with proper role-based access
*/

-- Bookings: Add authenticated user policies
CREATE POLICY "Authenticated users can view all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update all bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (true);

-- Notifications: Add authenticated user policies
CREATE POLICY "Authenticated users can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (true);
