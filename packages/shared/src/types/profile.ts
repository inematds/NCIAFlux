/**
 * Discovery Profile Types
 */

export type EnergyLevel = 'low' | 'medium' | 'high';

export type ExecutionStyle = 'sequential' | 'parallel' | 'burst';

export type DistractionTrigger =
  | 'notifications'
  | 'noise'
  | 'visual_clutter'
  | 'thoughts'
  | 'social_media'
  | 'hunger'
  | 'fatigue';

export type CopingStrength =
  | 'lists'
  | 'timers'
  | 'music'
  | 'movement'
  | 'caffeine'
  | 'body_doubling'
  | 'rewards'
  | 'deadlines';

export interface EnergyPattern {
  morning: EnergyLevel;
  afternoon: EnergyLevel;
  evening: EnergyLevel;
  night: EnergyLevel;
}

export interface CognitiveProfile {
  id: string;
  user_id: string | null;
  session_id: string | null; // For non-logged users
  summary: string;
  insight: string;
  suggestion: string;
  energy_pattern: EnergyPattern;
  execution_style: ExecutionStyle;
  distraction_triggers: DistractionTrigger[];
  coping_strengths: CopingStrength[];
  focus_duration_minutes: number;
  best_focus_time: string; // e.g., "morning", "14:00-16:00"
  needs_external_accountability: boolean;
  response_to_pressure: 'thrives' | 'freezes' | 'mixed';
  raw_answers: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface DiscoveryQuestion {
  id: string;
  order: number;
  category: string;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'slider' | 'text';
  options?: QuestionOption[];
  min_value?: number;
  max_value?: number;
  required: boolean;
}

export interface QuestionOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface DiscoveryAnswer {
  question_id: string;
  value: string | string[] | number;
}

export interface DiscoveryResult {
  profile: CognitiveProfile;
  share_url?: string;
  share_image_url?: string;
}
