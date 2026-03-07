/*
  # Add Admin Write Policies

  1. Policy Updates
    - Add INSERT, UPDATE, DELETE policies for services table
    - Add UPDATE, DELETE policies for reviews table
    - Add UPDATE, DELETE policies for time_slots table
    - Add INSERT, DELETE policies for blocked_times table
    - Add UPDATE policies for team_members table

  2. Security Notes
    - Currently allows authenticated users to perform admin operations
    - In production, these should be restricted to users with admin role
*/

-- Services table policies (admin write access)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' AND policyname = 'Authenticated users can insert services'
  ) THEN
    CREATE POLICY "Authenticated users can insert services"
      ON services FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' AND policyname = 'Authenticated users can update services'
  ) THEN
    CREATE POLICY "Authenticated users can update services"
      ON services FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' AND policyname = 'Authenticated users can delete services'
  ) THEN
    CREATE POLICY "Authenticated users can delete services"
      ON services FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' AND policyname = 'Authenticated users can view all services'
  ) THEN
    CREATE POLICY "Authenticated users can view all services"
      ON services FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Reviews table policies (admin write access)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' AND policyname = 'Authenticated users can update reviews'
  ) THEN
    CREATE POLICY "Authenticated users can update reviews"
      ON reviews FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' AND policyname = 'Authenticated users can delete reviews'
  ) THEN
    CREATE POLICY "Authenticated users can delete reviews"
      ON reviews FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' AND policyname = 'Authenticated users can view all reviews'
  ) THEN
    CREATE POLICY "Authenticated users can view all reviews"
      ON reviews FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Time slots table policies (admin write access)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'time_slots' AND policyname = 'Authenticated users can update time slots'
  ) THEN
    CREATE POLICY "Authenticated users can update time slots"
      ON time_slots FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'time_slots' AND policyname = 'Authenticated users can delete time slots'
  ) THEN
    CREATE POLICY "Authenticated users can delete time slots"
      ON time_slots FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'time_slots' AND policyname = 'Authenticated users can view all time slots'
  ) THEN
    CREATE POLICY "Authenticated users can view all time slots"
      ON time_slots FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Blocked times table policies (admin write access)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blocked_times' AND policyname = 'Authenticated users can insert blocked times'
  ) THEN
    CREATE POLICY "Authenticated users can insert blocked times"
      ON blocked_times FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blocked_times' AND policyname = 'Authenticated users can delete blocked times'
  ) THEN
    CREATE POLICY "Authenticated users can delete blocked times"
      ON blocked_times FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blocked_times' AND policyname = 'Authenticated users can view all blocked times'
  ) THEN
    CREATE POLICY "Authenticated users can view all blocked times"
      ON blocked_times FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Team members table policies (admin write access)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'team_members' AND policyname = 'Authenticated users can update team members'
  ) THEN
    CREATE POLICY "Authenticated users can update team members"
      ON team_members FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'team_members' AND policyname = 'Authenticated users can view all team members'
  ) THEN
    CREATE POLICY "Authenticated users can view all team members"
      ON team_members FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;
