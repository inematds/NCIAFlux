/**
 * Manager Dashboard Service
 *
 * Provides real-time calculated metrics for team managers.
 * Aggregates data from team members' tasks, check-ins, and focus sessions.
 */

import { globalTeamsStorage, StoredTeamMember, StoredTask } from './storage';

// ============================================================================
// Types for Manager Dashboard
// ============================================================================

export interface MemberStats {
  memberId: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'away' | 'offline';
  // Task metrics
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  // Productivity (calculated)
  productivity: number; // 0-100%
  // Activity
  lastActivity: string | null;
  lastCheckIn: {
    date: string | null;
    mood: number | null; // 1-5
    energy: number | null; // 1-5
  };
  // Focus
  focusSessionsToday: number;
  focusMinutesToday: number;
  focusSessionsWeek: number;
  focusMinutesWeek: number;
}

export interface TeamDashboardData {
  teamId: string;
  teamName: string;
  // Summary stats
  totalMembers: number;
  activeMembers: number; // Activity in last 7 days
  awayMembers: number; // No activity 7-14 days
  offlineMembers: number; // No activity 14+ days
  // Task summary
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  // Calculated metrics
  avgProductivity: number; // 0-100%
  avgMood: number; // 1-5
  avgEnergy: number; // 1-5
  // Engagement
  engagementRate: number; // % of members active
  // Per-member data
  members: MemberStats[];
  // Alerts
  alerts: DashboardAlert[];
  // Recent activity
  recentActivity: ActivityItem[];
}

export interface DashboardAlert {
  id: string;
  type: 'inactive_member' | 'overdue_task' | 'low_productivity' | 'low_mood' | 'no_checkin';
  severity: 'warning' | 'critical';
  title: string;
  description: string;
  memberId?: string;
  memberName?: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'task_completed' | 'checkin' | 'focus_session' | 'joined_team';
  memberId: string;
  memberName: string;
  description: string;
  timestamp: string;
}

// ============================================================================
// Storage Access Helpers
// ============================================================================

function getMemberTasks(memberEmail: string): StoredTask[] {
  if (typeof window === 'undefined') return [];

  // Try to get tasks from member's storage
  // Members store tasks with user-prefixed keys
  const allKeys = Object.keys(localStorage);
  const taskKeys = allKeys.filter(k => k.includes('_tasks') || k.includes('nciaflux_tasks'));

  for (const key of taskKeys) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const tasks = JSON.parse(data) as StoredTask[];
        // Check if any task belongs to this member
        const memberTasks = tasks.filter(t =>
          t.assignee?.toLowerCase() === memberEmail.toLowerCase()
        );
        if (memberTasks.length > 0) {
          return memberTasks;
        }
      }
    } catch {
      // Skip invalid JSON
    }
  }

  return [];
}

function getMemberCheckIns(memberEmail: string): Array<{date: string; mood: number; energy: number}> {
  if (typeof window === 'undefined') return [];

  // Try to find check-ins for this member
  const allKeys = Object.keys(localStorage);
  const checkinKeys = allKeys.filter(k => k.includes('checkin') || k.includes('check_in'));

  for (const key of checkinKeys) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const checkins = JSON.parse(data);
        if (Array.isArray(checkins) && checkins.length > 0) {
          // Check if these belong to the member
          const firstItem = checkins[0];
          if (firstItem.email?.toLowerCase() === memberEmail.toLowerCase() ||
              firstItem.userId?.toLowerCase() === memberEmail.toLowerCase()) {
            return checkins.map((c: Record<string, unknown>) => ({
              date: (c.date || c.createdAt || c.created_at) as string,
              mood: (c.mood || c.feeling || 3) as number,
              energy: (c.energy || c.energyLevel || 3) as number,
            }));
          }
        }
      }
    } catch {
      // Skip invalid JSON
    }
  }

  return [];
}

function getMemberFocusSessions(_memberEmail: string): Array<{date: string; duration: number}> {
  if (typeof window === 'undefined') return [];

  const allKeys = Object.keys(localStorage);
  const focusKeys = allKeys.filter(k => k.includes('focus') || k.includes('pomodoro'));

  for (const key of focusKeys) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const sessions = JSON.parse(data);
        if (Array.isArray(sessions)) {
          return sessions.map((s: Record<string, unknown>) => ({
            date: (s.date || s.startedAt || s.createdAt) as string,
            duration: (s.duration || s.minutes || 25) as number,
          }));
        }
      }
    } catch {
      // Skip invalid JSON
    }
  }

  return [];
}

// ============================================================================
// Metric Calculations
// ============================================================================

function calculateProductivity(member: StoredTeamMember, tasks: StoredTask[]): number {
  if (tasks.length === 0) return 0;

  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;

  // Base productivity from task completion
  let productivity = Math.round((completed / total) * 100);

  // Adjust for recent activity
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentCompleted = tasks.filter(t =>
    t.status === 'completed' &&
    new Date(t.updatedAt) > weekAgo
  ).length;

  // Boost for recent activity
  if (recentCompleted > 0) {
    productivity = Math.min(100, productivity + (recentCompleted * 5));
  }

  return Math.max(0, Math.min(100, productivity));
}

function getMemberStatus(lastActivity: string | null): 'active' | 'away' | 'offline' {
  if (!lastActivity) return 'offline';

  const now = new Date();
  const lastDate = new Date(lastActivity);
  const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 7) return 'active';
  if (daysDiff <= 14) return 'away';
  return 'offline';
}

function isOverdue(task: StoredTask): boolean {
  if (task.status === 'completed' || task.status === 'skipped') return false;
  if (!task.dueDate) return false;

  const dueDate = new Date(task.dueDate);
  const now = new Date();
  return dueDate < now;
}

// ============================================================================
// Main Dashboard Function
// ============================================================================

export function getManagerDashboard(teamId: string): TeamDashboardData | null {
  const teams = globalTeamsStorage.getAll();
  const team = teams.find(t => t.id === teamId);

  if (!team) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Process each member
  const memberStats: MemberStats[] = team.members.map(member => {
    const tasks = getMemberTasks(member.email);
    const checkIns = getMemberCheckIns(member.email);
    const focusSessions = getMemberFocusSessions(member.email);

    // Find last activity
    const taskDates = tasks.map(t => new Date(t.updatedAt).getTime());
    const checkinDates = checkIns.map(c => new Date(c.date).getTime());
    const focusDates = focusSessions.map(f => new Date(f.date).getTime());
    const allDates = [...taskDates, ...checkinDates, ...focusDates].filter(d => !isNaN(d));
    const lastActivityTime = allDates.length > 0 ? Math.max(...allDates) : null;
    const lastActivity = lastActivityTime ? new Date(lastActivityTime).toISOString() : null;

    // Get last check-in
    const sortedCheckIns = checkIns.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastCheckIn = sortedCheckIns[0];

    // Focus sessions today and this week
    const todayFocus = focusSessions.filter(f => new Date(f.date) >= todayStart);
    const weekFocus = focusSessions.filter(f => new Date(f.date) >= weekAgo);

    // Task counts
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const overdueTasks = tasks.filter(isOverdue).length;

    return {
      memberId: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      status: getMemberStatus(lastActivity),
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      productivity: calculateProductivity(member, tasks),
      lastActivity,
      lastCheckIn: {
        date: lastCheckIn?.date || null,
        mood: lastCheckIn?.mood || null,
        energy: lastCheckIn?.energy || null,
      },
      focusSessionsToday: todayFocus.length,
      focusMinutesToday: todayFocus.reduce((sum, f) => sum + f.duration, 0),
      focusSessionsWeek: weekFocus.length,
      focusMinutesWeek: weekFocus.reduce((sum, f) => sum + f.duration, 0),
    };
  });

  // Calculate team totals
  const totalMembers = memberStats.length;
  const activeMembers = memberStats.filter(m => m.status === 'active').length;
  const awayMembers = memberStats.filter(m => m.status === 'away').length;
  const offlineMembers = memberStats.filter(m => m.status === 'offline').length;

  const totalTasks = memberStats.reduce((sum, m) => sum + m.totalTasks, 0);
  const completedTasks = memberStats.reduce((sum, m) => sum + m.completedTasks, 0);
  const pendingTasks = memberStats.reduce((sum, m) => sum + m.pendingTasks, 0);
  const inProgressTasks = memberStats.reduce((sum, m) => sum + m.inProgressTasks, 0);
  const overdueTasks = memberStats.reduce((sum, m) => sum + m.overdueTasks, 0);

  // Calculate averages
  const productivities = memberStats.map(m => m.productivity).filter(p => p > 0);
  const avgProductivity = productivities.length > 0
    ? Math.round(productivities.reduce((sum, p) => sum + p, 0) / productivities.length)
    : 0;

  const moods = memberStats.map(m => m.lastCheckIn.mood).filter((m): m is number => m !== null);
  const avgMood = moods.length > 0
    ? Math.round((moods.reduce((sum, m) => sum + m, 0) / moods.length) * 10) / 10
    : 0;

  const energies = memberStats.map(m => m.lastCheckIn.energy).filter((e): e is number => e !== null);
  const avgEnergy = energies.length > 0
    ? Math.round((energies.reduce((sum, e) => sum + e, 0) / energies.length) * 10) / 10
    : 0;

  const engagementRate = totalMembers > 0
    ? Math.round((activeMembers / totalMembers) * 100)
    : 0;

  // Generate alerts
  const alerts: DashboardAlert[] = [];

  memberStats.forEach(member => {
    // Inactive member alert
    if (member.status === 'offline') {
      alerts.push({
        id: `alert_inactive_${member.memberId}`,
        type: 'inactive_member',
        severity: 'warning',
        title: 'Membro inativo',
        description: `${member.name} nao tem atividade ha mais de 14 dias`,
        memberId: member.memberId,
        memberName: member.name,
        createdAt: now.toISOString(),
      });
    }

    // Overdue tasks alert
    if (member.overdueTasks > 0) {
      alerts.push({
        id: `alert_overdue_${member.memberId}`,
        type: 'overdue_task',
        severity: member.overdueTasks > 3 ? 'critical' : 'warning',
        title: 'Tarefas atrasadas',
        description: `${member.name} tem ${member.overdueTasks} tarefa(s) atrasada(s)`,
        memberId: member.memberId,
        memberName: member.name,
        createdAt: now.toISOString(),
      });
    }

    // Low productivity alert
    if (member.totalTasks >= 5 && member.productivity < 30) {
      alerts.push({
        id: `alert_lowprod_${member.memberId}`,
        type: 'low_productivity',
        severity: 'warning',
        title: 'Produtividade baixa',
        description: `${member.name} esta com ${member.productivity}% de produtividade`,
        memberId: member.memberId,
        memberName: member.name,
        createdAt: now.toISOString(),
      });
    }

    // Low mood alert
    if (member.lastCheckIn.mood !== null && member.lastCheckIn.mood <= 2) {
      alerts.push({
        id: `alert_mood_${member.memberId}`,
        type: 'low_mood',
        severity: 'warning',
        title: 'Humor baixo',
        description: `${member.name} reportou humor baixo no ultimo check-in`,
        memberId: member.memberId,
        memberName: member.name,
        createdAt: now.toISOString(),
      });
    }
  });

  // Generate recent activity (mock for now since we don't have activity log)
  const recentActivity: ActivityItem[] = memberStats
    .filter(m => m.lastActivity)
    .sort((a, b) => new Date(b.lastActivity!).getTime() - new Date(a.lastActivity!).getTime())
    .slice(0, 10)
    .map(m => ({
      id: `activity_${m.memberId}`,
      type: m.completedTasks > 0 ? 'task_completed' as const : 'checkin' as const,
      memberId: m.memberId,
      memberName: m.name,
      description: m.completedTasks > 0
        ? `Completou ${m.completedTasks} tarefa(s)`
        : 'Fez check-in',
      timestamp: m.lastActivity!,
    }));

  return {
    teamId: team.id,
    teamName: team.name,
    totalMembers,
    activeMembers,
    awayMembers,
    offlineMembers,
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    overdueTasks,
    avgProductivity,
    avgMood,
    avgEnergy,
    engagementRate,
    members: memberStats,
    alerts,
    recentActivity,
  };
}

/**
 * Get dashboard data for all teams managed by a user
 */
export function getAllManagedTeamsDashboard(managerEmail: string): TeamDashboardData[] {
  const teams = globalTeamsStorage.getByManagerEmail(managerEmail);
  return teams
    .map(team => getManagerDashboard(team.id))
    .filter((d): d is TeamDashboardData => d !== null);
}

/**
 * Get aggregated stats across all managed teams
 */
export function getAggregatedManagerStats(managerEmail: string): {
  totalTeams: number;
  totalMembers: number;
  activeMembers: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  avgProductivity: number;
  avgEngagement: number;
  criticalAlerts: number;
  warningAlerts: number;
} {
  const dashboards = getAllManagedTeamsDashboard(managerEmail);

  if (dashboards.length === 0) {
    return {
      totalTeams: 0,
      totalMembers: 0,
      activeMembers: 0,
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      avgProductivity: 0,
      avgEngagement: 0,
      criticalAlerts: 0,
      warningAlerts: 0,
    };
  }

  const totalTeams = dashboards.length;
  const totalMembers = dashboards.reduce((sum, d) => sum + d.totalMembers, 0);
  const activeMembers = dashboards.reduce((sum, d) => sum + d.activeMembers, 0);
  const totalTasks = dashboards.reduce((sum, d) => sum + d.totalTasks, 0);
  const completedTasks = dashboards.reduce((sum, d) => sum + d.completedTasks, 0);
  const overdueTasks = dashboards.reduce((sum, d) => sum + d.overdueTasks, 0);

  const productivities = dashboards.map(d => d.avgProductivity).filter(p => p > 0);
  const avgProductivity = productivities.length > 0
    ? Math.round(productivities.reduce((sum, p) => sum + p, 0) / productivities.length)
    : 0;

  const engagements = dashboards.map(d => d.engagementRate);
  const avgEngagement = engagements.length > 0
    ? Math.round(engagements.reduce((sum, e) => sum + e, 0) / engagements.length)
    : 0;

  const allAlerts = dashboards.flatMap(d => d.alerts);
  const criticalAlerts = allAlerts.filter(a => a.severity === 'critical').length;
  const warningAlerts = allAlerts.filter(a => a.severity === 'warning').length;

  return {
    totalTeams,
    totalMembers,
    activeMembers,
    totalTasks,
    completedTasks,
    overdueTasks,
    avgProductivity,
    avgEngagement,
    criticalAlerts,
    warningAlerts,
  };
}
