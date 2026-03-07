/*
  # Create Admin Dashboard Tables

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `name` (text) - Service name
      - `description` (text) - Short description
      - `price` (integer) - Price in currency
      - `duration` (integer) - Duration in minutes
      - `features` (jsonb) - Array of features
      - `is_active` (boolean) - Whether service is available
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key to bookings)
      - `customer_name` (text)
      - `service_type` (text)
      - `rating` (integer) - Rating 1-5
      - `comment` (text)
      - `status` (text) - pending, approved, rejected
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
    - Public read access for approved reviews
*/

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price integer NOT NULL DEFAULT 0,
  duration integer DEFAULT 30,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  service_type text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Services policies (public read for active services)
CREATE POLICY "Public can view active services"
  ON services FOR SELECT
  TO public
  USING (is_active = true);

-- Reviews policies (public read for approved reviews)
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  TO public
  USING (status = 'approved');

-- Insert some default services
INSERT INTO services (name, description, price, duration, features, is_active) VALUES
  ('Basic Wash', 'Exterior Wash & Rinse', 10, 30, '["Exterior hand wash", "Basic tyre cleaning", "Window cleaning", "Quick interior vacuum"]'::jsonb, true),
  ('Standard Wash', 'Exterior Wash & Rinse', 15, 45, '["Everything in Basic", "Interior polish & finish", "Tyre & rim care", "Quick interior vacuum"]'::jsonb, true),
  ('Premium Wash', 'Exterior Wash & Rinse', 25, 60, '["Exterior hand wash", "Basic tyre cleaning", "Engine bay care", "Ultimate Polish"]'::jsonb, true)
ON CONFLICT DO NOTHING;
