/*
  # Add admin_id to notifications for per-admin notification tracking

  1. Modified Tables
    - `notifications`
      - Added `admin_id` (uuid, references admins.id) - Links notification to a specific admin
      - Each admin gets their own notification instance with independent read/unread state

  2. Security
    - Updated RLS policies so admins only see their own notifications
    - Anon users can still insert notifications (for booking flow)
    - Authenticated admins can only read/update/delete their own notifications

  3. Important Notes
    - Existing notifications without admin_id will remain but won't show for any admin
    - New bookings will create one notification per active admin
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'admin_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN admin_id uuid REFERENCES admins(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON notifications(admin_id);

DROP POLICY IF EXISTS "Anon users can read notifications" ON notifications;
DROP POLICY IF EXISTS "Anon users can update notifications" ON notifications;
DROP POLICY IF EXISTS "Anon users can insert notifications" ON notifications;

CREATE POLICY "Anon users can insert notifications"
  ON notifications
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    admin_id IN (
      SELECT id FROM admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (
    admin_id IN (
      SELECT id FROM admins WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    admin_id IN (
      SELECT id FROM admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (
    admin_id IN (
      SELECT id FROM admins WHERE user_id = auth.uid()
    )
  );
