/**
 * Community Service
 *
 * Handles community features including:
 * - Team management
 * - Posts and comments
 * - Moderation tools
 * - Challenges and rewards
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export type TeamRole = 'admin' | 'moderator' | 'member';
export type PostType = 'text' | 'achievement' | 'milestone' | 'question' | 'challenge';
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate'
  | 'misinformation'
  | 'off_topic'
  | 'other';
export type ModerationAction = 'warn' | 'mute' | 'remove_post' | 'remove_user' | 'ban';

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: Date;
  contributions: number;
  isMuted: boolean;
  mutedUntil?: Date;
}

export interface Team {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  color: string;
  createdAt: Date;
  createdBy: string;
  memberCount: number;
  isPrivate: boolean;
  rules: string[];
  weeklyGoal?: string;
  isEnabled: boolean; // Controlled by system admin
}

export interface Post {
  id: string;
  teamId: string;
  authorId: string;
  content: string;
  type: PostType;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  commentCount: number;
  isDeleted: boolean;
  isPinned: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  isDeleted: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  reason: ReportReason;
  description?: string;
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  action?: ModerationAction;
}

export interface Challenge {
  id: string;
  teamId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  goal: {
    type: 'focus_hours' | 'tasks_completed' | 'streak_days' | 'checkins';
    target: number;
  };
  participants: string[];
  reward: {
    xp: number;
    badge?: string;
  };
}

// Storage keys
const STORAGE_KEYS = {
  JOINED_TEAMS: '@nciaflux/joined_teams',
  LIKED_POSTS: '@nciaflux/liked_posts',
  MUTED_TEAMS: '@nciaflux/muted_teams',
  BLOCKED_USERS: '@nciaflux/blocked_users',
};

// Community moderation rules
const MODERATION_RULES = {
  maxPostLength: 1000,
  maxCommentLength: 500,
  minTimeBetweenPosts: 60000, // 1 minute
  maxReportsBeforeAutoHide: 3,
  maxWarningsBeforeMute: 3,
  defaultMuteDuration: 24 * 60 * 60 * 1000, // 24 hours
  bannedWords: [], // Would be fetched from server
};

// Content moderation
export function moderateContent(content: string): {
  isValid: boolean;
  issues: string[];
  sanitized: string;
} {
  const issues: string[] = [];
  let sanitized = content.trim();

  // Check length
  if (sanitized.length > MODERATION_RULES.maxPostLength) {
    issues.push('Conteúdo excede o limite de caracteres');
    sanitized = sanitized.substring(0, MODERATION_RULES.maxPostLength);
  }

  // Check for banned words (simplified)
  for (const word of MODERATION_RULES.bannedWords) {
    if (sanitized.toLowerCase().includes(word.toLowerCase())) {
      issues.push('Conteúdo contém palavras inadequadas');
      // Replace with asterisks
      const regex = new RegExp(word, 'gi');
      sanitized = sanitized.replace(regex, '*'.repeat(word.length));
    }
  }

  // Check for spam patterns
  if (hasSpamPatterns(sanitized)) {
    issues.push('Conteúdo parece ser spam');
  }

  return {
    isValid: issues.length === 0,
    issues,
    sanitized,
  };
}

function hasSpamPatterns(content: string): boolean {
  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.7 && content.length > 20) {
    return true;
  }

  // Check for repeated characters
  if (/(.)\1{5,}/.test(content)) {
    return true;
  }

  // Check for excessive links
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlPattern) || [];
  if (urls.length > 3) {
    return true;
  }

  return false;
}

// Community Service Class
class CommunityService {
  private static instance: CommunityService;
  private lastPostTime: number = 0;

  static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  // Team Management
  async getJoinedTeams(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.JOINED_TEAMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async joinTeam(teamId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const teams = await this.getJoinedTeams();
      if (teams.includes(teamId)) {
        return { success: false, message: 'Você já faz parte deste time' };
      }
      teams.push(teamId);
      await AsyncStorage.setItem(STORAGE_KEYS.JOINED_TEAMS, JSON.stringify(teams));
      return { success: true };
    } catch {
      return { success: false, message: 'Erro ao entrar no time' };
    }
  }

  async leaveTeam(teamId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const teams = await this.getJoinedTeams();
      const filtered = teams.filter((id) => id !== teamId);
      await AsyncStorage.setItem(STORAGE_KEYS.JOINED_TEAMS, JSON.stringify(filtered));
      return { success: true };
    } catch {
      return { success: false, message: 'Erro ao sair do time' };
    }
  }

  // Post Management
  async canCreatePost(): Promise<{ allowed: boolean; waitTime?: number }> {
    const now = Date.now();
    const timeSinceLastPost = now - this.lastPostTime;

    if (timeSinceLastPost < MODERATION_RULES.minTimeBetweenPosts) {
      return {
        allowed: false,
        waitTime: MODERATION_RULES.minTimeBetweenPosts - timeSinceLastPost,
      };
    }

    return { allowed: true };
  }

  async createPost(
    teamId: string,
    content: string,
    type: PostType = 'text'
  ): Promise<{ success: boolean; post?: Post; error?: string }> {
    // Check rate limit
    const canPost = await this.canCreatePost();
    if (!canPost.allowed) {
      const seconds = Math.ceil((canPost.waitTime || 0) / 1000);
      return {
        success: false,
        error: `Aguarde ${seconds} segundos antes de postar novamente`,
      };
    }

    // Moderate content
    const moderation = moderateContent(content);
    if (!moderation.isValid) {
      return {
        success: false,
        error: moderation.issues.join('. '),
      };
    }

    // Create post (in real app, would send to API)
    const post: Post = {
      id: `post_${Date.now()}`,
      teamId,
      authorId: 'current_user', // Would come from auth
      content: moderation.sanitized,
      type,
      createdAt: new Date(),
      likes: 0,
      commentCount: 0,
      isDeleted: false,
      isPinned: false,
    };

    this.lastPostTime = Date.now();
    return { success: true, post };
  }

  // Likes
  async getLikedPosts(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LIKED_POSTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async toggleLike(postId: string): Promise<boolean> {
    try {
      const likes = await this.getLikedPosts();
      const isLiked = likes.includes(postId);

      if (isLiked) {
        const filtered = likes.filter((id) => id !== postId);
        await AsyncStorage.setItem(STORAGE_KEYS.LIKED_POSTS, JSON.stringify(filtered));
        return false;
      } else {
        likes.push(postId);
        await AsyncStorage.setItem(STORAGE_KEYS.LIKED_POSTS, JSON.stringify(likes));
        return true;
      }
    } catch {
      return false;
    }
  }

  // Reporting
  async reportContent(
    targetType: 'post' | 'comment' | 'user',
    targetId: string,
    reason: ReportReason,
    description?: string
  ): Promise<{ success: boolean; message?: string }> {
    // In real app, would send to API
    const report: Report = {
      id: `report_${Date.now()}`,
      reporterId: 'current_user',
      targetType,
      targetId,
      reason,
      description,
      createdAt: new Date(),
      status: 'pending',
    };

    // Store locally for offline support
    // In real app, would sync with server

    return {
      success: true,
      message: 'Denúncia enviada. Nossa equipe irá analisar.',
    };
  }

  // Blocking
  async getBlockedUsers(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async blockUser(userId: string): Promise<void> {
    const blocked = await this.getBlockedUsers();
    if (!blocked.includes(userId)) {
      blocked.push(userId);
      await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(blocked));
    }
  }

  async unblockUser(userId: string): Promise<void> {
    const blocked = await this.getBlockedUsers();
    const filtered = blocked.filter((id) => id !== userId);
    await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(filtered));
  }

  // Team Muting
  async getMutedTeams(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MUTED_TEAMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async toggleMuteTeam(teamId: string): Promise<boolean> {
    const muted = await this.getMutedTeams();
    const isMuted = muted.includes(teamId);

    if (isMuted) {
      const filtered = muted.filter((id) => id !== teamId);
      await AsyncStorage.setItem(STORAGE_KEYS.MUTED_TEAMS, JSON.stringify(filtered));
      return false;
    } else {
      muted.push(teamId);
      await AsyncStorage.setItem(STORAGE_KEYS.MUTED_TEAMS, JSON.stringify(muted));
      return true;
    }
  }

  // Challenges
  calculateChallengeProgress(
    challenge: Challenge,
    userStats: { focusHours?: number; tasksCompleted?: number; streakDays?: number; checkins?: number }
  ): number {
    const { type, target } = challenge.goal;

    let current = 0;
    switch (type) {
      case 'focus_hours':
        current = userStats.focusHours || 0;
        break;
      case 'tasks_completed':
        current = userStats.tasksCompleted || 0;
        break;
      case 'streak_days':
        current = userStats.streakDays || 0;
        break;
      case 'checkins':
        current = userStats.checkins || 0;
        break;
    }

    return Math.min(current / target, 1);
  }

  // Community Guidelines
  getCommunityGuidelines(): string[] {
    return [
      '🤝 Seja respeitoso e acolhedor com todos os membros',
      '💬 Mantenha as discussões relevantes ao tema do time',
      '🚫 Não compartilhe informações pessoais sensíveis',
      '📢 Evite spam e autopromoção excessiva',
      '🆘 Denuncie conteúdo inadequado aos moderadores',
      '💪 Celebre as conquistas dos outros membros',
      '🧠 Lembre-se: estamos todos aprendendo juntos',
      '❤️ Apoie quem está passando por dificuldades',
    ];
  }

  // Team Recommendations
  getTeamRecommendations(userProfile: {
    executionStyle?: string;
    preferredTechnique?: string;
    interests?: string[];
  }): string[] {
    const recommendations: string[] = [];

    // Based on execution style
    if (userProfile.executionStyle === 'structured') {
      recommendations.push('Rotinas Estruturadas', 'Planejamento Semanal');
    } else if (userProfile.executionStyle === 'flexible') {
      recommendations.push('Rotina Flexível', 'Flow Criativo');
    }

    // Based on technique
    if (userProfile.preferredTechnique === 'pomodoro') {
      recommendations.push('Pomodoro Masters', 'Foco Profundo');
    } else if (userProfile.preferredTechnique === 'deep_work') {
      recommendations.push('Deep Workers', 'Foco Profundo');
    }

    // General recommendations
    recommendations.push('Apoio Mútuo', 'Mindfulness TDAH');

    return [...new Set(recommendations)]; // Remove duplicates
  }
}

export const communityService = CommunityService.getInstance();
export default communityService;
