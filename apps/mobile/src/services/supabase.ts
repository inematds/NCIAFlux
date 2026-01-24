import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@nciaflux/shared';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage adapter using SecureStore for React Native
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          plan: 'free' | 'basic' | 'advanced' | 'professional';
          role: 'user' | 'professional' | 'admin';
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          summary: string;
          insight: string;
          suggestion: string;
          energy_pattern: Record<string, string>;
          execution_style: string;
          distraction_triggers: string[];
          coping_strengths: string[];
          focus_duration_minutes: number;
          best_focus_time: string;
          needs_external_accountability: boolean;
          response_to_pressure: string;
          raw_answers: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          priority: 'high' | 'medium' | 'low';
          status: 'pending' | 'in_progress' | 'completed' | 'skipped';
          category: string;
          estimated_duration_minutes: number | null;
          scheduled_time: string | null;
          completed_at: string | null;
          parent_task_id: string | null;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      daily_plans: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          energy_level: number | null;
          mood: string | null;
          is_crisis_mode: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_plans']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['daily_plans']['Insert']>;
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          type: 'text' | 'check_in' | 'suggestion' | 'celebration';
          content: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>;
      };
      check_ins: {
        Row: {
          id: string;
          user_id: string;
          type: 'morning' | 'midday' | 'evening' | 'on_demand';
          energy_level: number;
          mood: string | null;
          notes: string | null;
          responses: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['check_ins']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['check_ins']['Insert']>;
      };
    };
  };
};
