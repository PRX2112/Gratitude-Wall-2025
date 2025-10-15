import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Post = Database['public']['Tables']['posts']['Row'];

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Load posts when component mounts
  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      setError(undefined);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPosts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  async function handleHideToggle(post: Post) {
    if (!isAdmin) return;
    try {
      const { error } = await supabase
        .from('posts')
        .update({ hidden: !post.hidden })
        .eq('id', post.id);
      
      if (error) throw error;
      setPosts(posts.map(p => 
        p.id === post.id ? { ...p, hidden: !p.hidden } : p
      ));
    } catch (e) {
      console.error('Failed to toggle post visibility:', e);
      alert('Failed to update post. Please try again.');
    }
  }

  async function handleDelete(post: Post) {
    if (!isAdmin || !confirm('Are you sure you want to delete this post?')) return;
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);
      
      if (error) throw error;
      setPosts(posts.filter(p => p.id !== post.id));
    } catch (e) {
      console.error('Failed to delete post:', e);
      alert('Failed to delete post. Please try again.');
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">You must be an admin to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error: {error}
        <button onClick={loadPosts} className="ml-4 underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Manage Posts</h1>
        <p className="text-gray-600">
          {posts.length} total posts, {posts.filter(p => p.hidden).length} hidden
        </p>
      </header>

      <div className="space-y-4">
        {posts.map(post => (
          <div
            key={post.id}
            className={`p-4 rounded-lg border ${
              post.hidden ? 'bg-gray-50' : 'bg-white'
            }`}
          >
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <p className={post.hidden ? 'text-gray-500' : ''}>
                  {post.content}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Posted {new Date(post.created_at).toLocaleString()}
                  {post.author_id && ' by user ' + post.author_id}
                </p>
                <p className="text-sm text-gray-500">
                  {post.reactions} reactions
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleHideToggle(post)}
                  className={`px-3 py-1 rounded ${
                    post.hidden
                      ? 'bg-green-600 text-white'
                      : 'bg-yellow-600 text-white'
                  }`}
                >
                  {post.hidden ? 'Show' : 'Hide'}
                </button>
                <button
                  onClick={() => handleDelete(post)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}