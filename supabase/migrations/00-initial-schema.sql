-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reactions INT DEFAULT 0,
  hidden BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id)
);

-- Create post_reactions table for reaction tracking
CREATE TABLE post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Function to increment reaction count
CREATE OR REPLACE FUNCTION increment_reactions(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET reactions = reactions + 1
  WHERE id = post_id;
END;
$$;

-- Function to decrement reaction count
CREATE OR REPLACE FUNCTION decrement_reactions(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET reactions = GREATEST(0, reactions - 1)
  WHERE id = post_id;
END;
$$;

-- Row Level Security policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Public posts are viewable by everyone"
ON posts FOR SELECT
USING (hidden = false OR auth.uid() IN (
  SELECT usrs.id FROM auth.users usrs
  WHERE usrs.email = current_setting('app.admin_email', true)
));

CREATE POLICY "Users can insert their own posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any post"
ON posts FOR UPDATE
USING (auth.uid() IN (
  SELECT usrs.id FROM auth.users usrs
  WHERE usrs.email = current_setting('app.admin_email', true)
));

CREATE POLICY "Users can delete their own posts"
ON posts FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any post"
ON posts FOR DELETE
USING (auth.uid() IN (
  SELECT usrs.id FROM auth.users usrs
  WHERE usrs.email = current_setting('app.admin_email', true)
));

-- Post reactions policies
CREATE POLICY "Users can view any reaction"
ON post_reactions FOR SELECT
USING (true);

CREATE POLICY "Users can add their own reactions"
ON post_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON post_reactions FOR DELETE
USING (auth.uid() = user_id);