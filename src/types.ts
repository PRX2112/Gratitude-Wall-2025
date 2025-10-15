import type { Database } from './types/supabase';

export type GratitudePost = Database['public']['Tables']['posts']['Row'];
export type GratitudeReaction = Database['public']['Tables']['post_reactions']['Row'];
