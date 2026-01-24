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
const DEFAULT_TASKS: StoredTask[] = [
  {
    id: 'task_1',
    title: 'Revisar documentação do projeto',
    description: 'Atualizar README e documentação técnica',
    assignee: 'Usuário Demo',
    priority: 'high',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    category: 'Trabalho',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task_2',
    title: 'Preparar apresentação semanal',
    description: 'Slides para reunião de status',
    assignee: 'Usuário Demo',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    category: 'Trabalho',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task_3',
    title: 'Corrigir bug no módulo de pagamentos',
    description: 'Erro reportado pelo cliente #1234',
    assignee: 'Usuário Demo',
    priority: 'high',
    status: 'completed',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Trabalho',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!data) {
      // Initialize with default tasks
      this.setAll(DEFAULT_TASKS);
      return DEFAULT_TASKS;
    }
    return JSON.parse(data);
  },

  setAll(tasks: StoredTask[]): void {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
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

// Clear all data (for logout)
export function clearAllStorage(): void {
  if (!isBrowser) return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
