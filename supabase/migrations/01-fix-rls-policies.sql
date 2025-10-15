-- Fix RLS policies to avoid querying auth.users (which requires extra grants)
-- and to base admin privileges on the JWT email claim.

-- Posts: make readable by everyone, keep user-owned write, and admin override via JWT email
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;
CREATE POLICY "Public posts are viewable by everyone"
ON posts FOR SELECT
USING (true);

-- Replace admin update/delete overrides to avoid referencing auth.users
DROP POLICY IF EXISTS "Admins can update any post" ON posts;
CREATE POLICY "Admins can update any post"
ON posts FOR UPDATE
USING ((auth.jwt() ->> 'email') = current_setting('app.admin_email', true));

DROP POLICY IF EXISTS "Admins can delete any post" ON posts;
CREATE POLICY "Admins can delete any post"
ON posts FOR DELETE
USING ((auth.jwt() ->> 'email') = current_setting('app.admin_email', true));

-- Ensure existing user-owned policies remain intact
-- (Users can insert/update/delete their own posts) are defined in 00-initial-schema.sql

-- Post reactions policies already allow public select and user-owned insert/delete

-- Note: You must set the admin email parameter to match your desired admin.
-- Example (persist across sessions):
--   ALTER DATABASE postgres SET app.admin_email = 'you@example.com';
-- Or for the current session only (non-persistent):
--   SELECT set_config('app.admin_email', 'you@example.com', true);


