'use client';

// Profile types
export interface LocalProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
  avatar_url?: string;
  company?: string;
  createdAt: string;
}

export type ViewMode = 'personal' | 'management';

// Storage keys for profile management (not user-prefixed)
const PROFILES_KEY = 'nciaflux_profiles';
const ACTIVE_PROFILE_KEY = 'nciaflux_active_profile';
const VIEW_MODE_KEY = 'nciaflux_view_mode';

// Profile Manager Service
export const profileManager = {
  // Get all local profiles
  getProfiles(): LocalProfile[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(PROFILES_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Save profiles list
  saveProfiles(profiles: LocalProfile[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  },

  // Get active profile ID
  getActiveProfileId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  },

  // Set active profile
  setActiveProfile(profileId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  },

  // Get active profile object
  getActiveProfile(): LocalProfile | null {
    const profiles = this.getProfiles();
    const activeId = this.getActiveProfileId();
    if (!activeId) return null;
    return profiles.find(p => p.id === activeId) || null;
  },

  // Add or update profile
  upsertProfile(profile: LocalProfile): void {
    const profiles = this.getProfiles();
    const existingIndex = profiles.findIndex(p => p.id === profile.id);

    if (existingIndex >= 0) {
      profiles[existingIndex] = profile;
    } else {
      profiles.push(profile);
    }

    this.saveProfiles(profiles);
  },

  // Remove profile
  removeProfile(profileId: string): void {
    const profiles = this.getProfiles().filter(p => p.id !== profileId);
    this.saveProfiles(profiles);

    // If removing active profile, clear active
    if (this.getActiveProfileId() === profileId) {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
  },

  // Switch to a different profile
  switchProfile(profileId: string): LocalProfile | null {
    const profiles = this.getProfiles();
    const profile = profiles.find(p => p.id === profileId);

    if (profile) {
      this.setActiveProfile(profileId);
      // Reset view mode when switching profiles
      this.setViewMode('personal');
      return profile;
    }

    return null;
  },

  // Get current view mode (personal or management)
  getViewMode(): ViewMode {
    if (typeof window === 'undefined') return 'personal';
    const mode = localStorage.getItem(VIEW_MODE_KEY);
    return (mode === 'management' ? 'management' : 'personal') as ViewMode;
  },

  // Set view mode
  setViewMode(mode: ViewMode): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(VIEW_MODE_KEY, mode);
  },

  // Toggle view mode
  toggleViewMode(): ViewMode {
    const current = this.getViewMode();
    const newMode = current === 'personal' ? 'management' : 'personal';
    this.setViewMode(newMode);
    return newMode;
  },

  // Check if current profile can access management view
  canAccessManagement(): boolean {
    const profile = this.getActiveProfile();
    return profile?.role === 'manager' || profile?.role === 'admin';
  },

  // Create profile from user data (used during login/register)
  createProfileFromUser(user: {
    id: string;
    name: string;
    email: string;
    role?: string;
    company?: string;
    avatar_url?: string;
  }): LocalProfile {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role as 'user' | 'manager' | 'admin') || 'user',
      company: user.company,
      avatar_url: user.avatar_url,
      createdAt: new Date().toISOString(),
    };
  },

  // Initialize profile on login (adds to list if new, sets as active)
  initializeOnLogin(user: {
    id: string;
    name: string;
    email: string;
    role?: string;
    company?: string;
    avatar_url?: string;
  }): LocalProfile {
    const profile = this.createProfileFromUser(user);
    this.upsertProfile(profile);
    this.setActiveProfile(profile.id);
    return profile;
  },

  // Clear current session but keep profiles
  logout(): void {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
    localStorage.removeItem(VIEW_MODE_KEY);
  },

  // Clear everything (full reset)
  clearAll(): void {
    localStorage.removeItem(PROFILES_KEY);
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
    localStorage.removeItem(VIEW_MODE_KEY);
  },
};

// Helper to get user-prefixed storage key
export function getUserStorageKey(baseKey: string, userId?: string): string {
  const id = userId || profileManager.getActiveProfileId();
  if (!id) return baseKey; // Fallback to global key if no user
  return `nciaflux_${id}_${baseKey.replace('nciaflux_', '')}`;
}

// User-prefixed storage operations
export const userStorage = {
  get<T>(baseKey: string, userId?: string): T | null {
    if (typeof window === 'undefined') return null;
    const key = getUserStorageKey(baseKey, userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  set<T>(baseKey: string, value: T, userId?: string): void {
    if (typeof window === 'undefined') return;
    const key = getUserStorageKey(baseKey, userId);
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(baseKey: string, userId?: string): void {
    if (typeof window === 'undefined') return;
    const key = getUserStorageKey(baseKey, userId);
    localStorage.removeItem(key);
  },

  // Get raw string value
  getRaw(baseKey: string, userId?: string): string | null {
    if (typeof window === 'undefined') return null;
    const key = getUserStorageKey(baseKey, userId);
    return localStorage.getItem(key);
  },

  // Set raw string value
  setRaw(baseKey: string, value: string, userId?: string): void {
    if (typeof window === 'undefined') return;
    const key = getUserStorageKey(baseKey, userId);
    localStorage.setItem(key, value);
  },
};

// Migration helper: move old global keys to user-prefixed keys
export function migrateToUserPrefixedStorage(userId: string): void {
  if (typeof window === 'undefined') return;

  const keysToMigrate = [
    'nciaflux_tasks',
    'nciaflux_projects',
    'nciaflux_notes',
    'nciaflux_checkins',
    'nciaflux_focus_stats',
    'nciaflux_calendar_events',
    'nciaflux_weekly_reviews',
    'nciaflux_monthly_reviews',
    'nciaflux_chronotype',
    'nciaflux_cognitive_profile',
    'nciaflux_crisis_events',
    'nciaflux_morning_routine',
    'nciaflux_evening_routine',
    'nciaflux_brain_dump',
    'nciaflux_discovery_answers',
    'nciaflux_suggested_routine',
    'nciaflux_teams',
    'nciaflux_settings',
  ];

  // Also migrate date-specific planner keys
  const allKeys = Object.keys(localStorage);
  const plannerKeys = allKeys.filter(k => k.startsWith('nciaflux_planner_'));

  const allKeysToMigrate = [...keysToMigrate, ...plannerKeys];

  allKeysToMigrate.forEach(oldKey => {
    const data = localStorage.getItem(oldKey);
    if (data) {
      const newKey = getUserStorageKey(oldKey, userId);
      // Only migrate if new key doesn't already exist
      if (!localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, data);
      }
      // Remove old key after migration
      localStorage.removeItem(oldKey);
    }
  });
}
