/*
  # Add Anonymous Admin Policies for Development

  1. Policy Updates
    - Add policies allowing anon role to perform admin operations
    - This is for development purposes only
    - In production, these should be restricted to authenticated admin users

  2. Security Notes
    - These policies allow unauthenticated access
    - Should be replaced with proper authentication before production deployment
*/

-- Services table policies (anon access for development)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' AND policyname = 'Anon users can view all services'
  ) THEN
    CREATE POLICY "Anon users can view all services"
      ON services FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' AND policyname = 'Anon users can insert services'
  ) THEN
    CREATE POLICY "Anon users can insert services"
      ON services FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' AND policyname = 'Anon users can update services'
  ) THEN
    CREATE POLICY "Anon users can update services"
      ON services FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' AND policyname = 'Anon users can delete services'
  ) THEN
    CREATE POLICY "Anon users can delete services"
      ON services FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;

-- Reviews table policies (anon access for development)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' AND policyname = 'Anon users can view all reviews'
  ) THEN
    CREATE POLICY "Anon users can view all reviews"
      ON reviews FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' AND policyname = 'Anon users can insert reviews'
  ) THEN
    CREATE POLICY "Anon users can insert reviews"
      ON reviews FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' AND policyname = 'Anon users can update reviews'
  ) THEN
    CREATE POLICY "Anon users can update reviews"
      ON reviews FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' AND policyname = 'Anon users can delete reviews'
  ) THEN
    CREATE POLICY "Anon users can delete reviews"
      ON reviews FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;

-- Time slots table policies (anon access for development)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'time_slots' AND policyname = 'Anon users can view all time slots'
  ) THEN
    CREATE POLICY "Anon users can view all time slots"
      ON time_slots FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'time_slots' AND policyname = 'Anon users can update time slots'
  ) THEN
    CREATE POLICY "Anon users can update time slots"
      ON time_slots FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'time_slots' AND policyname = 'Anon users can delete time slots'
  ) THEN
    CREATE POLICY "Anon users can delete time slots"
      ON time_slots FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;

-- Blocked times table policies (anon access for development)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blocked_times' AND policyname = 'Anon users can view all blocked times'
  ) THEN
    CREATE POLICY "Anon users can view all blocked times"
      ON blocked_times FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blocked_times' AND policyname = 'Anon users can insert blocked times'
  ) THEN
    CREATE POLICY "Anon users can insert blocked times"
      ON blocked_times FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blocked_times' AND policyname = 'Anon users can delete blocked times'
  ) THEN
    CREATE POLICY "Anon users can delete blocked times"
      ON blocked_times FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;

-- Team members table policies (anon access for development)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'team_members' AND policyname = 'Anon users can view all team members'
  ) THEN
    CREATE POLICY "Anon users can view all team members"
      ON team_members FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'team_members' AND policyname = 'Anon users can update team members'
  ) THEN
    CREATE POLICY "Anon users can update team members"
      ON team_members FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
