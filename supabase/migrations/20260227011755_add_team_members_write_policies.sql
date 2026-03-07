/*
  # Add Write Policies for Team Members

  1. Changes
    - Add INSERT policy for team_members table
    - Add UPDATE policy for team_members table  
    - Add DELETE policy for team_members table
  
  2. Security
    - Allow public to insert new team members
    - Allow public to update existing team members
    - Allow public to delete team members
*/

-- Add INSERT policy for team_members
CREATE POLICY "Public can insert team members"
  ON team_members FOR INSERT
  TO public
  WITH CHECK (true);

-- Add UPDATE policy for team_members
CREATE POLICY "Public can update team members"
  ON team_members FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Add DELETE policy for team_members
CREATE POLICY "Public can delete team members"
  ON team_members FOR DELETE
  TO public
  USING (true);
