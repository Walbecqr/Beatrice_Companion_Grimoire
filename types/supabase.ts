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
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          spiritual_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          spiritual_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          spiritual_path?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          mood: string | null
          moon_phase: string | null
          beatrice_reflection: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content: string
          mood?: string | null
          moon_phase?: string | null
          beatrice_reflection?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          mood?: string | null
          moon_phase?: string | null
          beatrice_reflection?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          created_at?: string
        }
      }
      journal_entry_tags: {
        Row: {
          journal_entry_id: string
          tag_id: string
        }
        Insert: {
          journal_entry_id: string
          tag_id: string
        }
        Update: {
          journal_entry_id?: string
          tag_id?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string
        }
      }
      daily_checkins: {
        Row: {
          id: string
          user_id: string
          prompt: string
          response: string | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          response?: string | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          response?: string | null
          completed?: boolean
          created_at?: string
        }
      }
      rituals: {
        Row: {
          id: string
          user_id: string
          title: string
          intent: string | null
          description: string | null
          moon_phase: string | null
          tools_used: string[] | null
          outcome: string | null
          performed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          intent?: string | null
          description?: string | null
          moon_phase?: string | null
          tools_used?: string[] | null
          outcome?: string | null
          performed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          intent?: string | null
          description?: string | null
          moon_phase?: string | null
          tools_used?: string[] | null
          outcome?: string | null
          performed_at?: string
          created_at?: string
        }
      }
    }
  }
}