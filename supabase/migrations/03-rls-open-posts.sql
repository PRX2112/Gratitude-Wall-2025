-- Ensure anon role has usage and grants
-- Note: In Supabase, anon role is already configured, but we explicitly grant
-- privileges for clarity. RLS still governs access.

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON TABLE posts TO anon;

-- Reset insert policy to be explicitly permissive for anon
DROP POLICY IF EXISTS "Anyone can insert a post" ON posts;
CREATE POLICY "Anon can insert post"
ON posts FOR INSERT
TO anon
WITH CHECK (true);

-- Keep public select policy permissive
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;
CREATE POLICY "Public posts are viewable by everyone"
ON posts FOR SELECT
USING (true);


