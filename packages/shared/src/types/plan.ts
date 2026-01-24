/**
 * Plan and Task Types
 */

export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export type TaskCategory = 'work' | 'personal' | 'health' | 'social' | 'learning' | 'other';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  estimated_duration_minutes?: number;
  scheduled_time?: string; // ISO time string
  completed_at?: Date;
  parent_task_id?: string; // For subtasks
  order: number;
  created_at: Date;
  updated_at: Date;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  trigger_type: 'time' | 'condition';
  trigger_time?: string; // e.g., "08:00"
  trigger_condition?: RoutineCondition;
  steps: RoutineStep[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RoutineCondition {
  type: 'energy' | 'time_of_day' | 'day_of_week' | 'weather';
  operator: 'equals' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface RoutineStep {
  order: number;
  description: string;
  duration_minutes?: number;
  optional: boolean;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  energy_level?: number; // 1-5
  mood?: string;
  tasks: Task[];
  focus_blocks: FocusBlock[];
  is_crisis_mode: boolean;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FocusBlock {
  id: string;
  user_id: string;
  daily_plan_id: string;
  start_time: string;
  duration_minutes: number;
  technique: FocusTechnique;
  task_id?: string;
  completed: boolean;
  actual_duration_minutes?: number;
  created_at: Date;
}

export type FocusTechnique = 'pomodoro' | 'deep_work' | 'timeboxing' | 'free_flow';

export interface Technique {
  id: string;
  name: string;
  description: string;
  category: 'focus' | 'organization' | 'motivation' | 'relaxation';
  difficulty: 'easy' | 'medium' | 'hard';
  duration_minutes?: number;
  instructions: string[];
  when_to_use: string[];
}
