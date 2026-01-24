import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@nciaflux/shared';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Community'>;

interface Team {
  id: string;
  name: string;
  emoji: string;
  description: string;
  memberCount: number;
  category: TeamCategory;
  isJoined: boolean;
  isPrivate: boolean;
  color: string;
  recentActivity: string;
  weeklyGoal?: string;
  weeklyProgress?: number;
}

interface Post {
  id: string;
  teamId: string;
  author: {
    name: string;
    avatar?: string;
    level: number;
  };
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  type: 'text' | 'achievement' | 'milestone' | 'question';
}

type TeamCategory = 'focus' | 'productivity' | 'wellness' | 'lifestyle' | 'support';

const TEAM_CATEGORIES: { id: TeamCategory; label: string; emoji: string }[] = [
  { id: 'focus', label: 'Foco', emoji: '🎯' },
  { id: 'productivity', label: 'Produtividade', emoji: '📊' },
  { id: 'wellness', label: 'Bem-estar', emoji: '🧘' },
  { id: 'lifestyle', label: 'Estilo de Vida', emoji: '🌟' },
  { id: 'support', label: 'Apoio', emoji: '💪' },
];

const SAMPLE_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Madrugadores',
    emoji: '🌅',
    description: 'Para quem quer criar o hábito de acordar cedo e começar o dia com energia',
    memberCount: 234,
    category: 'lifestyle',
    isJoined: true,
    isPrivate: false,
    color: '#FF9500',
    recentActivity: 'Maria completou 7 dias de rotina matinal',
    weeklyGoal: 'Acordar antes das 7h todos os dias',
    weeklyProgress: 0.7,
  },
  {
    id: '2',
    name: 'Foco Profundo',
    emoji: '🧠',
    description: 'Praticantes de Deep Work compartilhando técnicas e progresso',
    memberCount: 456,
    category: 'focus',
    isJoined: true,
    isPrivate: false,
    color: '#5856D6',
    recentActivity: 'João alcançou 4h de foco hoje',
    weeklyGoal: 'Completar 10h de foco profundo',
    weeklyProgress: 0.5,
  },
  {
    id: '3',
    name: 'Rotina Flexível',
    emoji: '🌊',
    description: 'Para quem prefere rotinas adaptáveis e sem rigidez',
    memberCount: 189,
    category: 'productivity',
    isJoined: false,
    isPrivate: false,
    color: '#34C759',
    recentActivity: 'Nova discussão sobre blocos de tempo',
  },
  {
    id: '4',
    name: 'Apoio Mútuo',
    emoji: '🤝',
    description: 'Espaço seguro para compartilhar desafios e conquistas com TDAH',
    memberCount: 567,
    category: 'support',
    isJoined: false,
    isPrivate: true,
    color: '#FF2D55',
    recentActivity: 'Sessão de body doubling às 19h',
  },
  {
    id: '5',
    name: 'Mindfulness TDAH',
    emoji: '🧘',
    description: 'Meditação e mindfulness adaptados para cérebros TDAH',
    memberCount: 321,
    category: 'wellness',
    isJoined: false,
    isPrivate: false,
    color: '#00C7BE',
    recentActivity: 'Nova meditação de 3 minutos disponível',
  },
  {
    id: '6',
    name: 'Tarefas Domésticas',
    emoji: '🏠',
    description: 'Dicas e motivação para manter a casa organizada',
    memberCount: 412,
    category: 'lifestyle',
    isJoined: false,
    isPrivate: false,
    color: '#AF52DE',
    recentActivity: 'Desafio: limpar um cômodo em 15min',
  },
];

const SAMPLE_POSTS: Post[] = [
  {
    id: '1',
    teamId: '1',
    author: { name: 'Maria S.', level: 12 },
    content: 'Acordei 5:30 hoje sem despertador! Depois de 2 semanas de prática, meu corpo já está se ajustando. A dica do \"luz natural imediata\" funcionou super bem.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    likes: 24,
    comments: 8,
    isLiked: false,
    type: 'milestone',
  },
  {
    id: '2',
    teamId: '2',
    author: { name: 'João P.', level: 8 },
    content: 'Consegui 4 horas de foco profundo hoje usando a técnica do \"ambiente preparado\". Deixei tudo pronto na noite anterior e isso fez toda diferença!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likes: 45,
    comments: 12,
    isLiked: true,
    type: 'achievement',
  },
  {
    id: '3',
    teamId: '1',
    author: { name: 'Ana L.', level: 5 },
    content: 'Alguém tem dicas para não ficar no celular logo após acordar? É minha maior dificuldade...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    likes: 12,
    comments: 23,
    isLiked: false,
    type: 'question',
  },
];

export function CommunityScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<'feed' | 'teams' | 'discover'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<TeamCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const myTeams = SAMPLE_TEAMS.filter((team) => team.isJoined);
  const discoverTeams = SAMPLE_TEAMS.filter((team) => !team.isJoined);

  const filteredTeams =
    selectedCategory === 'all'
      ? discoverTeams
      : discoverTeams.filter((team) => team.category === selectedCategory);

  const handleTeamPress = (team: Team) => {
    setSelectedTeam(team);
    setShowTeamModal(true);
  };

  const handleJoinTeam = (teamId: string) => {
    // In real app, this would call an API
    setShowTeamModal(false);
  };

  const renderPost = ({ item }: { item: Post }) => {
    const team = SAMPLE_TEAMS.find((t) => t.id === item.teamId);
    const timeAgo = getTimeAgo(item.timestamp);

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>{item.author.name.charAt(0)}</Text>
          </View>
          <View style={styles.postMeta}>
            <View style={styles.authorRow}>
              <Text style={styles.authorName}>{item.author.name}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv.{item.author.level}</Text>
              </View>
            </View>
            <View style={styles.postInfo}>
              <Text style={styles.teamTag}>
                {team?.emoji} {team?.name}
              </Text>
              <Text style={styles.postTime}>• {timeAgo}</Text>
            </View>
          </View>
          {item.type !== 'text' && (
            <View style={[styles.postTypeBadge, getPostTypeStyle(item.type)]}>
              <Text style={styles.postTypeText}>{getPostTypeLabel(item.type)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.postContent}>{item.content}</Text>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.postAction}>
            <Text style={[styles.actionIcon, item.isLiked && styles.likedIcon]}>
              {item.isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.actionCount}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionCount}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Text style={styles.actionIcon}>🔖</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTeamCard = (team: Team, isCompact = false) => (
    <TouchableOpacity
      key={team.id}
      style={[styles.teamCard, isCompact && styles.teamCardCompact]}
      onPress={() => handleTeamPress(team)}
    >
      <View style={[styles.teamEmoji, { backgroundColor: team.color + '20' }]}>
        <Text style={styles.teamEmojiText}>{team.emoji}</Text>
      </View>
      <View style={styles.teamInfo}>
        <View style={styles.teamNameRow}>
          <Text style={styles.teamName}>{team.name}</Text>
          {team.isPrivate && <Text style={styles.privateBadge}>🔒</Text>}
        </View>
        <Text style={styles.teamMembers}>{team.memberCount} membros</Text>
        {!isCompact && (
          <Text style={styles.teamDescription} numberOfLines={2}>
            {team.description}
          </Text>
        )}
        {team.isJoined && team.weeklyProgress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${team.weeklyProgress * 100}%`, backgroundColor: team.color },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(team.weeklyProgress * 100)}%</Text>
          </View>
        )}
      </View>
      {team.isJoined && (
        <View style={[styles.joinedBadge, { backgroundColor: team.color }]}>
          <Text style={styles.joinedText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comunidade</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['feed', 'teams', 'discover'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as typeof activeTab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'feed' ? 'Feed' : tab === 'teams' ? 'Meus Times' : 'Descobrir'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'feed' && (
        <FlatList
          data={SAMPLE_POSTS}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.feedHeader}>
              <Text style={styles.feedTitle}>Atividade dos seus times</Text>
            </View>
          }
        />
      )}

      {activeTab === 'teams' && (
        <ScrollView style={styles.teamsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.myTeamsHeader}>
            <Text style={styles.sectionTitle}>Seus Times ({myTeams.length})</Text>
          </View>
          {myTeams.map((team) => renderTeamCard(team))}
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => setActiveTab('discover')}
          >
            <Text style={styles.exploreButtonText}>🔍 Explorar mais times</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {activeTab === 'discover' && (
        <ScrollView style={styles.discoverContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar times..."
              placeholderTextColor={COLORS.neutral.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'all' && styles.categoryChipTextActive,
                ]}
              >
                Todos
              </Text>
            </TouchableOpacity>
            {TEAM_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat.id && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.emoji} {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.sectionTitle}>Times Populares</Text>
          {filteredTeams.map((team) => renderTeamCard(team))}
        </ScrollView>
      )}

      <Modal visible={showTeamModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTeam && (
              <>
                <View style={styles.modalHeader}>
                  <View
                    style={[styles.modalTeamEmoji, { backgroundColor: selectedTeam.color + '20' }]}
                  >
                    <Text style={styles.modalTeamEmojiText}>{selectedTeam.emoji}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setShowTeamModal(false)}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalTeamName}>{selectedTeam.name}</Text>
                <Text style={styles.modalTeamMembers}>
                  {selectedTeam.memberCount} membros • {getCategoryLabel(selectedTeam.category)}
                </Text>
                <Text style={styles.modalDescription}>{selectedTeam.description}</Text>
                {selectedTeam.weeklyGoal && (
                  <View style={styles.weeklyGoalCard}>
                    <Text style={styles.weeklyGoalLabel}>🎯 Meta da Semana</Text>
                    <Text style={styles.weeklyGoalText}>{selectedTeam.weeklyGoal}</Text>
                  </View>
                )}
                <View style={styles.teamStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {Math.floor(Math.random() * 50) + 10}/dia
                    </Text>
                    <Text style={styles.statLabel}>Posts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{selectedTeam.memberCount}</Text>
                    <Text style={styles.statLabel}>Membros</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      #{Math.floor(Math.random() * 20) + 1}
                    </Text>
                    <Text style={styles.statLabel}>Ranking</Text>
                  </View>
                </View>
                <Text style={styles.modalSectionTitle}>Atividade Recente</Text>
                <Text style={styles.recentActivityText}>{selectedTeam.recentActivity}</Text>
                <TouchableOpacity
                  style={[styles.joinButton, { backgroundColor: selectedTeam.color }]}
                  onPress={() => handleJoinTeam(selectedTeam.id)}
                >
                  <Text style={styles.joinButtonText}>
                    {selectedTeam.isPrivate ? '🔒 Solicitar Entrada' : '✨ Entrar no Time'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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

function getPostTypeStyle(type: Post['type']) {
  switch (type) {
    case 'achievement':
      return { backgroundColor: '#FFD60A20' };
    case 'milestone':
      return { backgroundColor: '#34C75920' };
    case 'question':
      return { backgroundColor: '#007AFF20' };
    default:
      return {};
  }
}

function getPostTypeLabel(type: Post['type']): string {
  switch (type) {
    case 'achievement':
      return '🏆 Conquista';
    case 'milestone':
      return '🎯 Marco';
    case 'question':
      return '❓ Pergunta';
    default:
      return '';
  }
}

function getCategoryLabel(category: TeamCategory): string {
  return TEAM_CATEGORIES.find((c) => c.id === category)?.label || category;
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
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral.text,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent.error,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
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
  feedContainer: {
    padding: 16,
  },
  feedHeader: {
    marginBottom: 16,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.text,
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
  },
  authorInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary.main,
  },
  postMeta: {
    flex: 1,
    marginLeft: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  postInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  teamTag: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
  },
  postTime: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
    marginLeft: 4,
  },
  postTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  postTypeText: {
    fontSize: 11,
    fontWeight: '500',
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
  likedIcon: {
    transform: [{ scale: 1.1 }],
  },
  actionCount: {
    fontSize: 13,
    color: COLORS.neutral.textMuted,
    marginLeft: 6,
  },
  teamsContainer: {
    flex: 1,
    padding: 16,
  },
  myTeamsHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.text,
    marginBottom: 12,
  },
  teamCard: {
    flexDirection: 'row',
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
  teamCardCompact: {
    padding: 12,
  },
  teamEmoji: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamEmojiText: {
    fontSize: 24,
  },
  teamInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teamNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.text,
  },
  privateBadge: {
    marginLeft: 6,
    fontSize: 12,
  },
  teamMembers: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
    marginTop: 2,
  },
  teamDescription: {
    fontSize: 13,
    color: COLORS.neutral.textMuted,
    marginTop: 6,
    lineHeight: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral.textMuted,
    marginLeft: 8,
    width: 36,
  },
  joinedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinedText: {
    color: COLORS.neutral.white,
    fontSize: 14,
    fontWeight: '700',
  },
  exploreButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  exploreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary.main,
  },
  discoverContainer: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.neutral.text,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary.main,
    borderColor: COLORS.primary.main,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.neutral.text,
  },
  categoryChipTextActive: {
    color: COLORS.neutral.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTeamEmoji: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTeamEmojiText: {
    fontSize: 32,
  },
  modalClose: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 20,
    color: COLORS.neutral.textMuted,
  },
  modalTeamName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.neutral.text,
    marginBottom: 4,
  },
  modalTeamMembers: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.neutral.text,
    marginBottom: 16,
  },
  weeklyGoalCard: {
    backgroundColor: COLORS.accent.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  weeklyGoalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent.main,
    marginBottom: 4,
  },
  weeklyGoalText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.neutral.text,
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
    marginTop: 2,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.text,
    marginBottom: 8,
  },
  recentActivityText: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    marginBottom: 24,
  },
  joinButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
});
