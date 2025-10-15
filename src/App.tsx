import { useState, useEffect } from 'react';
import { Loader2, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { supabase } from './lib/supabase';
import GratitudeForm from './components/GratitudeForm';
import GratitudeCard from './components/GratitudeCard';
import TopPostsRecap from './components/TopPostsRecap';
import AdminPanel from './components/AdminPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GratitudePost } from './types';

function App() {
  // Anonymous mode: no auth
  const [posts, setPosts] = useState<GratitudePost[]>([]);
  const [showRecap, setShowRecap] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isReacting, setIsReacting] = useState<{ [key: string]: boolean }>({});
  const [isAdmin] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gratitude_submitted') === '1';
    } catch {
      return false;
    }
  });
  const [userReactions, setUserReactions] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('gratitude_likes');
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  });

  const persistLikes = (setVal: Set<string>) => {
    try {
      localStorage.setItem('gratitude_likes', JSON.stringify(Array.from(setVal)));
    } catch {}
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPosts(data || []);
      } catch (e) {
        console.error('Error fetching posts:', e);
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, 
        payload => {
          if (payload.eventType === 'INSERT') {
            setPosts(current => [payload.new as GratitudePost, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setPosts(current => current.map(post => 
              post.id === payload.new.id ? payload.new as GratitudePost : post
            ));
          } else if (payload.eventType === 'DELETE') {
            setPosts(current => current.filter(post => post.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    fetchPosts();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleAddPost = async (content: string) => {
    if (hasSubmitted) return;
    
    try {
      setIsPosting(true);
      const { data, error } = await supabase
        .from('posts')
        .insert([{ content, reactions: 0 }])
        .select()
        .single();

      if (error) throw error;
      setPosts(current => [data, ...current]);
      try { localStorage.setItem('gratitude_submitted', '1'); } catch {}
      setHasSubmitted(true);
    } catch (e) {
      console.error('Error adding post:', e);
      setError(e as Error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleReaction = async (postId: string) => {
    if (userReactions.has(postId)) return; // already liked on this device

    try {
      setIsReacting(current => ({ ...current, [postId]: true }));
      // Increment reactions via RPC
      await supabase.rpc('increment_reactions', { post_id: postId });

      // Update local posts state
      setPosts(current => current.map(p => p.id === postId ? { ...p, reactions: (p.reactions || 0) + 1 } : p));

      // Mark liked locally
      setUserReactions(current => {
        const next = new Set(current);
        next.add(postId);
        persistLikes(next);
        return next;
      });
    } catch (e) {
      console.error('Error handling reaction:', e);
      setError(e as Error);
    } finally {
      setIsReacting(current => ({ ...current, [postId]: false }));
    }
  };

  const handleHideToggle = async (postId: string, hide: boolean) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({ hidden: hide })
        .eq('id', postId);

      if (error) throw error;
      
      // Update local state
      setPosts(current => current.map(post => 
        post.id === postId ? { ...post, hidden: hide } : post
      ));
    } catch (e) {
      console.error('Error toggling post visibility:', e);
      setError(e as Error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    } catch (e) {
      console.error('Error deleting post:', e);
      setError(e as Error);
    }
  };

  // userReactions managed via localStorage above

  const visiblePosts = posts.filter(post => !post.hidden || isAdmin);
  const topPosts = [...visiblePosts]
    .sort((a, b) => b.reactions - a.reactions)
    .slice(0, 10);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-10 h-10 text-amber-600" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-rose-600 to-blue-600 bg-clip-text text-transparent">
                Gratitude Wall 2025
              </h1>
              <Sparkles className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Share your thank-yous to anyone or anything that helped you in 2025.
              Your gratitude matters.
            </p>
          </header>

          <div className="mb-8">
            {!hasSubmitted ? (
              <GratitudeForm onSubmit={handleAddPost} isLoading={isPosting} />
            ) : (
              <p className="mt-2 text-xl font-bold text-gray-600 text-center">Thanks! You already shared your gratitude.</p>
            )}
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex gap-4">
              <button
                onClick={() => setShowRecap(!showRecap)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-rose-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <TrendingUp className="w-5 h-5" />
                {showRecap ? 'Show All Posts' : 'View Top Posts Recap'}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setShowAdmin(s => !s)}
                  className="px-4 py-2 bg-gray-800 text-white rounded"
                >
                  Manage Posts
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : showRecap ? (
            <TopPostsRecap posts={topPosts} />
          ) : (
            <>
              {showAdmin && isAdmin && (
                <div className="mb-6">
                  <AdminPanel 
                    posts={posts} 
                    onHideToggle={handleHideToggle} 
                    onDelete={handleDelete} 
                  />
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visiblePosts.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      No gratitude posts yet. Be the first to share!
                    </p>
                  </div>
                ) : (
                  visiblePosts.map((post) => (
                    <GratitudeCard
                      key={post.id}
                      post={post}
                      onReact={handleReaction}
                      hasReacted={userReactions.has(post.id)}
                      isSignedIn={true}
                      isLoading={!!isReacting[post.id]}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
