import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@nciaflux/shared';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'TeamDetail'>;

interface TeamMember {
  id: string;
  name: string;
  level: number;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  weeklyContribution: number;
  isOnline: boolean;
}

interface TeamPost {
  id: string;
  author: TeamMember;
  content: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  type: 'text' | 'achievement' | 'milestone' | 'question' | 'challenge';
}

interface Comment {
  id: string;
  author: { name: string; level: number };
  content: string;
  timestamp: Date;
}

interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  endDate: Date;
  progress: number;
  reward: string;
}

const SAMPLE_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Maria Santos',
    level: 15,
    role: 'admin',
    joinedAt: new Date('2024-01-15'),
    weeklyContribution: 45,
    isOnline: true,
  },
  {
    id: '2',
    name: 'João Pereira',
    level: 12,
    role: 'moderator',
    joinedAt: new Date('2024-02-20'),
    weeklyContribution: 32,
    isOnline: true,
  },
  {
    id: '3',
    name: 'Ana Lima',
    level: 8,
    role: 'member',
    joinedAt: new Date('2024-03-10'),
    weeklyContribution: 18,
    isOnline: false,
  },
  {
    id: '4',
    name: 'Carlos Silva',
    level: 6,
    role: 'member',
    joinedAt: new Date('2024-04-05'),
    weeklyContribution: 12,
    isOnline: true,
  },
  {
    id: '5',
    name: 'Beatriz Costa',
    level: 10,
    role: 'member',
    joinedAt: new Date('2024-02-28'),
    weeklyContribution: 28,
    isOnline: false,
  },
];

const SAMPLE_POSTS: TeamPost[] = [
  {
    id: '1',
    author: SAMPLE_MEMBERS[0],
    content:
      'Bom dia, time! Lembrete: nosso desafio semanal termina amanhã. Quem ainda não completou as tarefas, bora lá! 💪',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likes: 12,
    comments: [
      {
        id: 'c1',
        author: { name: 'João P.', level: 12 },
        content: 'Faltam só 2 tarefas pra mim!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
    ],
    isLiked: true,
    type: 'text',
  },
  {
    id: '2',
    author: SAMPLE_MEMBERS[1],
    content:
      'Consegui completar 3 horas de foco profundo hoje usando a técnica que a Maria compartilhou ontem. Obrigado pela dica!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    likes: 24,
    comments: [
      {
        id: 'c2',
        author: { name: 'Maria S.', level: 15 },
        content: 'Que legal! Fico feliz que funcionou 🎉',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      },
      {
        id: 'c3',
        author: { name: 'Ana L.', level: 8 },
        content: 'Qual técnica? Quero testar também!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ],
    isLiked: false,
    type: 'achievement',
  },
  {
    id: '3',
    author: SAMPLE_MEMBERS[2],
    content:
      'Alguém mais tem dificuldade em manter o foco depois do almoço? Estou tentando encontrar uma estratégia que funcione.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    likes: 18,
    comments: [],
    isLiked: false,
    type: 'question',
  },
];

const SAMPLE_CHALLENGE: TeamChallenge = {
  id: '1',
  title: 'Semana do Foco',
  description: 'Complete 10 sessões de foco de pelo menos 25 minutos',
  participants: 156,
  endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
  progress: 0.6,
  reward: '🏆 Badge Mestre do Foco',
};

export function TeamDetailScreen({ navigation, route }: Props) {
  const { teamId } = route.params;
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'challenges'>('posts');
  const [newPostText, setNewPostText] = useState('');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Mock team data - in real app would fetch by teamId
  const team = {
    id: teamId,
    name: 'Foco Profundo',
    emoji: '🧠',
    description: 'Praticantes de Deep Work compartilhando técnicas e progresso',
    memberCount: 456,
    color: '#5856D6',
    weeklyGoal: 'Completar 10h de foco profundo',
    weeklyProgress: 0.65,
  };

  const handlePost = () => {
    if (!newPostText.trim()) return;
    // In real app, would send to API
    setNewPostText('');
  };

  const getRoleLabel = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', color: '#FF9500' };
      case 'moderator':
        return { label: 'Mod', color: '#5856D6' };
      default:
        return null;
    }
  };

  const renderPost = (post: TeamPost) => {
    const isExpanded = expandedPostId === post.id;

    return (
      <View key={post.id} style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>{post.author.name.charAt(0)}</Text>
            {post.author.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.postMeta}>
            <View style={styles.authorRow}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv.{post.author.level}</Text>
              </View>
              {post.author.role !== 'member' && (
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: getRoleLabel(post.author.role)?.color },
                  ]}
                >
                  <Text style={styles.roleText}>{getRoleLabel(post.author.role)?.label}</Text>
                </View>
              )}
            </View>
            <Text style={styles.postTime}>{getTimeAgo(post.timestamp)}</Text>
          </View>
          {post.type !== 'text' && (
            <View style={[styles.postTypeBadge, getPostTypeStyle(post.type)]}>
              <Text style={styles.postTypeEmoji}>{getPostTypeEmoji(post.type)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.postContent}>{post.content}</Text>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.postAction}>
            <Text style={styles.actionIcon}>{post.isLiked ? '❤️' : '🤍'}</Text>
            <Text style={styles.actionCount}>{post.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.postAction}
            onPress={() => setExpandedPostId(isExpanded ? null : post.id)}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionCount}>{post.comments.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Text style={styles.actionIcon}>↗️</Text>
          </TouchableOpacity>
        </View>
        {isExpanded && post.comments.length > 0 && (
          <View style={styles.commentsSection}>
            {post.comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentInitial}>{comment.author.name.charAt(0)}</Text>
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.author.name}</Text>
                    <Text style={styles.commentTime}>{getTimeAgo(comment.timestamp)}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              </View>
            ))}
            <View style={styles.replyInput}>
              <TextInput
                style={styles.replyTextInput}
                placeholder="Escreva uma resposta..."
                placeholderTextColor={COLORS.neutral.textMuted}
              />
              <TouchableOpacity style={styles.replyButton}>
                <Text style={styles.replyButtonText}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderMember = (member: TeamMember) => {
    const roleInfo = getRoleLabel(member.role);

    return (
      <View key={member.id} style={styles.memberCard}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberInitial}>{member.name.charAt(0)}</Text>
          {member.isOnline && <View style={styles.memberOnline} />}
        </View>
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>{member.name}</Text>
            {roleInfo && (
              <View style={[styles.memberRoleBadge, { backgroundColor: roleInfo.color }]}>
                <Text style={styles.memberRoleText}>{roleInfo.label}</Text>
              </View>
            )}
          </View>
          <Text style={styles.memberLevel}>Nível {member.level}</Text>
        </View>
        <View style={styles.memberStats}>
          <Text style={styles.memberContribution}>
            {member.weeklyContribution} pts/sem
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{team.emoji}</Text>
          <Text style={styles.headerTitle}>{team.name}</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.teamBanner}>
        <View style={styles.bannerContent}>
          <View style={styles.weeklyProgress}>
            <Text style={styles.weeklyLabel}>Meta da Semana</Text>
            <Text style={styles.weeklyGoal}>{team.weeklyGoal}</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${team.weeklyProgress * 100}%`,
                      backgroundColor: team.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressPercent}>
                {Math.round(team.weeklyProgress * 100)}%
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.bannerStats}>
          <View style={styles.bannerStat}>
            <Text style={styles.bannerStatValue}>{team.memberCount}</Text>
            <Text style={styles.bannerStatLabel}>membros</Text>
          </View>
          <View style={styles.bannerStatDivider} />
          <View style={styles.bannerStat}>
            <Text style={styles.bannerStatValue}>
              {SAMPLE_MEMBERS.filter((m) => m.isOnline).length}
            </Text>
            <Text style={styles.bannerStatLabel}>online</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        {(['posts', 'members', 'challenges'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'posts' ? 'Posts' : tab === 'members' ? 'Membros' : 'Desafios'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {activeTab === 'posts' && (
          <>
            <ScrollView
              ref={scrollViewRef}
              style={styles.postsContainer}
              showsVerticalScrollIndicator={false}
            >
              {SAMPLE_POSTS.map(renderPost)}
              <View style={{ height: 80 }} />
            </ScrollView>
            <View style={styles.newPostContainer}>
              <TextInput
                style={styles.newPostInput}
                placeholder="Compartilhe algo com o time..."
                placeholderTextColor={COLORS.neutral.textMuted}
                value={newPostText}
                onChangeText={setNewPostText}
                multiline
              />
              <TouchableOpacity
                style={[styles.postButton, !newPostText.trim() && styles.postButtonDisabled]}
                onPress={handlePost}
                disabled={!newPostText.trim()}
              >
                <Text style={styles.postButtonText}>→</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeTab === 'members' && (
          <ScrollView style={styles.membersContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.membersHeader}>
              <Text style={styles.membersTitle}>
                {SAMPLE_MEMBERS.length} membros
              </Text>
              <View style={styles.onlineCount}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>
                  {SAMPLE_MEMBERS.filter((m) => m.isOnline).length} online
                </Text>
              </View>
            </View>
            {SAMPLE_MEMBERS.sort((a, b) => b.weeklyContribution - a.weeklyContribution).map(
              renderMember
            )}
          </ScrollView>
        )}

        {activeTab === 'challenges' && (
          <ScrollView style={styles.challengesContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeEmoji}>🏆</Text>
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>{SAMPLE_CHALLENGE.title}</Text>
                  <Text style={styles.challengeParticipants}>
                    {SAMPLE_CHALLENGE.participants} participantes
                  </Text>
                </View>
                <View style={styles.challengeTimeLeft}>
                  <Text style={styles.timeLeftValue}>2</Text>
                  <Text style={styles.timeLeftLabel}>dias</Text>
                </View>
              </View>
              <Text style={styles.challengeDescription}>{SAMPLE_CHALLENGE.description}</Text>
              <View style={styles.challengeProgress}>
                <View style={styles.challengeProgressBar}>
                  <View
                    style={[
                      styles.challengeProgressFill,
                      { width: `${SAMPLE_CHALLENGE.progress * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.challengeProgressText}>
                  {Math.round(SAMPLE_CHALLENGE.progress * 100)}% completo
                </Text>
              </View>
              <View style={styles.challengeReward}>
                <Text style={styles.rewardLabel}>Recompensa:</Text>
                <Text style={styles.rewardText}>{SAMPLE_CHALLENGE.reward}</Text>
              </View>
              <TouchableOpacity style={[styles.challengeButton, { backgroundColor: team.color }]}>
                <Text style={styles.challengeButtonText}>Ver meu progresso</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.pastChallengesTitle}>Desafios Anteriores</Text>
            <View style={styles.pastChallengeCard}>
              <Text style={styles.pastChallengeEmoji}>✅</Text>
              <View style={styles.pastChallengeInfo}>
                <Text style={styles.pastChallengeTitle}>Maratona Pomodoro</Text>
                <Text style={styles.pastChallengeResult}>
                  Você completou! +150 XP
                </Text>
              </View>
            </View>
            <View style={styles.pastChallengeCard}>
              <Text style={styles.pastChallengeEmoji}>🥈</Text>
              <View style={styles.pastChallengeInfo}>
                <Text style={styles.pastChallengeTitle}>Semana Sem Distrações</Text>
                <Text style={styles.pastChallengeResult}>
                  2º lugar no time! +100 XP
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function getPostTypeStyle(type: TeamPost['type']) {
  switch (type) {
    case 'achievement':
      return { backgroundColor: '#FFD60A' };
    case 'milestone':
      return { backgroundColor: '#34C759' };
    case 'question':
      return { backgroundColor: '#007AFF' };
    case 'challenge':
      return { backgroundColor: '#FF9500' };
    default:
      return {};
  }
}

function getPostTypeEmoji(type: TeamPost['type']): string {
  switch (type) {
    case 'achievement':
      return '🏆';
    case 'milestone':
      return '🎯';
    case 'question':
      return '❓';
    case 'challenge':
      return '⚔️';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.neutral.text,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral.text,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: COLORS.neutral.text,
  },
  teamBanner: {
    backgroundColor: COLORS.neutral.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  bannerContent: {
    marginBottom: 16,
  },
  weeklyProgress: {},
  weeklyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral.textMuted,
    marginBottom: 4,
  },
  weeklyGoal: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.neutral.text,
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral.text,
    marginLeft: 12,
    width: 40,
  },
  bannerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerStat: {
    flex: 1,
    alignItems: 'center',
  },
  bannerStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.neutral.text,
  },
  bannerStatLabel: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
  },
  bannerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.neutral.border,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary.main,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral.textMuted,
  },
  activeTabText: {
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  postsContainer: {
    flex: 1,
    padding: 16,
  },
  postCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  authorInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary.main,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
  postMeta: {
    flex: 1,
    marginLeft: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.neutral.text,
  },
  levelBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.accent.light,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.accent.main,
  },
  roleBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
  postTime: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
    marginTop: 2,
  },
  postTypeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postTypeEmoji: {
    fontSize: 14,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.neutral.text,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
    paddingTop: 12,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionCount: {
    fontSize: 13,
    color: COLORS.neutral.textMuted,
    marginLeft: 6,
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
  },
  commentCard: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral.textMuted,
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: COLORS.neutral.background,
    borderRadius: 12,
    padding: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral.text,
  },
  commentTime: {
    fontSize: 11,
    color: COLORS.neutral.textMuted,
    marginLeft: 8,
  },
  commentText: {
    fontSize: 13,
    color: COLORS.neutral.text,
    lineHeight: 18,
  },
  replyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  replyTextInput: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.neutral.text,
  },
  replyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  replyButtonText: {
    color: COLORS.neutral.white,
    fontSize: 18,
  },
  newPostContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: COLORS.neutral.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
  },
  newPostInput: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.neutral.text,
    maxHeight: 100,
  },
  postButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  postButtonDisabled: {
    backgroundColor: COLORS.neutral.border,
  },
  postButtonText: {
    color: COLORS.neutral.white,
    fontSize: 20,
    fontWeight: '600',
  },
  membersContainer: {
    flex: 1,
    padding: 16,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.text,
  },
  onlineCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 13,
    color: COLORS.neutral.textMuted,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  memberInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary.main,
  },
  memberOnline: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.neutral.text,
  },
  memberRoleBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  memberRoleText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
  memberLevel: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
    marginTop: 2,
  },
  memberStats: {
    alignItems: 'flex-end',
  },
  memberContribution: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent.main,
  },
  challengesContainer: {
    flex: 1,
    padding: 16,
  },
  challengeCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeEmoji: {
    fontSize: 32,
  },
  challengeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral.text,
  },
  challengeParticipants: {
    fontSize: 13,
    color: COLORS.neutral.textMuted,
  },
  challengeTimeLeft: {
    alignItems: 'center',
    backgroundColor: COLORS.accent.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeLeftValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent.warning,
  },
  timeLeftLabel: {
    fontSize: 10,
    color: COLORS.accent.warning,
  },
  challengeDescription: {
    fontSize: 14,
    color: COLORS.neutral.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  challengeProgress: {
    marginBottom: 16,
  },
  challengeProgressBar: {
    height: 8,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 4,
    marginBottom: 6,
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: COLORS.accent.success,
    borderRadius: 4,
  },
  challengeProgressText: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardLabel: {
    fontSize: 13,
    color: COLORS.neutral.textMuted,
    marginRight: 6,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent.main,
  },
  challengeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  challengeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
  pastChallengesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.text,
    marginBottom: 12,
  },
  pastChallengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  pastChallengeEmoji: {
    fontSize: 24,
  },
  pastChallengeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  pastChallengeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.text,
  },
  pastChallengeResult: {
    fontSize: 12,
    color: COLORS.accent.success,
    marginTop: 2,
  },
});
