/**
 * Team Service - Epic 8: Times para Empresas/Grupos
 *
 * Implements:
 * - 8.1: Team creation and basic management
 * - 8.2: Role system (Coordinator, Admin, Member)
 * - 8.3: Invitations and onboarding
 * - 8.4: Manager dashboard
 * - 8.5: Team reports
 * - 8.6: Feature controls
 * - 8.7: Team challenges
 * - 8.8: Friendly rankings
 * - 8.9: Collaborative achievements
 */

import { supabase } from './supabase';
import { getItem, setItem, removeItem } from './storage';

// ============================================================================
// Types
// ============================================================================

export type TeamRole = 'coordinator' | 'admin' | 'member';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type ChallengeType = 'individual' | 'team' | 'collaborative';
export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  invite_code: string;
  invite_code_expires_at?: string;
  settings: TeamSettings;
  created_at: string;
  updated_at: string;
}

export interface TeamSettings {
  max_members: number;
  allow_member_invites: boolean;
  require_approval: boolean;
  privacy_level: 'transparent' | 'aggregated' | 'minimal';
  features_enabled: string[];
  custom_branding?: {
    primary_color?: string;
    logo_url?: string;
  };
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  display_name: string;
  joined_at: string;
  last_active_at?: string;
  is_visible: boolean;
  settings: MemberSettings;
}

export interface MemberSettings {
  share_tasks: boolean;
  share_mood: boolean;
  share_streaks: boolean;
  share_achievements: boolean;
  notifications_enabled: boolean;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  invited_by: string;
  email?: string;
  code: string;
  role: TeamRole;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
  accepted_at?: string;
}

export interface TeamChallenge {
  id: string;
  team_id: string;
  title: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;
  goal_type: 'tasks' | 'focus_time' | 'streaks' | 'check_ins' | 'custom';
  goal_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  rewards: ChallengeReward;
  created_by: string;
  created_at: string;
}

export interface ChallengeReward {
  xp_bonus: number;
  badge_id?: string;
  custom_reward?: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
}

export interface TeamAchievement {
  id: string;
  team_id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
  contributors: string[];
}

export interface TeamReport {
  id: string;
  team_id: string;
  period_start: string;
  period_end: string;
  report_type: 'weekly' | 'monthly' | 'custom';
  metrics: TeamMetrics;
  generated_at: string;
}

export interface TeamMetrics {
  active_members: number;
  total_tasks_completed: number;
  average_completion_rate: number;
  total_focus_time: number;
  average_mood: number;
  streak_average: number;
  challenges_completed: number;
  achievements_unlocked: number;
}

export interface TeamRanking {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  score: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
  badges: string[];
}

export interface FeatureConfig {
  feature_id: string;
  enabled: boolean;
  settings?: Record<string, unknown>;
  overrides?: Record<string, boolean>;
}

// ============================================================================
// Local Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  TEAMS: 'neurofluxo_teams',
  TEAM_MEMBERS: 'neurofluxo_team_members',
  INVITATIONS: 'neurofluxo_team_invitations',
  CHALLENGES: 'neurofluxo_team_challenges',
  ACHIEVEMENTS: 'neurofluxo_team_achievements',
  REPORTS: 'neurofluxo_team_reports',
};

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getUserId(): string {
  return getItem('neurofluxo_user_id') || 'demo-user';
}

// ============================================================================
// Team Management (8.1, 8.2)
// ============================================================================

export async function createTeam(
  name: string,
  description?: string,
  settings?: Partial<TeamSettings>
): Promise<Team> {
  const userId = getUserId();

  const defaultSettings: TeamSettings = {
    max_members: 50,
    allow_member_invites: false,
    require_approval: true,
    privacy_level: 'aggregated',
    features_enabled: ['tasks', 'focus', 'streaks', 'challenges'],
    ...settings,
  };

  const team: Team = {
    id: generateId(),
    name,
    description,
    created_by: userId,
    invite_code: generateInviteCode(),
    settings: defaultSettings,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: team.name,
          description: team.description,
          created_by: userId,
          invite_code: team.invite_code,
          settings: team.settings,
        })
        .select()
        .single();

      if (!error && data) {
        // Add creator as coordinator
        await supabase.from('team_members').insert({
          team_id: data.id,
          user_id: userId,
          role: 'coordinator',
          display_name: 'Coordenador',
          is_visible: true,
          settings: {
            share_tasks: true,
            share_mood: true,
            share_streaks: true,
            share_achievements: true,
            notifications_enabled: true,
          },
        });

        return data as Team;
      }
    } catch (e) {
      console.warn('Supabase unavailable, using local storage', e);
    }
  }

  // Fallback to local storage
  const teams = JSON.parse(getItem(STORAGE_KEYS.TEAMS) || '[]') as Team[];
  teams.push(team);
  setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));

  // Add creator as coordinator locally
  const members = JSON.parse(getItem(STORAGE_KEYS.TEAM_MEMBERS) || '[]') as TeamMember[];
  members.push({
    id: generateId(),
    team_id: team.id,
    user_id: userId,
    role: 'coordinator',
    display_name: 'Coordenador',
    joined_at: new Date().toISOString(),
    is_visible: true,
    settings: {
      share_tasks: true,
      share_mood: true,
      share_streaks: true,
      share_achievements: true,
      notifications_enabled: true,
    },
  });
  setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));

  return team;
}

export async function getTeam(teamId: string): Promise<Team | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (!error && data) {
        return data as Team;
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const teams = JSON.parse(getItem(STORAGE_KEYS.TEAMS) || '[]') as Team[];
  return teams.find(t => t.id === teamId) || null;
}

export async function getUserTeams(): Promise<Team[]> {
  const userId = getUserId();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('team_id, teams(*)')
        .eq('user_id', userId);

      if (!error && data) {
        return data.map(d => d.teams).filter(Boolean) as Team[];
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const members = JSON.parse(getItem(STORAGE_KEYS.TEAM_MEMBERS) || '[]') as TeamMember[];
  const userTeamIds = members.filter(m => m.user_id === userId).map(m => m.team_id);
  const teams = JSON.parse(getItem(STORAGE_KEYS.TEAMS) || '[]') as Team[];
  return teams.filter(t => userTeamIds.includes(t.id));
}

export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<Team | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', teamId)
        .select()
        .single();

      if (!error && data) {
        return data as Team;
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const teams = JSON.parse(getItem(STORAGE_KEYS.TEAMS) || '[]') as Team[];
  const index = teams.findIndex(t => t.id === teamId);
  if (index >= 0) {
    teams[index] = { ...teams[index], ...updates, updated_at: new Date().toISOString() };
    setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return teams[index];
  }
  return null;
}

export async function deleteTeam(teamId: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase.from('teams').delete().eq('id', teamId);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const teams = JSON.parse(getItem(STORAGE_KEYS.TEAMS) || '[]') as Team[];
  const filtered = teams.filter(t => t.id !== teamId);
  if (filtered.length !== teams.length) {
    setItem(STORAGE_KEYS.TEAMS, JSON.stringify(filtered));
    return true;
  }
  return false;
}

// ============================================================================
// Role Management (8.2)
// ============================================================================

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true });

      if (!error && data) {
        return data as TeamMember[];
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const members = JSON.parse(getItem(STORAGE_KEYS.TEAM_MEMBERS) || '[]') as TeamMember[];
  return members.filter(m => m.team_id === teamId);
}

export async function updateMemberRole(
  teamId: string,
  memberId: string,
  newRole: TeamRole
): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId)
        .eq('team_id', teamId);

      if (!error) return true;
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const members = JSON.parse(getItem(STORAGE_KEYS.TEAM_MEMBERS) || '[]') as TeamMember[];
  const index = members.findIndex(m => m.id === memberId && m.team_id === teamId);
  if (index >= 0) {
    members[index].role = newRole;
    setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));
    return true;
  }
  return false;
}

export async function removeMember(teamId: string, memberId: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('team_id', teamId);

      if (!error) return true;
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const members = JSON.parse(getItem(STORAGE_KEYS.TEAM_MEMBERS) || '[]') as TeamMember[];
  const filtered = members.filter(m => !(m.id === memberId && m.team_id === teamId));
  if (filtered.length !== members.length) {
    setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(filtered));
    return true;
  }
  return false;
}

export async function updateMemberSettings(
  memberId: string,
  settings: Partial<MemberSettings>
): Promise<boolean> {
  if (supabase) {
    try {
      const { data: current } = await supabase
        .from('team_members')
        .select('settings')
        .eq('id', memberId)
        .single();

      if (current) {
        const { error } = await supabase
          .from('team_members')
          .update({ settings: { ...current.settings, ...settings } })
          .eq('id', memberId);

        if (!error) return true;
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const members = JSON.parse(getItem(STORAGE_KEYS.TEAM_MEMBERS) || '[]') as TeamMember[];
  const index = members.findIndex(m => m.id === memberId);
  if (index >= 0) {
    members[index].settings = { ...members[index].settings, ...settings };
    setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));
    return true;
  }
  return false;
}

// ============================================================================
// Invitations & Onboarding (8.3)
// ============================================================================

export async function createInvitation(
  teamId: string,
  role: TeamRole = 'member',
  email?: string
): Promise<TeamInvitation> {
  const userId = getUserId();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

  const invitation: TeamInvitation = {
    id: generateId(),
    team_id: teamId,
    invited_by: userId,
    email,
    code: generateInviteCode(),
    role,
    status: 'pending',
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .insert(invitation)
        .select()
        .single();

      if (!error && data) {
        return data as TeamInvitation;
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const invitations = JSON.parse(getItem(STORAGE_KEYS.INVITATIONS) || '[]') as TeamInvitation[];
  invitations.push(invitation);
  setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
  return invitation;
}

export async function acceptInvitation(code: string, displayName: string): Promise<{ team: Team; member: TeamMember } | null> {
  const userId = getUserId();

  if (supabase) {
    try {
      // Find invitation
      const { data: invitation, error: invError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (invError || !invitation) {
        console.warn('Invitation not found or expired');
        return null;
      }

      // Get team
      const { data: team } = await supabase
        .from('teams')
        .select('*')
        .eq('id', invitation.team_id)
        .single();

      if (!team) return null;

      // Add member
      const { data: member, error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: invitation.team_id,
          user_id: userId,
          role: invitation.role,
          display_name: displayName,
          is_visible: true,
          settings: {
            share_tasks: true,
            share_mood: true,
            share_streaks: true,
            share_achievements: true,
            notifications_enabled: true,
          },
        })
        .select()
        .single();

      if (memberError) return null;

      // Update invitation status
      await supabase
        .from('team_invitations')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      return { team: team as Team, member: member as TeamMember };
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  // Local fallback
  const invitations = JSON.parse(getItem(STORAGE_KEYS.INVITATIONS) || '[]') as TeamInvitation[];
  const invitation = invitations.find(
    i => i.code.toUpperCase() === code.toUpperCase() &&
    i.status === 'pending' &&
    new Date(i.expires_at) > new Date()
  );

  if (!invitation) return null;

  const teams = JSON.parse(getItem(STORAGE_KEYS.TEAMS) || '[]') as Team[];
  const team = teams.find(t => t.id === invitation.team_id);
  if (!team) return null;

  const member: TeamMember = {
    id: generateId(),
    team_id: invitation.team_id,
    user_id: userId,
    role: invitation.role,
    display_name: displayName,
    joined_at: new Date().toISOString(),
    is_visible: true,
    settings: {
      share_tasks: true,
      share_mood: true,
      share_streaks: true,
      share_achievements: true,
      notifications_enabled: true,
    },
  };

  const members = JSON.parse(getItem(STORAGE_KEYS.TEAM_MEMBERS) || '[]') as TeamMember[];
  members.push(member);
  setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));

  // Update invitation
  const invIndex = invitations.findIndex(i => i.id === invitation.id);
  invitations[invIndex].status = 'accepted';
  invitations[invIndex].accepted_at = new Date().toISOString();
  setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));

  return { team, member };
}

export async function joinWithTeamCode(teamCode: string, displayName: string): Promise<{ team: Team; member: TeamMember } | null> {
  const userId = getUserId();

  if (supabase) {
    try {
      // Find team by invite code
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('invite_code', teamCode.toUpperCase())
        .single();

      if (teamError || !team) {
        console.warn('Team not found');
        return null;
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', userId)
        .single();

      if (existing) {
        console.warn('Already a member');
        return null;
      }

      // Add member
      const { data: member, error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: userId,
          role: 'member',
          display_name: displayName,
          is_visible: true,
          settings: {
            share_tasks: true,
            share_mood: true,
            share_streaks: true,
            share_achievements: true,
            notifications_enabled: true,
          },
        })
        .select()
        .single();

      if (memberError) return null;

      return { team: team as Team, member: member as TeamMember };
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  // Local fallback
  const teams = JSON.parse(getItem(STORAGE_KEYS.TEAMS) || '[]') as Team[];
  const team = teams.find(t => t.invite_code.toUpperCase() === teamCode.toUpperCase());
  if (!team) return null;

  const members = JSON.parse(getItem(STORAGE_KEYS.TEAM_MEMBERS) || '[]') as TeamMember[];
  const existing = members.find(m => m.team_id === team.id && m.user_id === userId);
  if (existing) return null;

  const member: TeamMember = {
    id: generateId(),
    team_id: team.id,
    user_id: userId,
    role: 'member',
    display_name: displayName,
    joined_at: new Date().toISOString(),
    is_visible: true,
    settings: {
      share_tasks: true,
      share_mood: true,
      share_streaks: true,
      share_achievements: true,
      notifications_enabled: true,
    },
  };

  members.push(member);
  setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));

  return { team, member };
}

export async function regenerateTeamCode(teamId: string): Promise<string | null> {
  const newCode = generateInviteCode();

  if (supabase) {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ invite_code: newCode, updated_at: new Date().toISOString() })
        .eq('id', teamId);

      if (!error) return newCode;
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const teams = JSON.parse(getItem(STORAGE_KEYS.TEAMS) || '[]') as Team[];
  const index = teams.findIndex(t => t.id === teamId);
  if (index >= 0) {
    teams[index].invite_code = newCode;
    teams[index].updated_at = new Date().toISOString();
    setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return newCode;
  }
  return null;
}

// ============================================================================
// Manager Dashboard & Reports (8.4, 8.5)
// ============================================================================

export async function getTeamDashboard(teamId: string): Promise<{
  team: Team;
  members: TeamMember[];
  metrics: TeamMetrics;
  activeChallenges: TeamChallenge[];
  recentAchievements: TeamAchievement[];
}> {
  const team = await getTeam(teamId);
  if (!team) throw new Error('Team not found');

  const members = await getTeamMembers(teamId);
  const challenges = await getTeamChallenges(teamId);
  const achievements = await getTeamAchievements(teamId);

  // Calculate metrics (aggregated for privacy)
  const metrics: TeamMetrics = {
    active_members: members.filter(m => {
      if (!m.last_active_at) return false;
      const lastActive = new Date(m.last_active_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastActive > weekAgo;
    }).length,
    total_tasks_completed: 0, // Would be aggregated from individual data
    average_completion_rate: 0,
    total_focus_time: 0,
    average_mood: 0,
    streak_average: 0,
    challenges_completed: challenges.filter(c => c.status === 'completed').length,
    achievements_unlocked: achievements.length,
  };

  // Try to get aggregated stats from Supabase
  if (supabase) {
    try {
      const { data } = await supabase
        .from('team_aggregated_stats')
        .select('*')
        .eq('team_id', teamId)
        .single();

      if (data) {
        metrics.total_tasks_completed = data.total_tasks_completed || 0;
        metrics.average_completion_rate = data.average_completion_rate || 0;
        metrics.total_focus_time = data.total_focus_time || 0;
        metrics.average_mood = data.average_mood || 0;
        metrics.streak_average = data.streak_average || 0;
      }
    } catch (e) {
      console.warn('Could not fetch aggregated stats', e);
    }
  }

  return {
    team,
    members,
    metrics,
    activeChallenges: challenges.filter(c => c.status === 'active'),
    recentAchievements: achievements.slice(0, 5),
  };
}

export async function generateTeamReport(
  teamId: string,
  periodStart: Date,
  periodEnd: Date,
  reportType: 'weekly' | 'monthly' | 'custom' = 'weekly'
): Promise<TeamReport> {
  const dashboard = await getTeamDashboard(teamId);

  const report: TeamReport = {
    id: generateId(),
    team_id: teamId,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
    report_type: reportType,
    metrics: dashboard.metrics,
    generated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('team_reports')
        .insert(report)
        .select()
        .single();

      if (!error && data) {
        return data as TeamReport;
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const reports = JSON.parse(getItem(STORAGE_KEYS.REPORTS) || '[]') as TeamReport[];
  reports.push(report);
  setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

  return report;
}

export async function getTeamReports(teamId: string): Promise<TeamReport[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('team_reports')
        .select('*')
        .eq('team_id', teamId)
        .order('generated_at', { ascending: false });

      if (!error && data) {
        return data as TeamReport[];
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const reports = JSON.parse(getItem(STORAGE_KEYS.REPORTS) || '[]') as TeamReport[];
  return reports.filter(r => r.team_id === teamId);
}

// ============================================================================
// Feature Controls (8.6)
// ============================================================================

export async function getFeatureConfig(teamId: string): Promise<FeatureConfig[]> {
  const team = await getTeam(teamId);
  if (!team) return [];

  const defaultFeatures: FeatureConfig[] = [
    { feature_id: 'tasks', enabled: true },
    { feature_id: 'focus_timer', enabled: true },
    { feature_id: 'streaks', enabled: true },
    { feature_id: 'mood_tracking', enabled: true },
    { feature_id: 'challenges', enabled: true },
    { feature_id: 'rankings', enabled: true },
    { feature_id: 'achievements', enabled: true },
    { feature_id: 'chat', enabled: false },
  ];

  return defaultFeatures.map(f => ({
    ...f,
    enabled: team.settings.features_enabled.includes(f.feature_id),
  }));
}

export async function updateFeatureConfig(
  teamId: string,
  featureId: string,
  enabled: boolean
): Promise<boolean> {
  const team = await getTeam(teamId);
  if (!team) return false;

  const features = team.settings.features_enabled;
  if (enabled && !features.includes(featureId)) {
    features.push(featureId);
  } else if (!enabled) {
    const index = features.indexOf(featureId);
    if (index >= 0) features.splice(index, 1);
  }

  await updateTeam(teamId, {
    settings: { ...team.settings, features_enabled: features },
  });

  return true;
}

// ============================================================================
// Team Challenges (8.7)
// ============================================================================

export async function createChallenge(
  teamId: string,
  challenge: Omit<TeamChallenge, 'id' | 'created_by' | 'created_at' | 'current_value'>
): Promise<TeamChallenge> {
  const userId = getUserId();

  const newChallenge: TeamChallenge = {
    ...challenge,
    id: generateId(),
    created_by: userId,
    created_at: new Date().toISOString(),
    current_value: 0,
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('team_challenges')
        .insert(newChallenge)
        .select()
        .single();

      if (!error && data) {
        return data as TeamChallenge;
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const challenges = JSON.parse(getItem(STORAGE_KEYS.CHALLENGES) || '[]') as TeamChallenge[];
  challenges.push(newChallenge);
  setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));

  return newChallenge;
}

export async function getTeamChallenges(teamId: string): Promise<TeamChallenge[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('team_challenges')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as TeamChallenge[];
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const challenges = JSON.parse(getItem(STORAGE_KEYS.CHALLENGES) || '[]') as TeamChallenge[];
  return challenges.filter(c => c.team_id === teamId);
}

export async function joinChallenge(challengeId: string): Promise<ChallengeParticipant | null> {
  const userId = getUserId();

  const participant: ChallengeParticipant = {
    id: generateId(),
    challenge_id: challengeId,
    user_id: userId,
    progress: 0,
    completed: false,
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert(participant)
        .select()
        .single();

      if (!error && data) {
        return data as ChallengeParticipant;
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  // Local storage simplified - just return the participant
  return participant;
}

export async function updateChallengeProgress(
  challengeId: string,
  progress: number
): Promise<boolean> {
  const userId = getUserId();

  if (supabase) {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .update({ progress, completed: false })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

      if (!error) {
        // Check if completed
        const { data: challenge } = await supabase
          .from('team_challenges')
          .select('goal_value')
          .eq('id', challengeId)
          .single();

        if (challenge && progress >= challenge.goal_value) {
          await supabase
            .from('challenge_participants')
            .update({ completed: true, completed_at: new Date().toISOString() })
            .eq('challenge_id', challengeId)
            .eq('user_id', userId);
        }

        return true;
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  return true;
}

// ============================================================================
// Friendly Rankings (8.8)
// ============================================================================

export async function getTeamRankings(
  teamId: string,
  category: 'tasks' | 'focus' | 'streaks' | 'overall' = 'overall'
): Promise<TeamRanking[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_team_rankings', {
        p_team_id: teamId,
        p_category: category,
      });

      if (!error && data) {
        return data as TeamRanking[];
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  // Local fallback - return members with mock scores
  const members = await getTeamMembers(teamId);
  return members
    .filter(m => m.is_visible)
    .map((m, index) => ({
      user_id: m.user_id,
      display_name: m.display_name,
      score: Math.floor(Math.random() * 1000),
      rank: index + 1,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      badges: [],
    }))
    .sort((a, b) => b.score - a.score)
    .map((r, index) => ({ ...r, rank: index + 1 }));
}

// ============================================================================
// Collaborative Achievements (8.9)
// ============================================================================

export async function getTeamAchievements(teamId: string): Promise<TeamAchievement[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('team_achievements')
        .select('*')
        .eq('team_id', teamId)
        .order('unlocked_at', { ascending: false });

      if (!error && data) {
        return data as TeamAchievement[];
      }
    } catch (e) {
      console.warn('Supabase unavailable', e);
    }
  }

  const achievements = JSON.parse(getItem(STORAGE_KEYS.ACHIEVEMENTS) || '[]') as TeamAchievement[];
  return achievements.filter(a => a.team_id === teamId);
}

export async function checkTeamAchievements(teamId: string): Promise<TeamAchievement[]> {
  const dashboard = await getTeamDashboard(teamId);
  const existingAchievements = await getTeamAchievements(teamId);
  const newAchievements: TeamAchievement[] = [];

  const achievementDefinitions = [
    {
      type: 'first_challenge',
      title: 'Primeiro Desafio',
      description: 'Completar o primeiro desafio em equipe',
      icon: '🏆',
      check: () => dashboard.metrics.challenges_completed >= 1,
    },
    {
      type: 'full_team',
      title: 'Time Completo',
      description: 'Ter 10 membros ativos na equipe',
      icon: '👥',
      check: () => dashboard.metrics.active_members >= 10,
    },
    {
      type: 'thousand_tasks',
      title: 'Mil Tarefas',
      description: 'Completar 1000 tarefas como equipe',
      icon: '✅',
      check: () => dashboard.metrics.total_tasks_completed >= 1000,
    },
    {
      type: 'focus_masters',
      title: 'Mestres do Foco',
      description: 'Acumular 100 horas de foco em equipe',
      icon: '🎯',
      check: () => dashboard.metrics.total_focus_time >= 360000, // 100 hours in seconds
    },
    {
      type: 'streak_squad',
      title: 'Esquadrao de Sequencias',
      description: 'Media de sequencia do time maior que 7 dias',
      icon: '🔥',
      check: () => dashboard.metrics.streak_average >= 7,
    },
  ];

  for (const def of achievementDefinitions) {
    const alreadyUnlocked = existingAchievements.some(a => a.achievement_type === def.type);
    if (!alreadyUnlocked && def.check()) {
      const achievement: TeamAchievement = {
        id: generateId(),
        team_id: teamId,
        achievement_type: def.type,
        title: def.title,
        description: def.description,
        icon: def.icon,
        unlocked_at: new Date().toISOString(),
        contributors: dashboard.members.map(m => m.user_id),
      };

      if (supabase) {
        try {
          await supabase.from('team_achievements').insert(achievement);
        } catch (e) {
          console.warn('Could not save achievement to Supabase', e);
        }
      }

      const achievements = JSON.parse(getItem(STORAGE_KEYS.ACHIEVEMENTS) || '[]') as TeamAchievement[];
      achievements.push(achievement);
      setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));

      newAchievements.push(achievement);
    }
  }

  return newAchievements;
}

// ============================================================================
// Permission Helpers
// ============================================================================

export async function canManageTeam(teamId: string): Promise<boolean> {
  const userId = getUserId();
  const members = await getTeamMembers(teamId);
  const member = members.find(m => m.user_id === userId);
  return member?.role === 'coordinator' || member?.role === 'admin';
}

export async function canInviteMembers(teamId: string): Promise<boolean> {
  const team = await getTeam(teamId);
  if (!team) return false;

  const userId = getUserId();
  const members = await getTeamMembers(teamId);
  const member = members.find(m => m.user_id === userId);

  if (member?.role === 'coordinator' || member?.role === 'admin') {
    return true;
  }

  return team.settings.allow_member_invites && member?.role === 'member';
}

export async function getUserRole(teamId: string): Promise<TeamRole | null> {
  const userId = getUserId();
  const members = await getTeamMembers(teamId);
  const member = members.find(m => m.user_id === userId);
  return member?.role || null;
}
