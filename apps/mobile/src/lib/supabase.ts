import 'react-native-url-polyfill/polyfill';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check if we're in demo mode (no Supabase credentials)
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

// Create Supabase client only if we have credentials
export const supabase = !isDemoMode
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Types from database
export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'basic' | 'advanced' | 'professional';
  role: 'user' | 'professional' | 'admin';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbTask {
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
}

export interface DbCheckIn {
  id: string;
  user_id: string;
  type: 'morning' | 'midday' | 'evening' | 'on_demand';
  energy_level: number;
  mood: string | null;
  notes: string | null;
  responses: Record<string, unknown> | null;
  created_at: string;
}

export interface DbDailyPlan {
  id: string;
  user_id: string;
  date: string;
  energy_level: number | null;
  mood: string | null;
  is_crisis_mode: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbFocusBlock {
  id: string;
  user_id: string;
  daily_plan_id: string | null;
  start_time: string;
  duration_minutes: number;
  technique: 'pomodoro' | 'deep_work' | 'timeboxing' | 'free_flow';
  task_id: string | null;
  completed: boolean;
  actual_duration_minutes: number | null;
  created_at: string;
}

export interface DbProfile {
  id: string;
  user_id: string | null;
  session_id: string | null;
  summary: string;
  insight: string;
  suggestion: string;
  energy_pattern: Record<string, unknown>;
  execution_style: 'sequential' | 'parallel' | 'burst' | null;
  distraction_triggers: string[];
  coping_strengths: string[];
  focus_duration_minutes: number;
  best_focus_time: string | null;
  needs_external_accountability: boolean;
  response_to_pressure: 'thrives' | 'freezes' | 'mixed' | null;
  raw_answers: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
