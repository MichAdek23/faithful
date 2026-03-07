/*
  # Create Admins Table

  1. New Tables
    - `admins`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key to auth.users) - Links to Supabase auth user
      - `full_name` (text) - Admin's full name
      - `email` (text, unique) - Admin's email address
      - `role` (text) - Admin role (e.g., 'Super Admin', 'Admin', 'Manager')
      - `is_active` (boolean) - Whether the admin account is active
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `admins` table
    - Add policy for authenticated admins to read their own data
    - Add policy for authenticated admins to update their own data
    - Add policy for anonymous access (for signup/signin)

  3. Important Notes
    - The user_id links to Supabase's built-in auth.users table
    - RLS ensures admins can only access their own data
    - The table is secured but accessible for authentication flows
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'Admin',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read their own admin data
CREATE POLICY "Admins can read own data"
  ON admins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can update their own admin data
CREATE POLICY "Admins can update own data"
  ON admins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Allow anonymous users to check if email exists (for signup validation)
CREATE POLICY "Anyone can check admin existence"
  ON admins FOR SELECT
  TO anon
  USING (true);

-- Policy: Allow authenticated users to insert their own admin record (during signup)
CREATE POLICY "Authenticated users can insert own admin record"
  ON admins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS admins_user_id_idx ON admins(user_id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS admins_email_idx ON admins(email);
