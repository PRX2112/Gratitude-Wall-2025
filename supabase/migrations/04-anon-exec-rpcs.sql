-- Allow anon to execute reaction RPCs
GRANT EXECUTE ON FUNCTION increment_reactions(post_id UUID) TO anon;
GRANT EXECUTE ON FUNCTION decrement_reactions(post_id UUID) TO anon;


