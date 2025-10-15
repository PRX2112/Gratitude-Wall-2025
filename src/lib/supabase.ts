import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Optional helper: type-safe post operations
export async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPost(content: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert([{ content }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePost(id: string, updates: { hidden?: boolean }) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

export async function updateReactions(id: string, delta: number) {
  if (delta >= 0) {
    const { data, error } = await supabase.rpc('increment_reactions', { post_id: id });
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase.rpc('decrement_reactions', { post_id: id });
    if (error) throw error;
    return data;
  }
}