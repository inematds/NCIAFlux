/**
 * Chat Store - v1.3
 * Zustand store for AI chat state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIMessage, AIModelId, RateLimitStatus } from '@shared/types';

interface ChatState {
  // UI State
  isOpen: boolean;
  isLoading: boolean;
  isListening: boolean;
  error: string | null;

  // Messages
  messages: AIMessage[];
  sessionId: string | null;

  // Settings
  selectedModel: AIModelId;
  autoSpeak: boolean;

  // Rate Limiting
  rateLimitStatus: RateLimitStatus | null;
  messageCountToday: number;
  lastResetDate: string;
}

interface ChatActions {
  // UI Actions
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setLoading: (loading: boolean) => void;
  setListening: (listening: boolean) => void;
  setError: (error: string | null) => void;

  // Message Actions
  addMessage: (message: AIMessage) => void;
  clearMessages: () => void;
  startNewSession: () => void;

  // Settings Actions
  setModel: (model: AIModelId) => void;
  setAutoSpeak: (autoSpeak: boolean) => void;

  // Rate Limiting
  incrementMessageCount: () => void;
  checkRateLimit: (plan: 'free' | 'team' | 'premium' | 'enterprise') => boolean;
  getRemainingMessages: (plan: 'free' | 'team' | 'premium' | 'enterprise') => number;
  resetDailyCount: () => void;
}

type ChatStore = ChatState & ChatActions;

// Rate limits by plan (messages per day)
const RATE_LIMITS = {
  free: 50,
  team: 200,
  premium: 1000,
  enterprise: 10000,
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial State
      isOpen: false,
      isLoading: false,
      isListening: false,
      error: null,
      messages: [],
      sessionId: null,
      selectedModel: 'anthropic/claude-3.5-sonnet',
      autoSpeak: false,
      rateLimitStatus: null,
      messageCountToday: 0,
      lastResetDate: new Date().toISOString().split('T')[0],

      // UI Actions
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      setLoading: (loading) => set({ isLoading: loading }),
      setListening: (listening) => set({ isListening: listening }),
      setError: (error) => set({ error }),

      // Message Actions
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      clearMessages: () =>
        set({
          messages: [],
          sessionId: null,
        }),

      startNewSession: () =>
        set({
          sessionId: `session_${Date.now()}`,
          messages: [],
          error: null,
        }),

      // Settings Actions
      setModel: (model) => set({ selectedModel: model }),
      setAutoSpeak: (autoSpeak) => set({ autoSpeak }),

      // Rate Limiting
      incrementMessageCount: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();

        // Reset if new day
        if (state.lastResetDate !== today) {
          set({
            messageCountToday: 1,
            lastResetDate: today,
          });
        } else {
          set({
            messageCountToday: state.messageCountToday + 1,
          });
        }
      },

      checkRateLimit: (plan) => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();

        // Reset if new day
        if (state.lastResetDate !== today) {
          set({
            messageCountToday: 0,
            lastResetDate: today,
          });
          return true;
        }

        const limit = RATE_LIMITS[plan] || RATE_LIMITS.free;
        return state.messageCountToday < limit;
      },

      getRemainingMessages: (plan) => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();

        // Reset if new day
        if (state.lastResetDate !== today) {
          return RATE_LIMITS[plan] || RATE_LIMITS.free;
        }

        const limit = RATE_LIMITS[plan] || RATE_LIMITS.free;
        return Math.max(0, limit - state.messageCountToday);
      },

      resetDailyCount: () =>
        set({
          messageCountToday: 0,
          lastResetDate: new Date().toISOString().split('T')[0],
        }),
    }),
    {
      name: 'nciaflux-chat-store',
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
        sessionId: state.sessionId,
        selectedModel: state.selectedModel,
        autoSpeak: state.autoSpeak,
        messageCountToday: state.messageCountToday,
        lastResetDate: state.lastResetDate,
      }),
    }
  )
);
