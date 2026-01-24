import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { User, AuthSession, STORAGE_KEYS } from '@nciaflux/shared';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
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
    checkSession();

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
  }, []);

  async function checkSession() {
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
    await supabase.auth.signOut();
    await clearSession();
  }

  async function refreshSession() {
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
