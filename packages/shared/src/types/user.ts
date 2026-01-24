/**
 * User and Authentication Types
 */

export type PlanType = 'free' | 'basic' | 'advanced' | 'professional';

export type UserRole = 'user' | 'professional' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: PlanType;
  role: UserRole;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
