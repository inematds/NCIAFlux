/**
 * Chat and Check-in Types
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageType = 'text' | 'check_in' | 'suggestion' | 'celebration';

export interface ChatMessage {
  id: string;
  user_id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  metadata?: ChatMessageMetadata;
  created_at: Date;
}

export interface ChatMessageMetadata {
  energy_level?: number;
  mood?: string;
  check_in_id?: string;
  suggestion_accepted?: boolean;
}

export interface CheckIn {
  id: string;
  user_id: string;
  type: CheckInType;
  energy_level: number; // 1-5
  mood?: string;
  notes?: string;
  responses?: Record<string, unknown>;
  created_at: Date;
}

export type CheckInType = 'morning' | 'midday' | 'evening' | 'on_demand';

export interface CheckInPrompt {
  id: string;
  type: CheckInType;
  question: string;
  response_type: 'slider' | 'emoji' | 'text' | 'choice';
  options?: string[];
  order: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  scheduled_for?: Date;
  sent_at?: Date;
  created_at: Date;
}

export type NotificationType =
  | 'check_in'
  | 'task_reminder'
  | 'focus_start'
  | 'focus_end'
  | 'celebration'
  | 'gentle_nudge'
  | 'crisis_support';

export interface NotificationPreferences {
  user_id: string;
  enabled: boolean;
  check_in_reminders: boolean;
  task_reminders: boolean;
  focus_reminders: boolean;
  celebrations: boolean;
  quiet_hours_start?: string; // e.g., "22:00"
  quiet_hours_end?: string; // e.g., "08:00"
  max_daily_notifications: number;
  preferred_tone: 'gentle' | 'encouraging' | 'direct';
}
