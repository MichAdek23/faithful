/*
  # Create notifications table for admin notifications

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `title` (text) - Notification title
      - `message` (text) - Notification message
      - `type` (text) - Type of notification (booking, review, system, etc.)
      - `booking_id` (uuid) - Reference to bookings table (optional)
      - `is_read` (boolean) - Whether notification has been read
      - `created_at` (timestamptz) - When notification was created
      - `read_at` (timestamptz) - When notification was read (optional)

  2. Security
    - Enable RLS on `notifications` table
    - Add policy for authenticated admins to read all notifications
    - Add policy for authenticated admins to update notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'system',
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);