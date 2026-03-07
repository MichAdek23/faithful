/*
  # Create Teams and Time Slots Tables

  1. New Tables
    - `team_members`
      - `id` (uuid, primary key)
      - `name` (text) - Team member name
      - `email` (text) - Email address
      - `phone` (text) - Phone number
      - `role` (text) - Manager, Technician, Booking Officer
      - `date_joined` (date) - When they joined
      - `services_completed` (integer) - Number of services completed
      - `rating` (decimal) - Performance rating
      - `status` (text) - active, inactive
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `time_slots`
      - `id` (uuid, primary key)
      - `day_of_week` (text) - Monday, Tuesday, etc.
      - `start_time` (time) - Start time
      - `end_time` (time) - End time
      - `capacity` (integer) - Number of slots available
      - `is_active` (boolean) - Whether the day is operational
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `blocked_times`
      - `id` (uuid, primary key)
      - `day_of_week` (text) - Day of the week
      - `blocked_time` (text) - Time range blocked
      - `reason` (text) - Reason for blocking
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
*/

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('Manager', 'Technician', 'Booking Officer')),
  date_joined date DEFAULT CURRENT_DATE,
  services_completed integer DEFAULT 0,
  rating decimal(2,1) DEFAULT 0.0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  capacity integer DEFAULT 20,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(day_of_week)
);

-- Create blocked_times table
CREATE TABLE IF NOT EXISTS blocked_times (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week text NOT NULL,
  blocked_time text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view active team members"
  ON team_members FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Public can view active time slots"
  ON time_slots FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Public can view blocked times"
  ON blocked_times FOR SELECT
  TO public
  USING (true);

-- Insert default team members
INSERT INTO team_members (name, email, phone, role, date_joined, services_completed, rating, status) VALUES
  ('Cameron Williamson', 'thuhang.nute@gmail.com', '(316) 555-0116', 'Manager', '2026-04-06', 12, 4.6, 'active'),
  ('Alexa Fox', 'nvt.isst.nute@gmail.com', '(225) 555-0118', 'Technician', '2026-04-06', 34, 3.5, 'inactive'),
  ('Cooper, Kristin', 'tranthuy.nute@gmail.com', '(207) 555-0119', 'Technician', '2026-04-06', 43, 3.8, 'active'),
  ('Flores, Juanita', 'tienlapspktnd@gmail.com', '(808) 555-0111', 'Booking Officer', '2026-04-06', 20, 4.8, 'inactive'),
  ('Nguyen, Shane', 'tranthuy.nute@gmail.com', '(316) 555-0116', 'Booking Officer', '2026-04-06', 20, 4.8, 'active')
ON CONFLICT DO NOTHING;

-- Insert default time slots
INSERT INTO time_slots (day_of_week, start_time, end_time, capacity, is_active) VALUES
  ('Monday', '08:00', '22:00', 20, true),
  ('Tuesday', '08:00', '22:00', 20, true),
  ('Wednesday', '08:00', '22:00', 20, false),
  ('Thursday', '08:00', '22:00', 20, true),
  ('Friday', '08:00', '22:00', 20, true),
  ('Saturday', '08:00', '22:00', 20, true),
  ('Sunday', '08:00', '22:00', 20, true)
ON CONFLICT DO NOTHING;

-- Insert blocked times
INSERT INTO blocked_times (day_of_week, blocked_time, reason) VALUES
  ('Monday', '12:30 - 13:30', 'Already Booked'),
  ('Tuesday', '10:30 - 12:30', 'Already Booked'),
  ('Monday', '19:30 - 20:30', 'Team Meeting')
ON CONFLICT DO NOTHING;
