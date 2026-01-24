import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { User, AuthSession, STORAGE_KEYS } from '@nciaflux/shared';
import { supabase, isDemoMode } from '../services/supabase';

// Demo user for offline mode
const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@neurofluxo.app',
  name: 'Usuario Demo',
  avatar_url: null,
  plan: 'basic',
  role: 'user',
  onboarding_completed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session or finish loading
    if (isDemoMode) {
      // In demo mode, check if user was previously "logged in"
      checkDemoSession();
    } else if (supabase) {
      checkSession();
      const cleanup = setupAuthListener();
      return cleanup;
    } else {
      // Fallback - finish loading without auto-login
      setIsLoading(false);
    }
  }, []);

  async function checkDemoSession() {
    try {
      const savedUser = await SecureStore.getItemAsync('nciaflux_demo_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser) as User;
        setUser(userData);
        setSession({
          access_token: 'demo-token',
          refresh_token: 'demo-refresh-token',
          expires_at: Date.now() + 3600000,
          user: userData,
        });
      }
    } catch (error) {
      console.error('Error checking demo session:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveDemoUser(userData: User) {
    try {
      await SecureStore.setItemAsync('nciaflux_demo_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving demo user:', error);
    }
  }

  async function clearDemoUser() {
    try {
      await SecureStore.deleteItemAsync('nciaflux_demo_user');
    } catch (error) {
      console.error('Error clearing demo user:', error);
    }
  }

  function setupAuthListener() {
    if (!supabase) return () => {};

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await saveSession(session);
          await fetchUser(session.user.id);
        } else {
          await clearSession();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }

  async function checkSession() {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const storedToken = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);

      if (storedToken) {
        const { data, error } = await supabase.auth.getSession();

        if (data?.session && !error) {
          await fetchUser(data.session.user.id);
        } else {
          await clearSession();
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchUser(userId: string) {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUser(data as User);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  async function saveSession(session: { access_token: string; refresh_token: string }) {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, session.access_token);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, session.refresh_token);
  }

  async function clearSession() {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    setUser(null);
    setSession(null);
  }

  async function login(email: string, password: string) {
    if (isDemoMode || !supabase) {
      // In demo mode, any login works - save the user data
      const userData: User = {
        ...DEMO_USER,
        id: `demo-${Date.now()}`,
        email,
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      };
      await saveDemoUser(userData);
      setUser(userData);
      setSession({
        access_token: 'demo-token',
        refresh_token: 'demo-refresh-token',
        expires_at: Date.now() + 3600000,
        user: userData,
      });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.session) {
      await saveSession(data.session);
      await fetchUser(data.user.id);
    }
  }

  async function register(email: string, password: string, name?: string) {
    if (isDemoMode || !supabase) {
      // In demo mode, registration creates and saves user
      const userData: User = {
        ...DEMO_USER,
        id: `demo-${Date.now()}`,
        email,
        name: name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        onboarding_completed: false, // New users need onboarding
      };
      await saveDemoUser(userData);
      setUser(userData);
      setSession({
        access_token: 'demo-token',
        refresh_token: 'demo-refresh-token',
        expires_at: Date.now() + 3600000,
        user: userData,
      });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) throw error;

    if (data.session) {
      await saveSession(data.session);
      await fetchUser(data.user!.id);
    }
  }

  async function logout() {
    if (isDemoMode || !supabase) {
      // In demo mode, logout clears the saved user
      await clearDemoUser();
      setUser(null);
      setSession(null);
      return;
    }

    await supabase.auth.signOut();
    await clearSession();
  }

  async function refreshSession() {
    if (isDemoMode || !supabase) {
      // No-op in demo mode
      return;
    }

    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      await clearSession();
      throw error;
    }

    if (data.session) {
      await saveSession(data.session);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        isDemoMode,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
