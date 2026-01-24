/**
 * Notification Service
 *
 * Handles local and push notifications for the app.
 * Currently uses a mock implementation that stores notifications locally.
 * In production, integrate with expo-notifications for native support.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Notification,
  NotificationType,
  NotificationPreferences,
  STORAGE_KEYS,
} from '@nciaflux/shared';

const NOTIFICATIONS_KEY = '@nciaflux/notifications';
const MAX_STORED_NOTIFICATIONS = 50;

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  user_id: '',
  enabled: true,
  check_in_reminders: true,
  task_reminders: true,
  focus_reminders: true,
  celebrations: true,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  max_daily_notifications: 8,
  preferred_tone: 'gentle',
};

// Notification content templates
const NOTIFICATION_TEMPLATES: Record<NotificationType, { titles: string[]; bodies: string[] }> = {
  check_in: {
    titles: ['Como você está?', 'Hora do check-in', 'Pausa para você'],
    bodies: [
      'Que tal fazer um check-in rápido?',
      'Reserve um momento para você',
      'Como está sua energia agora?',
    ],
  },
  task_reminder: {
    titles: ['Lembrete de tarefa', 'Não esqueça!', 'Tarefa pendente'],
    bodies: [
      'Você tem uma tarefa agendada',
      'Hora de focar na sua próxima tarefa',
      'Uma tarefa está esperando por você',
    ],
  },
  focus_start: {
    titles: ['Hora de focar', 'Bloco de foco', 'Momento de concentração'],
    bodies: [
      'Seu bloco de foco está prestes a começar',
      'Prepare-se para um momento produtivo',
      'É hora de entrar no fluxo',
    ],
  },
  focus_end: {
    titles: ['Pausa merecida', 'Bloco concluído', 'Hora do descanso'],
    bodies: [
      'Ótimo trabalho! Hora de descansar',
      'Você completou seu bloco de foco',
      'Parabéns! Faça uma pausa agora',
    ],
  },
  celebration: {
    titles: ['Parabéns!', 'Conquista!', 'Você conseguiu!'],
    bodies: [
      'Você está arrasando hoje!',
      'Continue assim, você é incrível!',
      'Mais uma conquista para celebrar!',
    ],
  },
  gentle_nudge: {
    titles: ['Oi!', 'Tudo bem?', 'Uma palavrinha'],
    bodies: [
      'Só passando para ver como você está',
      'Lembre-se: pequenos passos contam',
      'Está tudo bem por aí?',
    ],
  },
  crisis_support: {
    titles: ['Estamos aqui', 'Apoio disponível', 'Você não está sozinho'],
    bodies: [
      'O modo crise está disponível se precisar',
      'Respire. Estamos aqui com você.',
      'Precisa de apoio? Estamos aqui.',
    ],
  },
};

class NotificationService {
  private preferences: NotificationPreferences = DEFAULT_PREFERENCES;
  private dailyCount: number = 0;
  private lastResetDate: string = '';

  async initialize(): Promise<void> {
    await this.loadPreferences();
    this.checkDailyReset();
  }

  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
      if (stored) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  async savePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...preferences };
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_PREFERENCES,
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  private checkDailyReset(): void {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.dailyCount = 0;
      this.lastResetDate = today;
    }
  }

  private isQuietHours(): boolean {
    if (!this.preferences.quiet_hours_start || !this.preferences.quiet_hours_end) {
      return false;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinutes;

    const [startHour, startMin] = this.preferences.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = this.preferences.quiet_hours_end.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    }

    return currentTime >= startTime && currentTime < endTime;
  }

  private canSendNotification(type: NotificationType): boolean {
    if (!this.preferences.enabled) return false;

    this.checkDailyReset();
    if (this.dailyCount >= this.preferences.max_daily_notifications) return false;

    // Check type-specific preferences
    switch (type) {
      case 'check_in':
        if (!this.preferences.check_in_reminders) return false;
        break;
      case 'task_reminder':
        if (!this.preferences.task_reminders) return false;
        break;
      case 'focus_start':
      case 'focus_end':
        if (!this.preferences.focus_reminders) return false;
        break;
      case 'celebration':
        if (!this.preferences.celebrations) return false;
        break;
    }

    // Crisis support always goes through (except quiet hours)
    if (type !== 'crisis_support' && this.isQuietHours()) {
      return false;
    }

    return true;
  }

  private getRandomContent(type: NotificationType): { title: string; body: string } {
    const templates = NOTIFICATION_TEMPLATES[type];
    const titleIndex = Math.floor(Math.random() * templates.titles.length);
    const bodyIndex = Math.floor(Math.random() * templates.bodies.length);

    return {
      title: templates.titles[titleIndex],
      body: templates.bodies[bodyIndex],
    };
  }

  async scheduleNotification(
    type: NotificationType,
    options?: {
      title?: string;
      body?: string;
      data?: Record<string, unknown>;
      scheduledFor?: Date;
    }
  ): Promise<string | null> {
    if (!this.canSendNotification(type)) {
      return null;
    }

    const content = options?.title && options?.body
      ? { title: options.title, body: options.body }
      : this.getRandomContent(type);

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: this.preferences.user_id,
      type,
      title: content.title,
      body: content.body,
      data: options?.data,
      read: false,
      scheduled_for: options?.scheduledFor,
      created_at: new Date(),
    };

    // Store notification
    await this.storeNotification(notification);
    this.dailyCount++;

    // In production, this would schedule with expo-notifications
    // For now, we just store it and return the ID
    console.log(`[Notification] Scheduled: ${notification.title}`);

    return notification.id;
  }

  async sendImmediateNotification(
    type: NotificationType,
    options?: {
      title?: string;
      body?: string;
      data?: Record<string, unknown>;
    }
  ): Promise<string | null> {
    const notification = await this.scheduleNotification(type, options);

    if (notification) {
      // Mark as sent immediately
      await this.markNotificationSent(notification);
    }

    return notification;
  }

  private async storeNotification(notification: Notification): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      let notifications: Notification[] = stored ? JSON.parse(stored) : [];

      // Add new notification
      notifications.unshift(notification);

      // Keep only the most recent notifications
      if (notifications.length > MAX_STORED_NOTIFICATIONS) {
        notifications = notifications.slice(0, MAX_STORED_NOTIFICATIONS);
      }

      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }

  async getNotifications(limit: number = 20): Promise<Notification[]> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const notifications: Notification[] = stored ? JSON.parse(stored) : [];
      return notifications.slice(0, limit);
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications(MAX_STORED_NOTIFICATIONS);
    return notifications.filter((n) => !n.read).length;
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (!stored) return;

      const notifications: Notification[] = JSON.parse(stored);
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );

      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (!stored) return;

      const notifications: Notification[] = JSON.parse(stored);
      const updated = notifications.map((n) => ({ ...n, read: true }));

      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  private async markNotificationSent(notificationId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (!stored) return;

      const notifications: Notification[] = JSON.parse(stored);
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, sent_at: new Date() } : n
      );

      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to mark notification as sent:', error);
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    // In production, this would cancel a scheduled expo-notification
    console.log(`[Notification] Cancelled: ${notificationId}`);
  }

  async cancelAllNotifications(): Promise<void> {
    // In production, this would cancel all scheduled expo-notifications
    console.log('[Notification] Cancelled all notifications');
  }

  // Helper methods for common notification scenarios
  async sendCheckInReminder(): Promise<string | null> {
    return this.sendImmediateNotification('check_in');
  }

  async sendTaskReminder(taskTitle: string): Promise<string | null> {
    return this.sendImmediateNotification('task_reminder', {
      title: 'Lembrete de tarefa',
      body: `Não esqueça: ${taskTitle}`,
      data: { taskTitle },
    });
  }

  async sendFocusStartReminder(): Promise<string | null> {
    return this.sendImmediateNotification('focus_start');
  }

  async sendFocusEndNotification(focusMinutes: number): Promise<string | null> {
    return this.sendImmediateNotification('focus_end', {
      title: 'Bloco de foco concluído!',
      body: `Parabéns! Você focou por ${focusMinutes} minutos.`,
      data: { focusMinutes },
    });
  }

  async sendCelebration(achievement: string): Promise<string | null> {
    return this.sendImmediateNotification('celebration', {
      body: achievement,
    });
  }

  async sendGentleNudge(): Promise<string | null> {
    return this.sendImmediateNotification('gentle_nudge');
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
