/*
  # Create Admin Notifications System

  1. New Tables
    - `admin_notifications`
      - `id` (uuid, primary key)
      - `name` (text) - Admin name
      - `email` (text, unique) - Admin email address
      - `receive_new_bookings` (boolean) - Whether to receive booking notifications
      - `is_active` (boolean) - Whether the admin is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `admin_notifications` table
    - Add policy for authenticated users to read admin data

  3. Initial Data
    - Insert default admin email for testing
*/

CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  receive_new_bookings boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active admins"
  ON admin_notifications
  FOR SELECT
  USING (is_active = true);

INSERT INTO admin_notifications (name, email, receive_new_bookings, is_active)
VALUES 
  ('Admin Manager', 'adelekem600@gmail.com', true, true)
ON CONFLICT (email) DO NOTHING;