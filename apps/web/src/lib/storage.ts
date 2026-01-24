/**
 * Storage Service - Centralized localStorage management for demo mode
 */

const STORAGE_KEYS = {
  USER: 'nciaflux_demo_user',
  TASKS: 'nciaflux_tasks',
  SETTINGS: 'nciaflux_settings',
  TEAMS: 'nciaflux_teams',
} as const;

// Types
export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: string;
  company?: string;
  avatar_url?: string;
  password?: string; // For demo mode password change
}

export interface StoredTeam {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  members: StoredTeamMember[];
}

export interface StoredTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'away' | 'offline';
  productivity: number;
  lastCheckIn: string;
}

export interface StoredTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  dueDate: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSettings {
  notifications: {
    email: boolean;
    push: boolean;
    weeklyReport: boolean;
    teamAlerts: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}

// Default data
const DEFAULT_SETTINGS: StoredSettings = {
  notifications: {
    email: true,
    push: true,
    weeklyReport: true,
    teamAlerts: true,
  },
  preferences: {
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
  },
};

// Helper to check if we're in browser
const isBrowser = typeof window !== 'undefined';

// User Storage
export const userStorage = {
  get(): StoredUser | null {
    if (!isBrowser) return null;
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  set(user: StoredUser): void {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  remove(): void {
    if (!isBrowser) return;
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  isAuthenticated(): boolean {
    return this.get() !== null;
  },
};

// Tasks Storage
export const tasksStorage = {
  getAll(): StoredTask[] {
    if (!isBrowser) return [];
    const user = userStorage.get();
    // Tasks are stored per user
    const key = user ? `${STORAGE_KEYS.TASKS}_${user.id}` : STORAGE_KEYS.TASKS;
    const data = localStorage.getItem(key);
    if (!data) {
      return []; // Start with empty tasks for new users
    }
    return JSON.parse(data);
  },

  setAll(tasks: StoredTask[]): void {
    if (!isBrowser) return;
    const user = userStorage.get();
    const key = user ? `${STORAGE_KEYS.TASKS}_${user.id}` : STORAGE_KEYS.TASKS;
    localStorage.setItem(key, JSON.stringify(tasks));
  },

  add(task: Omit<StoredTask, 'id' | 'createdAt' | 'updatedAt'>): StoredTask {
    const tasks = this.getAll();
    const newTask: StoredTask = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    this.setAll(tasks);
    return newTask;
  },

  update(id: string, updates: Partial<StoredTask>): StoredTask | null {
    const tasks = this.getAll();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setAll(tasks);
    return tasks[index];
  },

  delete(id: string): boolean {
    const tasks = this.getAll();
    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length === tasks.length) return false;
    this.setAll(filtered);
    return true;
  },

  getById(id: string): StoredTask | null {
    const tasks = this.getAll();
    return tasks.find((t) => t.id === id) || null;
  },
};

// Settings Storage
export const settingsStorage = {
  get(): StoredSettings {
    if (!isBrowser) return DEFAULT_SETTINGS;
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      this.set(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(data);
  },

  set(settings: StoredSettings): void {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  update(updates: Partial<StoredSettings>): StoredSettings {
    const current = this.get();
    const updated = { ...current, ...updates };
    this.set(updated);
    return updated;
  },
};

// Teams Storage
export const teamsStorage = {
  getAll(): StoredTeam[] {
    if (!isBrowser) return [];
    const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return data ? JSON.parse(data) : [];
  },

  setAll(teams: StoredTeam[]): void {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  },

  add(team: Omit<StoredTeam, 'id' | 'createdAt'>): StoredTeam {
    const teams = this.getAll();
    const newTeam: StoredTeam = {
      ...team,
      id: `team_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    teams.push(newTeam);
    this.setAll(teams);
    return newTeam;
  },

  update(id: string, updates: Partial<StoredTeam>): StoredTeam | null {
    const teams = this.getAll();
    const index = teams.findIndex((t) => t.id === id);
    if (index === -1) return null;
    teams[index] = { ...teams[index], ...updates };
    this.setAll(teams);
    return teams[index];
  },

  delete(id: string): boolean {
    const teams = this.getAll();
    const filtered = teams.filter((t) => t.id !== id);
    if (filtered.length === teams.length) return false;
    this.setAll(filtered);
    return true;
  },

  addMember(teamId: string, member: StoredTeamMember): StoredTeam | null {
    const teams = this.getAll();
    const index = teams.findIndex((t) => t.id === teamId);
    if (index === -1) return null;
    teams[index].members.push(member);
    this.setAll(teams);
    return teams[index];
  },

  removeMember(teamId: string, memberId: string): boolean {
    const teams = this.getAll();
    const index = teams.findIndex((t) => t.id === teamId);
    if (index === -1) return false;
    teams[index].members = teams[index].members.filter((m) => m.id !== memberId);
    this.setAll(teams);
    return true;
  },
};

// Clear all data (for logout)
export function clearAllStorage(): void {
  if (!isBrowser) return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
