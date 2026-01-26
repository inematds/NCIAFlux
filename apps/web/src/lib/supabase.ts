import { createClient, User, Session, AuthError } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if we're in demo mode (no Supabase credentials)
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

// Create Supabase client only if we have credentials
export const supabase = !isDemoMode
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// ============================================
// DATABASE TYPES
// ============================================

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
  max_members: number;
  member_count: number;
  is_active: boolean;
  feature_preset: string;
  created_at: string;
  updated_at: string;
}

export interface DbTeamMember {
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  nickname: string | null;
  is_active: boolean;
  joined_at: string;
}

export interface DbUserGamification {
  user_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  streak_paused_days: number;
  updated_at: string;
}

export interface DbUserAdaptiveSettings {
  user_id: string;
  chronotype: 'morning' | 'neutral' | 'evening' | null;
  wake_time: string | null;
  sleep_time: string | null;
  peak_hours: number[];
  preferred_focus_duration: number;
  feature_level: number;
  gamification_enabled: boolean;
  sync_enabled: boolean;
  last_sync_at: string | null;
}

export interface DbPartnership {
  id: string;
  user_a: string;
  user_b: string;
  status: 'pending' | 'active' | 'blocked' | 'ended';
  initiated_by: string;
  share_achievements: boolean;
  share_streaks: boolean;
  created_at: string;
}

export interface DbCommunity {
  id: string;
  name: string;
  description: string | null;
  rules: string | null;
  owner_id: string;
  is_public: boolean;
  max_members: number;
  member_count: number;
  invite_code: string | null;
  created_at: string;
}

// ============================================
// AUTH RESULT TYPES
// ============================================

interface AuthResult {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
  error: AuthError | null;
}

interface DemoAuthResult {
  data: {
    user: { id: string; email: string };
    session: { access_token: string };
  };
  error: null;
}

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResult | DemoAuthResult> {
  if (isDemoMode || !supabase) {
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

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, name: string): Promise<AuthResult | DemoAuthResult> {
  if (isDemoMode || !supabase) {
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

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  if (isDemoMode || !supabase) {
    console.warn('[Auth] Google OAuth not available in demo mode');
    return { data: null, error: new Error('Google OAuth not available in demo mode') };
  }

  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  if (isDemoMode || !supabase) {
    console.warn('[Auth] Password reset not available in demo mode');
    return { data: null, error: null };
  }

  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
}

/**
 * Update password (after reset)
 */
export async function updatePassword(newPassword: string) {
  if (isDemoMode || !supabase) {
    console.warn('[Auth] Password update not available in demo mode');
    return { data: null, error: null };
  }

  return supabase.auth.updateUser({ password: newPassword });
}

/**
 * Sign out
 */
export async function signOut() {
  if (isDemoMode || !supabase) {
    return { error: null };
  }
  return supabase.auth.signOut();
}

/**
 * Get current session
 */
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

/**
 * Get current user
 */
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

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  if (isDemoMode || !supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
}

// ============================================
// USER PROFILE FUNCTIONS
// ============================================

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string): Promise<DbUser | null> {
  if (isDemoMode || !supabase) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[Supabase] Error fetching user profile:', error);
    return null;
  }

  return data as DbUser;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<DbUser>) {
  if (isDemoMode || !supabase) return { data: null, error: null };

  return supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
}

// ============================================
// GAMIFICATION FUNCTIONS
// ============================================

/**
 * Add XP to user
 */
export async function addXP(userId: string, amount: number, source: string, sourceId?: string, description?: string) {
  if (isDemoMode || !supabase) return null;

  const { data, error } = await supabase.rpc('add_xp', {
    p_user_id: userId,
    p_amount: amount,
    p_source: source,
    p_source_id: sourceId,
    p_description: description,
  });

  if (error) {
    console.error('[Supabase] Error adding XP:', error);
    return null;
  }

  return data;
}

/**
 * Update user streak
 */
export async function updateStreak(userId: string) {
  if (isDemoMode || !supabase) return null;

  const { data, error } = await supabase.rpc('update_streak', {
    p_user_id: userId,
  });

  if (error) {
    console.error('[Supabase] Error updating streak:', error);
    return null;
  }

  return data;
}

/**
 * Get user gamification data
 */
export async function getUserGamification(userId: string): Promise<DbUserGamification | null> {
  if (isDemoMode || !supabase) return null;

  const { data, error } = await supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('[Supabase] Error fetching gamification:', error);
    return null;
  }

  return data;
}

/**
 * Get user achievements
 */
export async function getUserAchievements(userId: string) {
  if (isDemoMode || !supabase) return [];

  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching achievements:', error);
    return [];
  }

  return data;
}

// ============================================
// ADAPTIVE SETTINGS FUNCTIONS
// ============================================

/**
 * Get user adaptive settings
 */
export async function getUserAdaptiveSettings(userId: string): Promise<DbUserAdaptiveSettings | null> {
  if (isDemoMode || !supabase) return null;

  const { data, error } = await supabase
    .from('user_adaptive_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('[Supabase] Error fetching adaptive settings:', error);
    return null;
  }

  return data;
}

/**
 * Update user adaptive settings
 */
export async function updateUserAdaptiveSettings(userId: string, updates: Partial<DbUserAdaptiveSettings>) {
  if (isDemoMode || !supabase) return { data: null, error: null };

  return supabase
    .from('user_adaptive_settings')
    .upsert({ user_id: userId, ...updates })
    .select()
    .single();
}

/**
 * Get stability score
 */
export async function getStabilityScore(userId: string, days: number = 7): Promise<number> {
  if (isDemoMode || !supabase) return 50;

  const { data, error } = await supabase.rpc('calculate_stability_score', {
    p_user_id: userId,
    p_days: days,
  });

  if (error) {
    console.error('[Supabase] Error calculating stability:', error);
    return 50;
  }

  return data || 50;
}

// ============================================
// TEAM FUNCTIONS
// ============================================

/**
 * Get user's teams
 */
export async function getUserTeams(userId: string): Promise<DbTeam[]> {
  if (isDemoMode || !supabase) return [];

  const { data, error } = await supabase
    .from('team_members')
    .select(`
      team:teams(*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    console.error('[Supabase] Error fetching teams:', error);
    return [];
  }

  return data.map((d: { team: DbTeam }) => d.team);
}

/**
 * Generate team invite code
 */
export async function generateTeamInvite(teamId: string, role: string = 'member', maxUses: number = 1, expiresDays: number = 7) {
  if (isDemoMode || !supabase) return null;

  const { data, error } = await supabase.rpc('generate_team_invite', {
    p_team_id: teamId,
    p_role: role,
    p_max_uses: maxUses,
    p_expires_days: expiresDays,
  });

  if (error) {
    console.error('[Supabase] Error generating invite:', error);
    return null;
  }

  return data;
}

/**
 * Join team with invite code
 */
export async function joinTeamWithCode(code: string) {
  if (isDemoMode || !supabase) return { success: false, error: 'Demo mode' };

  const { data, error } = await supabase.rpc('join_team_with_code', {
    p_code: code,
  });

  if (error) {
    console.error('[Supabase] Error joining team:', error);
    return { success: false, error: error.message };
  }

  return data;
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to direct messages
 */
export function subscribeToDirectMessages(partnershipId: string, callback: (message: unknown) => void) {
  if (isDemoMode || !supabase) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`dm:${partnershipId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `partnership_id=eq.${partnershipId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return {
    unsubscribe: () => channel.unsubscribe(),
  };
}

/**
 * Subscribe to community messages
 */
export function subscribeToCommunityMessages(communityId: string, callback: (message: unknown) => void) {
  if (isDemoMode || !supabase) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`community:${communityId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: `community_id=eq.${communityId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return {
    unsubscribe: () => channel.unsubscribe(),
  };
}
