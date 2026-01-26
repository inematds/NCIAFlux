/**
 * Chat Social Service
 *
 * Handles:
 * - 1:1 Accountability Partnerships
 * - Group Communities
 * - Real-time messaging via Supabase
 */

import { supabase, isDemoMode, subscribeToDirectMessages, subscribeToCommunityMessages } from './supabase';
import { getUserStorageKey } from './profile-manager';

// ============================================
// TYPES
// ============================================

export interface Partnership {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  status: 'pending' | 'active' | 'blocked' | 'ended';
  initiatedBy: string;
  shareAchievements: boolean;
  shareStreaks: boolean;
  createdAt: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface DirectMessage {
  id: string;
  partnershipId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'achievement_share' | 'celebration' | 'encouragement';
  metadata?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  rules?: string;
  ownerId: string;
  isPublic: boolean;
  maxMembers: number;
  memberCount: number;
  inviteCode?: string;
  createdAt: string;
  myRole?: 'admin' | 'moderator' | 'member';
  lastMessageAt?: string;
  unreadCount: number;
}

export interface CommunityMessage {
  id: string;
  communityId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: 'text' | 'announcement' | 'celebration' | 'system';
  replyTo?: string;
  reactions: Record<string, string[]>; // emoji -> userIds
  metadata?: Record<string, unknown>;
  deletedAt?: string;
  createdAt: string;
}

export interface CommunityMember {
  communityId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'admin' | 'moderator' | 'member';
  nickname?: string;
  mutedUntil?: string;
  joinedAt: string;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEYS = {
  PARTNERSHIPS: 'chat_partnerships',
  DM_CACHE: 'chat_dm_cache',
  COMMUNITIES: 'chat_communities',
  COMMUNITY_MESSAGES: 'chat_community_messages',
};

const ENCOURAGEMENT_MESSAGES = [
  'Voce esta indo muito bem! 💪',
  'Continue assim! Cada passo conta! 🚀',
  'Estou aqui torcendo por voce! 🌟',
  'Voce consegue! Um dia de cada vez! ☀️',
  'Que orgulho de ver seu progresso! 🎉',
  'Lembre-se: descansar tambem e produtividade! 🧘',
  'Seus esforcos estao valendo a pena! ⭐',
  'Forca, parceiro(a)! Estamos juntos! 🤝',
];

// ============================================
// PARTNERSHIP FUNCTIONS
// ============================================

/**
 * Generate partnership invite code
 */
export async function generatePartnershipCode(userId: string): Promise<string> {
  const code = `PAR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  // Store pending partnership
  if (!isDemoMode && supabase) {
    await supabase.from('partnership_codes').insert({
      code,
      user_id: userId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });
  } else {
    // Demo mode - store locally
    const codes = getLocalData('partnership_codes') || [];
    codes.push({ code, userId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() });
    setLocalData('partnership_codes', codes);
  }

  return code;
}

/**
 * Accept partnership with code
 */
export async function acceptPartnershipCode(code: string, userId: string): Promise<{ success: boolean; error?: string; partnership?: Partnership }> {
  if (!isDemoMode && supabase) {
    // Verify code
    const { data: codeData, error: codeError } = await supabase
      .from('partnership_codes')
      .select('*')
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (codeError || !codeData) {
      return { success: false, error: 'Codigo invalido ou expirado' };
    }

    if (codeData.user_id === userId) {
      return { success: false, error: 'Voce nao pode ser parceiro de si mesmo' };
    }

    // Create partnership
    const { data: partnership, error } = await supabase
      .from('partnerships')
      .insert({
        user_a: codeData.user_id,
        user_b: userId,
        status: 'active',
        initiated_by: codeData.user_id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Delete used code
    await supabase.from('partnership_codes').delete().eq('code', code);

    return {
      success: true,
      partnership: {
        id: partnership.id,
        partnerId: codeData.user_id,
        partnerName: 'Parceiro', // Would fetch from users table
        status: 'active',
        initiatedBy: codeData.user_id,
        shareAchievements: true,
        shareStreaks: true,
        createdAt: partnership.created_at,
        unreadCount: 0,
      },
    };
  }

  // Demo mode
  const codes = getLocalData('partnership_codes') || [];
  const codeData = codes.find((c: { code: string }) => c.code === code);

  if (!codeData) {
    return { success: false, error: 'Codigo invalido ou expirado' };
  }

  const partnership: Partnership = {
    id: `partnership_${Date.now()}`,
    partnerId: codeData.userId,
    partnerName: 'Parceiro Demo',
    status: 'active',
    initiatedBy: codeData.userId,
    shareAchievements: true,
    shareStreaks: true,
    createdAt: new Date().toISOString(),
    unreadCount: 0,
  };

  const partnerships = getLocalData(STORAGE_KEYS.PARTNERSHIPS) || [];
  partnerships.push(partnership);
  setLocalData(STORAGE_KEYS.PARTNERSHIPS, partnerships);

  return { success: true, partnership };
}

/**
 * Get user's partnerships
 */
export async function getPartnerships(userId: string): Promise<Partnership[]> {
  if (!isDemoMode && supabase) {
    const { data, error } = await supabase
      .from('partnerships')
      .select(`
        *,
        user_a_profile:users!partnerships_user_a_fkey(id, name, avatar_url),
        user_b_profile:users!partnerships_user_b_fkey(id, name, avatar_url)
      `)
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .eq('status', 'active');

    if (error) {
      console.error('[Chat] Error fetching partnerships:', error);
      return [];
    }

    return data.map((p: Record<string, unknown>) => {
      const isUserA = p.user_a === userId;
      const partner = isUserA ? p.user_b_profile : p.user_a_profile;

      return {
        id: p.id as string,
        partnerId: isUserA ? p.user_b as string : p.user_a as string,
        partnerName: (partner as Record<string, string>)?.name || 'Parceiro',
        partnerAvatar: (partner as Record<string, string>)?.avatar_url,
        status: p.status as Partnership['status'],
        initiatedBy: p.initiated_by as string,
        shareAchievements: p.share_achievements as boolean,
        shareStreaks: p.share_streaks as boolean,
        createdAt: p.created_at as string,
        unreadCount: 0, // Would calculate from unread messages
      };
    });
  }

  return getLocalData(STORAGE_KEYS.PARTNERSHIPS) || [];
}

/**
 * Send direct message
 */
export async function sendDirectMessage(
  partnershipId: string,
  senderId: string,
  content: string,
  messageType: DirectMessage['messageType'] = 'text'
): Promise<DirectMessage | null> {
  const message: DirectMessage = {
    id: `dm_${Date.now()}`,
    partnershipId,
    senderId,
    content,
    messageType,
    createdAt: new Date().toISOString(),
  };

  if (!isDemoMode && supabase) {
    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        partnership_id: partnershipId,
        sender_id: senderId,
        content,
        message_type: messageType,
      })
      .select()
      .single();

    if (error) {
      console.error('[Chat] Error sending message:', error);
      return null;
    }

    return {
      id: data.id,
      partnershipId: data.partnership_id,
      senderId: data.sender_id,
      content: data.content,
      messageType: data.message_type,
      readAt: data.read_at,
      createdAt: data.created_at,
    };
  }

  // Demo mode - store locally
  const messages = getLocalData(STORAGE_KEYS.DM_CACHE) || {};
  if (!messages[partnershipId]) {
    messages[partnershipId] = [];
  }
  messages[partnershipId].push(message);
  setLocalData(STORAGE_KEYS.DM_CACHE, messages);

  return message;
}

/**
 * Get direct messages for partnership
 */
export async function getDirectMessages(partnershipId: string, limit: number = 50): Promise<DirectMessage[]> {
  if (!isDemoMode && supabase) {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Chat] Error fetching messages:', error);
      return [];
    }

    return data.map((m: Record<string, unknown>) => ({
      id: m.id as string,
      partnershipId: m.partnership_id as string,
      senderId: m.sender_id as string,
      content: m.content as string,
      messageType: m.message_type as DirectMessage['messageType'],
      readAt: m.read_at as string,
      createdAt: m.created_at as string,
    })).reverse();
  }

  const messages = getLocalData(STORAGE_KEYS.DM_CACHE) || {};
  return (messages[partnershipId] || []).slice(-limit);
}

/**
 * Send random encouragement message
 */
export async function sendEncouragement(partnershipId: string, senderId: string): Promise<DirectMessage | null> {
  const randomMessage = ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
  return sendDirectMessage(partnershipId, senderId, randomMessage, 'encouragement');
}

/**
 * Subscribe to partnership messages
 */
export function subscribeToPartnerMessages(
  partnershipId: string,
  onMessage: (message: DirectMessage) => void
): { unsubscribe: () => void } {
  return subscribeToDirectMessages(partnershipId, (data) => {
    const message = data as Record<string, unknown>;
    onMessage({
      id: message.id as string,
      partnershipId: message.partnership_id as string,
      senderId: message.sender_id as string,
      content: message.content as string,
      messageType: message.message_type as DirectMessage['messageType'],
      readAt: message.read_at as string,
      createdAt: message.created_at as string,
    });
  });
}

// ============================================
// COMMUNITY FUNCTIONS
// ============================================

/**
 * Create a community
 */
export async function createCommunity(
  ownerId: string,
  data: { name: string; description?: string; rules?: string; isPublic?: boolean; maxMembers?: number }
): Promise<Community | null> {
  const inviteCode = `COM-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

  if (!isDemoMode && supabase) {
    const { data: community, error } = await supabase
      .from('communities')
      .insert({
        name: data.name,
        description: data.description,
        rules: data.rules,
        owner_id: ownerId,
        is_public: data.isPublic ?? true,
        max_members: data.maxMembers ?? 50,
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (error) {
      console.error('[Chat] Error creating community:', error);
      return null;
    }

    // Add owner as admin member
    await supabase.from('community_members').insert({
      community_id: community.id,
      user_id: ownerId,
      role: 'admin',
    });

    return {
      id: community.id,
      name: community.name,
      description: community.description,
      rules: community.rules,
      ownerId: community.owner_id,
      isPublic: community.is_public,
      maxMembers: community.max_members,
      memberCount: 1,
      inviteCode: community.invite_code,
      createdAt: community.created_at,
      myRole: 'admin',
      unreadCount: 0,
    };
  }

  // Demo mode
  const community: Community = {
    id: `community_${Date.now()}`,
    name: data.name,
    description: data.description,
    rules: data.rules,
    ownerId,
    isPublic: data.isPublic ?? true,
    maxMembers: data.maxMembers ?? 50,
    memberCount: 1,
    inviteCode,
    createdAt: new Date().toISOString(),
    myRole: 'admin',
    unreadCount: 0,
  };

  const communities = getLocalData(STORAGE_KEYS.COMMUNITIES) || [];
  communities.push(community);
  setLocalData(STORAGE_KEYS.COMMUNITIES, communities);

  return community;
}

/**
 * Join community with invite code
 */
export async function joinCommunityWithCode(code: string, userId: string): Promise<{ success: boolean; error?: string; community?: Community }> {
  if (!isDemoMode && supabase) {
    const { data: community, error: findError } = await supabase
      .from('communities')
      .select('*')
      .eq('invite_code', code)
      .single();

    if (findError || !community) {
      return { success: false, error: 'Codigo invalido' };
    }

    if (community.member_count >= community.max_members) {
      return { success: false, error: 'Comunidade esta cheia' };
    }

    // Check if already member
    const { data: existing } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', community.id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return { success: false, error: 'Voce ja e membro desta comunidade' };
    }

    // Join
    const { error: joinError } = await supabase.from('community_members').insert({
      community_id: community.id,
      user_id: userId,
      role: 'member',
    });

    if (joinError) {
      return { success: false, error: joinError.message };
    }

    // Update member count
    await supabase
      .from('communities')
      .update({ member_count: community.member_count + 1 })
      .eq('id', community.id);

    return {
      success: true,
      community: {
        id: community.id,
        name: community.name,
        description: community.description,
        rules: community.rules,
        ownerId: community.owner_id,
        isPublic: community.is_public,
        maxMembers: community.max_members,
        memberCount: community.member_count + 1,
        createdAt: community.created_at,
        myRole: 'member',
        unreadCount: 0,
      },
    };
  }

  // Demo mode
  const communities = getLocalData(STORAGE_KEYS.COMMUNITIES) || [];
  const community = communities.find((c: Community) => c.inviteCode === code);

  if (!community) {
    return { success: false, error: 'Codigo invalido' };
  }

  community.memberCount++;
  community.myRole = 'member';
  setLocalData(STORAGE_KEYS.COMMUNITIES, communities);

  return { success: true, community };
}

/**
 * Get user's communities
 */
export async function getCommunities(userId: string): Promise<Community[]> {
  if (!isDemoMode && supabase) {
    const { data, error } = await supabase
      .from('community_members')
      .select(`
        role,
        community:communities(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('[Chat] Error fetching communities:', error);
      return [];
    }

    return data.map((cm: Record<string, unknown>) => {
      const c = cm.community as Record<string, unknown>;
      return {
        id: c.id as string,
        name: c.name as string,
        description: c.description as string,
        rules: c.rules as string,
        ownerId: c.owner_id as string,
        isPublic: c.is_public as boolean,
        maxMembers: c.max_members as number,
        memberCount: c.member_count as number,
        inviteCode: c.invite_code as string,
        createdAt: c.created_at as string,
        myRole: cm.role as Community['myRole'],
        unreadCount: 0,
      };
    });
  }

  return getLocalData(STORAGE_KEYS.COMMUNITIES) || [];
}

/**
 * Send community message
 */
export async function sendCommunityMessage(
  communityId: string,
  senderId: string,
  senderName: string,
  content: string,
  messageType: CommunityMessage['messageType'] = 'text',
  replyTo?: string
): Promise<CommunityMessage | null> {
  const message: CommunityMessage = {
    id: `cm_${Date.now()}`,
    communityId,
    senderId,
    senderName,
    content,
    messageType,
    replyTo,
    reactions: {},
    createdAt: new Date().toISOString(),
  };

  if (!isDemoMode && supabase) {
    const { data, error } = await supabase
      .from('community_messages')
      .insert({
        community_id: communityId,
        sender_id: senderId,
        content,
        message_type: messageType,
        reply_to: replyTo,
      })
      .select()
      .single();

    if (error) {
      console.error('[Chat] Error sending community message:', error);
      return null;
    }

    return {
      id: data.id,
      communityId: data.community_id,
      senderId: data.sender_id,
      senderName, // Would fetch from users
      content: data.content,
      messageType: data.message_type,
      replyTo: data.reply_to,
      reactions: data.reactions || {},
      createdAt: data.created_at,
    };
  }

  // Demo mode
  const messages = getLocalData(STORAGE_KEYS.COMMUNITY_MESSAGES) || {};
  if (!messages[communityId]) {
    messages[communityId] = [];
  }
  messages[communityId].push(message);
  setLocalData(STORAGE_KEYS.COMMUNITY_MESSAGES, messages);

  return message;
}

/**
 * Get community messages
 */
export async function getCommunityMessages(communityId: string, limit: number = 50): Promise<CommunityMessage[]> {
  if (!isDemoMode && supabase) {
    const { data, error } = await supabase
      .from('community_messages')
      .select(`
        *,
        sender:users(name, avatar_url)
      `)
      .eq('community_id', communityId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Chat] Error fetching community messages:', error);
      return [];
    }

    return data.map((m: Record<string, unknown>) => ({
      id: m.id as string,
      communityId: m.community_id as string,
      senderId: m.sender_id as string,
      senderName: (m.sender as Record<string, string>)?.name || 'Usuario',
      senderAvatar: (m.sender as Record<string, string>)?.avatar_url,
      content: m.content as string,
      messageType: m.message_type as CommunityMessage['messageType'],
      replyTo: m.reply_to as string,
      reactions: (m.reactions as Record<string, string[]>) || {},
      createdAt: m.created_at as string,
    })).reverse();
  }

  const messages = getLocalData(STORAGE_KEYS.COMMUNITY_MESSAGES) || {};
  return (messages[communityId] || []).slice(-limit);
}

/**
 * Add reaction to message
 */
export async function addReaction(messageId: string, emoji: string, userId: string): Promise<void> {
  if (!isDemoMode && supabase) {
    const { data: message } = await supabase
      .from('community_messages')
      .select('reactions')
      .eq('id', messageId)
      .single();

    const reactions = message?.reactions || {};
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);

      await supabase
        .from('community_messages')
        .update({ reactions })
        .eq('id', messageId);
    }
  }
}

/**
 * Subscribe to community messages
 */
export function subscribeToCommunity(
  communityId: string,
  onMessage: (message: CommunityMessage) => void
): { unsubscribe: () => void } {
  return subscribeToCommunityMessages(communityId, (data) => {
    const message = data as Record<string, unknown>;
    onMessage({
      id: message.id as string,
      communityId: message.community_id as string,
      senderId: message.sender_id as string,
      senderName: 'Usuario', // Would need to fetch
      content: message.content as string,
      messageType: message.message_type as CommunityMessage['messageType'],
      replyTo: message.reply_to as string,
      reactions: (message.reactions as Record<string, string[]>) || {},
      createdAt: message.created_at as string,
    });
  });
}

// ============================================
// STORAGE HELPERS
// ============================================

function getLocalData(key: string): unknown {
  if (typeof window === 'undefined') return null;
  const storageKey = getUserStorageKey(key);
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data) : null;
}

function setLocalData(key: string, data: unknown): void {
  if (typeof window === 'undefined') return;
  const storageKey = getUserStorageKey(key);
  localStorage.setItem(storageKey, JSON.stringify(data));
}
