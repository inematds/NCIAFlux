/**
 * useChatWithAI Hook - v1.3
 * Main hook for AI chat functionality
 */

import { useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { userStorage, tasksStorage, getStorageKey } from '@/lib/storage';
import type { AIMessage, AIInputType, AIChatContext } from '@shared/types';
import { getTimeOfDay, getDayOfWeek } from '@/services/ai/context-builder';

interface UseChatWithAIReturn {
  // State
  messages: AIMessage[];
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;

  // Actions
  sendMessage: (content: string, inputType?: AIInputType) => Promise<void>;
  clearChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

export function useChatWithAI(): UseChatWithAIReturn {
  const {
    messages,
    isLoading,
    isOpen,
    error,
    selectedModel,
    addMessage,
    clearMessages,
    openChat,
    closeChat,
    toggleChat,
    setLoading,
    setError,
    incrementMessageCount,
    checkRateLimit,
  } = useChatStore();

  /**
   * Build context from current user state
   */
  const buildContext = useCallback((): AIChatContext | null => {
    const user = userStorage.get();
    if (!user) return null;

    // Get tasks
    const tasks = tasksStorage.getAll();
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.dueDate === today);
    const pendingTasks = todayTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
    const completedTasks = todayTasks.filter((t) => t.status === 'completed');

    // Get brain dump items
    let brainDumpCount = 0;
    let brainDumpItems: Array<{ id: string; content: string; category?: string }> = [];
    try {
      const brainDumpKey = getStorageKey('nciaflux_brain_dump');
      const brainDumpData = localStorage.getItem(brainDumpKey);
      if (brainDumpData) {
        const brainDump = JSON.parse(brainDumpData);
        const inboxItems = brainDump.filter((item: { status: string }) => item.status === 'inbox');
        brainDumpCount = inboxItems.length;
        brainDumpItems = inboxItems.slice(0, 10).map((item: { id: string; content: string; category?: string }) => ({
          id: item.id,
          content: item.content,
          category: item.category,
        }));
      }
    } catch {
      // Ignore errors
    }

    // Get calendar events
    let eventsList: Array<{ id: string; title: string; date: string; startTime: string; endTime?: string; category?: string }> = [];
    try {
      const eventsKey = getStorageKey('nciaflux_calendar_events');
      const eventsData = localStorage.getItem(eventsKey);
      if (eventsData) {
        const events = JSON.parse(eventsData);
        // Get events from today onwards (next 7 days)
        const todayDate = new Date();
        const weekFromNow = new Date(todayDate);
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        eventsList = events
          .filter((e: { date: string }) => {
            const eventDate = new Date(e.date);
            return eventDate >= todayDate && eventDate <= weekFromNow;
          })
          .slice(0, 10)
          .map((e: { id: string; title: string; date: string; startTime: string; endTime?: string; category?: string }) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            startTime: e.startTime,
            endTime: e.endTime,
            category: e.category,
          }));
      }
    } catch {
      // Ignore errors
    }

    // Get last check-in
    let lastCheckin = null;
    let energyLevel = null;
    let mood = null;
    try {
      const checkinsKey = getStorageKey('nciaflux_checkins');
      const checkinsData = localStorage.getItem(checkinsKey);
      if (checkinsData) {
        const checkins = JSON.parse(checkinsData);
        if (checkins.length > 0) {
          lastCheckin = checkins[checkins.length - 1];
          energyLevel = lastCheckin.energyLevel;
          mood = lastCheckin.mood;
        }
      }
    } catch {
      // Ignore errors
    }

    // Get crisis mode state
    let isCrisisMode = false;
    try {
      const crisisKey = getStorageKey('nciaflux_crisis_mode');
      const crisisData = localStorage.getItem(crisisKey);
      if (crisisData) {
        const crisis = JSON.parse(crisisData);
        isCrisisMode = crisis.active === true;
      }
    } catch {
      // Ignore errors
    }

    // Get cognitive profile
    let cognitiveProfile = null;
    try {
      const profileKey = getStorageKey('nciaflux_cognitive_profile');
      const profileData = localStorage.getItem(profileKey);
      if (profileData) {
        cognitiveProfile = JSON.parse(profileData);
      }
    } catch {
      // Ignore errors
    }

    // Format tasks list for context
    const tasksList = todayTasks.slice(0, 15).map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
    }));

    return {
      user: {
        id: user.id,
        name: user.name,
        plan: (user.role === 'admin' ? 'premium' : 'free') as 'free' | 'team' | 'premium' | 'enterprise',
      },
      cognitiveProfile: cognitiveProfile
        ? {
            summary: cognitiveProfile.summary || '',
            chronotype: cognitiveProfile.chronotype,
            focusDurationMinutes: cognitiveProfile.focusDuration,
            bestFocusTime: cognitiveProfile.bestFocusTime,
          }
        : null,
      currentState: {
        energyLevel,
        mood,
        isCrisisMode,
        lastCheckIn: lastCheckin?.createdAt || null,
      },
      todayContext: {
        date: today,
        dayOfWeek: getDayOfWeek(),
        timeOfDay: getTimeOfDay(),
        tasksTotal: todayTasks.length,
        tasksPending: pendingTasks.length,
        tasksCompleted: completedTasks.length,
        top1Task: pendingTasks.find((t) => t.priority === 'high')?.title || pendingTasks[0]?.title || null,
        brainDumpInbox: brainDumpCount,
      },
      tasksList,
      eventsList,
      brainDumpList: brainDumpItems,
      recentMessages: messages.slice(-10),
    };
  }, [messages]);

  /**
   * Send a message to the AI
   */
  const sendMessage = useCallback(
    async (content: string, inputType: AIInputType = 'text') => {
      const user = userStorage.get();
      if (!user) {
        setError('Voce precisa estar logado para usar o chat.');
        return;
      }

      // Check rate limit
      const plan = (user.role === 'admin' ? 'premium' : 'free') as 'free' | 'team' | 'premium' | 'enterprise';
      if (!checkRateLimit(plan)) {
        setError('Voce atingiu o limite de mensagens de hoje. Tente novamente amanha.');
        return;
      }

      // Create user message
      const userMessage: AIMessage = {
        id: `msg_${Date.now()}_user`,
        sessionId: useChatStore.getState().sessionId || `session_${Date.now()}`,
        role: 'user',
        content,
        metadata: {
          inputType,
          responseType: 'text',
        },
        createdAt: new Date().toISOString(),
      };

      // Add user message immediately
      addMessage(userMessage);
      setLoading(true);
      setError(null);

      try {
        // Build context
        const context = buildContext();

        // Build history from recent messages
        const history = messages.slice(-10).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

        // Call API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            userId: user.id,
            userName: user.name,
            context,
            model: selectedModel,
            history,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao enviar mensagem');
        }

        const data = await response.json();

        // Create assistant message
        const assistantMessage: AIMessage = {
          id: `msg_${Date.now()}_assistant`,
          sessionId: userMessage.sessionId,
          role: 'assistant',
          content: data.message,
          toolCalls: data.toolResults?.map((r: { tool: string }) => ({
            id: `tc_${Date.now()}`,
            name: r.tool,
            arguments: {},
          })),
          toolResults: data.toolResults?.map((r: { tool: string; success: boolean; result: unknown; error?: string }) => ({
            toolCallId: `tc_${Date.now()}`,
            success: r.success,
            result: r.result,
            error: r.error,
          })),
          metadata: {
            inputType: 'text',
            responseType: 'text',
            model: data.model,
            tokensUsed: data.usage?.totalTokens,
          },
          createdAt: new Date().toISOString(),
        };

        // Add assistant message
        addMessage(assistantMessage);

        // Handle tool results (execute client-side actions)
        if (data.toolResults && data.toolResults.length > 0) {
          console.log('[AI Chat] Tool results received:', data.toolResults.length);
          for (const result of data.toolResults) {
            console.log('[AI Chat] Processing tool:', result.tool, 'success:', result.success);
            if (result.success && result.result) {
              await handleToolResult(result.result as Record<string, unknown>, user.id);
            }
          }
        } else {
          console.log('[AI Chat] No tool results in response');
        }

        // Increment message count
        incrementMessageCount();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);

        // Add error message
        addMessage({
          id: `msg_${Date.now()}_error`,
          sessionId: userMessage.sessionId,
          role: 'assistant',
          content: `Desculpe, ocorreu um erro: ${errorMessage}. Tente novamente.`,
          metadata: {
            inputType: 'text',
            responseType: 'text',
          },
          createdAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    },
    [
      messages,
      selectedModel,
      addMessage,
      setLoading,
      setError,
      incrementMessageCount,
      checkRateLimit,
      buildContext,
    ]
  );

  /**
   * Dispatch refresh event to update UI components
   */
  const dispatchRefreshEvent = (type: 'tasks' | 'events' | 'all') => {
    window.dispatchEvent(new CustomEvent('nciaflux-data-refresh', { detail: { type } }));
  };

  /**
   * Handle tool result (execute client-side actions)
   */
  const handleToolResult = async (result: Record<string, unknown>, userId: string) => {
    const action = result.action as string;
    console.log('[AI Chat] Executing action:', action, result);

    switch (action) {
      case 'create_task': {
        const task = result.task as Record<string, unknown>;
        if (task) {
          tasksStorage.add({
            title: task.title as string,
            description: (task.description as string) || '',
            priority: (task.priority as 'high' | 'medium' | 'low') || 'medium',
            status: 'pending',
            dueDate: (task.dueDate as string) || new Date().toISOString().split('T')[0],
            category: 'geral',
            assignee: userId,
          });
          dispatchRefreshEvent('tasks');
        }
        break;
      }

      case 'complete_task': {
        const taskId = result.taskId as string;
        const taskTitle = result.taskTitle as string;
        const tasks = tasksStorage.getAll();

        if (taskId) {
          tasksStorage.update(taskId, { status: 'completed' });
        } else if (taskTitle) {
          const task = tasks.find(
            (t) => t.title.toLowerCase().includes(taskTitle.toLowerCase()) && t.status !== 'completed'
          );
          if (task) {
            tasksStorage.update(task.id, { status: 'completed' });
          }
        }
        dispatchRefreshEvent('tasks');
        break;
      }

      case 'add_to_brain_dump': {
        const items = result.items as Array<Record<string, unknown>>;
        if (items) {
          const key = getStorageKey('nciaflux_brain_dump');
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify([...existing, ...items]));
          dispatchRefreshEvent('all');
        }
        break;
      }

      case 'activate_crisis_mode': {
        const crisisState = result.crisisState as Record<string, unknown>;
        if (crisisState) {
          const key = getStorageKey('nciaflux_crisis_mode');
          localStorage.setItem(key, JSON.stringify(crisisState));
        }
        break;
      }

      case 'record_checkin': {
        const checkin = result.checkin as Record<string, unknown>;
        if (checkin) {
          const key = getStorageKey('nciaflux_checkins');
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify([...existing, checkin]));
        }
        break;
      }

      case 'create_event': {
        const event = result.event as Record<string, unknown>;
        if (event) {
          const key = getStorageKey('nciaflux_calendar_events');
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify([...existing, event]));
          dispatchRefreshEvent('events');
        }
        break;
      }

      case 'delete_task': {
        const taskId = result.taskId as string;
        const taskTitle = result.taskTitle as string;
        const tasks = tasksStorage.getAll();

        if (taskId) {
          tasksStorage.delete(taskId);
        } else if (taskTitle) {
          const task = tasks.find(
            (t) => t.title.toLowerCase().includes(taskTitle.toLowerCase())
          );
          if (task) {
            tasksStorage.delete(task.id);
          }
        }
        dispatchRefreshEvent('tasks');
        break;
      }

      case 'delete_event': {
        const eventId = result.eventId as string;
        const eventTitle = result.eventTitle as string;
        const date = result.date as string;
        const key = getStorageKey('nciaflux_calendar_events');
        const events = JSON.parse(localStorage.getItem(key) || '[]') as Array<Record<string, unknown>>;

        let filtered = events;
        if (eventId) {
          filtered = events.filter((e) => e.id !== eventId);
        } else if (eventTitle) {
          filtered = events.filter((e) => {
            const titleMatch = !(e.title as string).toLowerCase().includes(eventTitle.toLowerCase());
            if (date) {
              return titleMatch || e.date !== date;
            }
            return titleMatch;
          });
        }
        localStorage.setItem(key, JSON.stringify(filtered));
        dispatchRefreshEvent('events');
        break;
      }

      case 'delete_all_tasks': {
        const date = result.date as string;
        const tasks = tasksStorage.getAll();
        const filtered = tasks.filter((t) => t.dueDate !== date);
        tasksStorage.setAll(filtered);
        dispatchRefreshEvent('tasks');
        break;
      }

      case 'delete_all_events': {
        const date = result.date as string;
        const key = getStorageKey('nciaflux_calendar_events');
        const events = JSON.parse(localStorage.getItem(key) || '[]') as Array<Record<string, unknown>>;
        const filtered = events.filter((e) => e.date !== date);
        localStorage.setItem(key, JSON.stringify(filtered));
        dispatchRefreshEvent('events');
        break;
      }

      case 'move_task': {
        const taskId = result.taskId as string;
        const taskTitle = result.taskTitle as string;
        const newDate = result.newDate as string;
        const tasks = tasksStorage.getAll();

        if (taskId) {
          tasksStorage.update(taskId, { dueDate: newDate });
        } else if (taskTitle) {
          const task = tasks.find(
            (t) => t.title.toLowerCase().includes(taskTitle.toLowerCase())
          );
          if (task) {
            tasksStorage.update(task.id, { dueDate: newDate });
          }
        }
        dispatchRefreshEvent('tasks');
        break;
      }

      case 'move_event': {
        const eventId = result.eventId as string;
        const eventTitle = result.eventTitle as string;
        const newDate = result.newDate as string;
        const key = getStorageKey('nciaflux_calendar_events');
        const events = JSON.parse(localStorage.getItem(key) || '[]') as Array<Record<string, unknown>>;

        const updated = events.map((e) => {
          if (eventId && e.id === eventId) {
            return { ...e, date: newDate, updatedAt: new Date().toISOString() };
          }
          if (eventTitle && (e.title as string).toLowerCase().includes(eventTitle.toLowerCase())) {
            return { ...e, date: newDate, updatedAt: new Date().toISOString() };
          }
          return e;
        });
        localStorage.setItem(key, JSON.stringify(updated));
        dispatchRefreshEvent('events');
        break;
      }

      case 'create_note': {
        const note = result.note as Record<string, unknown>;
        if (note) {
          const key = getStorageKey('nciaflux_notes');
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify([...existing, note]));
          dispatchRefreshEvent('all');
        }
        break;
      }

      case 'create_project': {
        const project = result.project as Record<string, unknown>;
        if (project) {
          const key = getStorageKey('nciaflux_projects');
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify([...existing, project]));
          dispatchRefreshEvent('all');
        }
        break;
      }

      case 'deactivate_crisis_mode': {
        const key = getStorageKey('nciaflux_crisis_mode');
        const current = JSON.parse(localStorage.getItem(key) || '{}');
        localStorage.setItem(key, JSON.stringify({
          ...current,
          active: false,
          deactivatedAt: new Date().toISOString(),
          notes: result.notes,
        }));
        break;
      }

      // Actions that query data (handled in the response message)
      case 'search_tasks':
      case 'list_today_tasks':
      case 'get_stats':
      case 'suggest_next_task':
        // These are query-only actions, no client-side storage changes needed
        break;
    }
  };

  /**
   * Clear chat history
   */
  const clearChat = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  return {
    messages,
    isLoading,
    isOpen,
    error,
    sendMessage,
    clearChat,
    openChat,
    closeChat,
    toggleChat,
  };
}
