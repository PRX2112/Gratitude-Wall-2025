import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Heart, Sparkles, TrendingUp } from 'lucide-react';
import GratitudeForm from './components/GratitudeForm';
import GratitudeCard from './components/GratitudeCard';
import TopPostsRecap from './components/TopPostsRecap';
import { GratitudePost } from './types';

function App() {
  const [posts, setPosts] = useState<GratitudePost[]>([]);
  const [showRecap, setShowRecap] = useState(false);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const API_BASE = 'http://localhost:4000/api';
  const SOCKET_URL = 'http://localhost:4000';

  useEffect(() => {
    // Try to fetch from server API first. If it fails, fallback to localStorage.
    const fetchFromServer = async () => {
      try {
        const res = await fetch(`${API_BASE}/posts`);
        if (!res.ok) throw new Error('server responded ' + res.status);
        const data: GratitudePost[] = await res.json();
        setPosts(data);
        return;
      } catch (e) {
        // server not available, fall back
        const savedPosts = localStorage.getItem('gratitudePosts');
        if (savedPosts) setPosts(JSON.parse(savedPosts));
      }
    };

    const loadReactions = () => {
      const savedReactions = localStorage.getItem('userReactions');
      if (savedReactions) setUserReactions(new Set(JSON.parse(savedReactions)));
    };

    fetchFromServer();
    loadReactions();
    // open socket for realtime reactions/posts
    let socket: Socket | null = null;
    try {
      socket = io(SOCKET_URL);
      socket.on('new_post', (post: GratitudePost) => {
        setPosts(current => [post, ...current.filter(p => p.id !== post.id)]);
      });
      socket.on('reaction_updated', ({ id, reactions }: { id: string; reactions: number }) => {
        setPosts(current => current.map(p => p.id === id ? { ...p, reactions } : p));
      });
    } catch (e) {
      console.warn('Realtime socket unavailable', e);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const handleAddPost = async (content: string) => {
    const newPost: GratitudePost = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toISOString(),
      reactions: 0
    };

    // optimistic update
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('gratitudePosts', JSON.stringify(updatedPosts));

    // try to persist to server
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      if (!res.ok) {
        console.warn('Server failed to save post, using localStorage only');
      }
    } catch (e) {
      // server unreachable; keep localStorage as fallback
      console.warn('Could not reach server, saved locally');
    }
  };

  const handleReaction = async (postId: string) => {
    const reactionKey = postId;
    const newReactions = new Set(userReactions);
    let delta = 0;

    if (newReactions.has(reactionKey)) {
      newReactions.delete(reactionKey);
      delta = -1;
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, reactions: post.reactions - 1 }
          : post
      ));
    } else {
      newReactions.add(reactionKey);
      delta = 1;
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, reactions: post.reactions + 1 }
          : post
      ));
    }

    setUserReactions(newReactions);
    localStorage.setItem('userReactions', JSON.stringify([...newReactions]));
    localStorage.setItem('gratitudePosts', JSON.stringify(posts.map(post =>
      post.id === postId
        ? { ...post, reactions: newReactions.has(reactionKey) ? post.reactions + delta : Math.max(0, post.reactions - delta) }
        : post
    )));

    // tell server about reaction (best-effort)
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
      if (!res.ok) console.warn('Server failed to record reaction');
    } catch (e) {
      console.warn('Could not reach server to record reaction');
    }
  };

  const topPosts = [...posts].sort((a, b) => b.reactions - a.reactions).slice(0, 10);

  return (
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
            Share your anonymous thank-yous to anyone or anything that helped you in 2025.
            Your gratitude matters.
          </p>
        </header>

        <div className="mb-8">
          <GratitudeForm onSubmit={handleAddPost} />
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowRecap(!showRecap)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-rose-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <TrendingUp className="w-5 h-5" />
            {showRecap ? 'Show All Posts' : 'View Top Posts Recap'}
          </button>
        </div>

        {showRecap ? (
          <TopPostsRecap posts={topPosts} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No gratitude posts yet. Be the first to share!
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <GratitudeCard
                  key={post.id}
                  post={post}
                  onReact={handleReaction}
                  hasReacted={userReactions.has(post.id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
