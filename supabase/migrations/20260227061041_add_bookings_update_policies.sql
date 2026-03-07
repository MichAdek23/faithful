/*
  # Add Bookings Update and Delete Policies
  
  1. Policy Updates
    - Add policy allowing anon users to update bookings
    - Add policy allowing anon users to delete bookings
    - This enables admin dashboard functionality
  
  2. Security Notes
    - These policies allow unauthenticated access for development
    - In production, restrict to authenticated admin users only
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' AND policyname = 'Anon users can update bookings'
  ) THEN
    CREATE POLICY "Anon users can update bookings"
      ON bookings FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' AND policyname = 'Anon users can delete bookings'
  ) THEN
    CREATE POLICY "Anon users can delete bookings"
      ON bookings FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;