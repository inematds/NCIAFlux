/* eslint-disable no-console */
/**
 * Hybrid Storage Service
 *
 * Combines localStorage (for free users) with Supabase (for stats tracking)
 * - Free users: data stored locally, only registration stats go to Supabase
 * - Paid users (future): full cloud sync with Supabase
 */

import { supabase, isDemoMode } from './supabase';
import { userStorage, tasksStorage, StoredUser, StoredTask } from './storage';

// Types for user stats (mirrors Supabase table)
export interface UserStats {
  id?: string;
  email: string;
  name?: string;
  storage_mode: 'local' | 'cloud';
  plan: 'free' | 'basic' | 'advanced' | 'professional';
  role: 'user' | 'manager' | 'admin';
  tasks_created: number;
  tasks_completed: number;
  teams_created: number;
  last_activity_at?: string;
  browser?: string;
  platform?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper to detect browser/platform
function getBrowserInfo(): { browser: string; platform: string } {
  if (typeof window === 'undefined') {
    return { browser: 'unknown', platform: 'unknown' };
  }

  const ua = navigator.userAgent;
  let browser = 'unknown';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera')) browser = 'Opera';

  return {
    browser,
    platform: navigator.platform || 'unknown',
  };
}

/**
 * User Stats Service - tracks minimal user data in Supabase
 */
export const userStatsService = {
  /**
   * Register or update user stats in Supabase
   * Called on registration and login
   */
  async upsertUserStats(user: StoredUser): Promise<UserStats | null> {
    // Skip if Supabase not configured
    if (isDemoMode || !supabase) {
      console.log('[HybridStorage] Supabase not configured, skipping stats');
      return null;
    }

    const { browser, platform } = getBrowserInfo();

    try {
      const { data, error } = await supabase.rpc('upsert_user_stats', {
        p_email: user.email,
        p_name: user.name,
        p_role: user.role || 'user',
        p_browser: browser,
        p_platform: platform,
      });

      if (error) {
        console.error('[HybridStorage] Error upserting user stats:', error);
        return null;
      }

      console.log('[HybridStorage] User stats saved to Supabase');
      return data as UserStats;
    } catch (err) {
      console.error('[HybridStorage] Failed to save user stats:', err);
      return null;
    }
  },

  /**
   * Increment task statistics
   * Called when tasks are created or completed
   */
  async incrementTaskStats(email: string, created: number = 0, completed: number = 0): Promise<void> {
    if (isDemoMode || !supabase) return;

    try {
      await supabase.rpc('increment_task_stats', {
        p_email: email,
        p_created: created,
        p_completed: completed,
      });
      console.log('[HybridStorage] Task stats incremented');
    } catch (err) {
      console.error('[HybridStorage] Failed to increment task stats:', err);
    }
  },

  /**
   * Increment team statistics
   * Called when teams are created
   */
  async incrementTeamStats(email: string, created: number = 1): Promise<void> {
    if (isDemoMode || !supabase) return;

    try {
      await supabase.rpc('increment_team_stats', {
        p_email: email,
        p_created: created,
      });
      console.log('[HybridStorage] Team stats incremented');
    } catch (err) {
      console.error('[HybridStorage] Failed to increment team stats:', err);
    }
  },

  /**
   * Get user stats from Supabase
   */
  async getUserStats(email: string): Promise<UserStats | null> {
    if (isDemoMode || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('[HybridStorage] Error fetching user stats:', error);
        return null;
      }

      return data as UserStats;
    } catch (err) {
      console.error('[HybridStorage] Failed to fetch user stats:', err);
      return null;
    }
  },
};

/**
 * Hybrid Task Service - localStorage with Supabase stats tracking
 */
export const hybridTasksService = {
  /**
   * Add a task (local) and update stats (Supabase)
   */
  add(task: Omit<StoredTask, 'id' | 'createdAt' | 'updatedAt'>): StoredTask {
    const newTask = tasksStorage.add(task);

    // Update stats in background
    const user = userStorage.get();
    if (user) {
      userStatsService.incrementTaskStats(user.email, 1, 0);
    }

    return newTask;
  },

  /**
   * Update a task (local) and track completion stats (Supabase)
   */
  update(id: string, updates: Partial<StoredTask>): StoredTask | null {
    const oldTask = tasksStorage.getById(id);
    const updatedTask = tasksStorage.update(id, updates);

    // Track completion if status changed to completed
    if (updatedTask && updates.status === 'completed' && oldTask?.status !== 'completed') {
      const user = userStorage.get();
      if (user) {
        userStatsService.incrementTaskStats(user.email, 0, 1);
      }
    }

    return updatedTask;
  },

  /**
   * Get all tasks (from localStorage)
   */
  getAll(): StoredTask[] {
    return tasksStorage.getAll();
  },

  /**
   * Delete a task (from localStorage)
   */
  delete(id: string): boolean {
    return tasksStorage.delete(id);
  },

  /**
   * Get task by ID (from localStorage)
   */
  getById(id: string): StoredTask | null {
    return tasksStorage.getById(id);
  },
};

/**
 * Storage Mode Service - manages user's storage preference
 */
export const storageModeService = {
  /**
   * Check if user is using local storage mode
   */
  isLocalMode(): boolean {
    // For now, all free users use local mode
    // In future, can check user.plan for paid users
    return true;
  },

  /**
   * Check if Supabase is available for stats tracking
   */
  isStatsTrackingEnabled(): boolean {
    return !isDemoMode && supabase !== null;
  },

  /**
   * Get current storage mode info
   */
  getStorageInfo(): {
    mode: 'local' | 'cloud';
    statsEnabled: boolean;
    supabaseConnected: boolean;
  } {
    return {
      mode: this.isLocalMode() ? 'local' : 'cloud',
      statsEnabled: this.isStatsTrackingEnabled(),
      supabaseConnected: !isDemoMode && supabase !== null,
    };
  },
};

/**
 * Initialize hybrid storage on app startup
 * Updates user stats if logged in
 */
export async function initializeHybridStorage(): Promise<void> {
  const user = userStorage.get();
  if (user) {
    await userStatsService.upsertUserStats(user);
  }
}
