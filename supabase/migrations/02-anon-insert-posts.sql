-- Allow anonymous inserts into posts table (no auth required)
-- WARNING: This makes the table publicly writable; keep content size limited
-- and consider rate limiting at the edge if deploying publicly.

DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
CREATE POLICY "Anyone can insert a post"
ON posts FOR INSERT
WITH CHECK (true);


