import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if we're in demo mode (no Supabase credentials)
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

// Create Supabase client only if we have credentials
export const supabase = !isDemoMode
  ? createClient(supabaseUrl!, supabaseAnonKey!)
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

export interface DbTeam {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface DbTeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

// Auth helper functions
export async function signIn(email: string, password: string) {
  if (isDemoMode || !supabase) {
    // Demo mode - simulate successful login
    return {
      data: {
        user: { id: 'demo-user', email },
        session: { access_token: 'demo-token' },
      },
      error: null,
    };
  }
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, name: string) {
  if (isDemoMode || !supabase) {
    // Demo mode - simulate successful signup
    return {
      data: {
        user: { id: 'demo-user', email },
        session: { access_token: 'demo-token' },
      },
      error: null,
    };
  }
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
}

export async function signOut() {
  if (isDemoMode || !supabase) {
    return { error: null };
  }
  return supabase.auth.signOut();
}

export async function getSession() {
  if (isDemoMode || !supabase) {
    return {
      data: {
        session: null,
      },
      error: null,
    };
  }
  return supabase.auth.getSession();
}

export async function getUser() {
  if (isDemoMode || !supabase) {
    return {
      data: {
        user: null,
      },
      error: null,
    };
  }
  return supabase.auth.getUser();
}
