/*
  # Create App Settings Table

  1. New Tables
    - `app_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique) - The setting name
      - `setting_value` (boolean) - The setting value
      - `description` (text) - Description of the setting
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `app_settings` table
    - Add policy for authenticated users (admins) to manage settings
    - Add policy for anonymous users to read settings
  
  3. Initial Data
    - Insert default setting for signup_enabled (enabled by default)
*/

CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admins) can manage all settings
CREATE POLICY "Authenticated users can view all settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anonymous users can read settings (needed to check if signup is enabled)
CREATE POLICY "Anonymous users can view settings"
  ON app_settings
  FOR SELECT
  TO anon
  USING (true);

-- Insert default settings
INSERT INTO app_settings (setting_key, setting_value, description)
VALUES 
  ('signup_enabled', true, 'Allow new admin users to sign up')
ON CONFLICT (setting_key) DO NOTHING;
