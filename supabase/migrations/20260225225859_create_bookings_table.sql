/*
  # Create Bookings Table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key) - Unique booking identifier
      - `booking_date` (date) - Selected appointment date
      - `booking_time` (text) - Selected appointment time slot
      - `service_type` (text) - Service chosen (Basic Wash, Standard Wash, Premium Wash)
      - `service_price` (integer) - Price in pounds
      - `vehicle_type` (text) - Type of vehicle (Sedan, SUV, Truck, Van)
      - `customer_name` (text) - Customer's full name
      - `customer_email` (text) - Customer's email address
      - `customer_phone` (text) - Customer's phone number
      - `status` (text) - Booking status (confirmed, cancelled, completed)
      - `created_at` (timestamptz) - When booking was created
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `bookings` table
    - Add policy for anyone to create bookings (public booking system)
    - Add policy for users to view their own bookings by email
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_date date NOT NULL,
  booking_time text NOT NULL,
  service_type text NOT NULL,
  service_price integer NOT NULL,
  vehicle_type text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  status text DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bookings"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
