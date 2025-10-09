import { useState, useEffect } from 'react';
import { Heart, Sparkles, TrendingUp } from 'lucide-react';
import GratitudeForm from './components/GratitudeForm';
import GratitudeCard from './components/GratitudeCard';
import TopPostsRecap from './components/TopPostsRecap';
import { GratitudePost } from './types';

function App() {
  const [posts, setPosts] = useState<GratitudePost[]>([]);
  const [showRecap, setShowRecap] = useState(false);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedPosts = localStorage.getItem('gratitudePosts');
    const savedReactions = localStorage.getItem('userReactions');

    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
    if (savedReactions) {
      setUserReactions(new Set(JSON.parse(savedReactions)));
    }
  }, []);

  const handleAddPost = (content: string) => {
    const newPost: GratitudePost = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toISOString(),
      reactions: 0
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('gratitudePosts', JSON.stringify(updatedPosts));
  };

  const handleReaction = (postId: string) => {
    const reactionKey = postId;
    const newReactions = new Set(userReactions);

    if (newReactions.has(reactionKey)) {
      newReactions.delete(reactionKey);
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, reactions: post.reactions - 1 }
          : post
      ));
    } else {
      newReactions.add(reactionKey);
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, reactions: post.reactions + 1 }
          : post
      ));
    }

    setUserReactions(newReactions);
    localStorage.setItem('userReactions', JSON.stringify([...newReactions]));

    const updatedPosts = posts.map(post =>
      post.id === postId
        ? { ...post, reactions: newReactions.has(reactionKey) ? post.reactions + 1 : post.reactions - 1 }
        : post
    );
    localStorage.setItem('gratitudePosts', JSON.stringify(updatedPosts));
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
