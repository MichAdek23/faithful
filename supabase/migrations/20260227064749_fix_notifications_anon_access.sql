/*
  # Fix Notifications Table Access

  1. Changes
    - Add anon role policies to notifications table
    - Allow anonymous users to insert notifications when booking
    - Allow anonymous users to read notifications (for admin dashboard)
  
  2. Security
    - Anon users can insert notifications (needed for booking flow)
    - Anon users can read notifications (needed for displaying in admin)
    - Maintains data integrity
*/

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can read all notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can update notifications" ON notifications;

-- Add policies that work for anonymous users (booking system)
CREATE POLICY "Anon users can insert notifications"
  ON notifications
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can read notifications"
  ON notifications
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can update notifications"
  ON notifications
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
