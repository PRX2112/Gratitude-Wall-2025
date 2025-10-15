export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          content: string
          created_at: string
          reactions: number
          hidden: boolean | null
          user_id: string | null
        }
        Insert: {
          id?: string
          content: string
          created_at?: string
          reactions?: number
          hidden?: boolean | null
          user_id?: string | null
        }
        Update: {
          id?: string
          content?: string
          created_at?: string
          reactions?: number
          hidden?: boolean | null
          user_id?: string | null
        }
      }
      post_reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_reactions: {
        Args: { post_id: string }
        Returns: void
      }
      decrement_reactions: {
        Args: { post_id: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}