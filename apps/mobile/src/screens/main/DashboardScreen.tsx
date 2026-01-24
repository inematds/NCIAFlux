import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  getGreeting,
  getTimeOfDay,
  Task,
  TaskStatus,
} from '@nciaflux/shared';
import { useAuth } from '../../hooks/useAuth';
import { MainStackParamList } from '../../navigation/MainNavigator';

type DashboardNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Tabs'>;

// Mock data - In production, this comes from API
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    user_id: '1',
    title: 'Revisar emails importantes',
    priority: 'high',
    status: 'pending',
    category: 'work',
    estimated_duration_minutes: 30,
    order: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2',
    user_id: '1',
    title: 'Preparar apresentação',
    priority: 'high',
    status: 'in_progress',
    category: 'work',
    estimated_duration_minutes: 60,
    order: 2,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '3',
    user_id: '1',
    title: 'Fazer exercício',
    priority: 'medium',
    status: 'pending',
    category: 'health',
    estimated_duration_minutes: 45,
    order: 3,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const ENERGY_LEVELS = [
  { value: 1, emoji: '😴', label: 'Exausto' },
  { value: 2, emoji: '😐', label: 'Baixa' },
  { value: 3, emoji: '🙂', label: 'Ok' },
  { value: 4, emoji: '😊', label: 'Boa' },
  { value: 5, emoji: '⚡', label: 'Ótima' },
];

export function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const timeOfDay = getTimeOfDay();
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;

  async function onRefresh() {
    setRefreshing(true);
    // Simulate API refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }

  function handleTaskToggle(taskId: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'completed' ? 'pending' : ('completed' as TaskStatus),
              completed_at: task.status === 'completed' ? undefined : new Date(),
            }
          : task
      )
    );
  }

  function handleCrisisMode() {
    navigation.navigate('CrisisMode');
  }

  function handleFocusBlock(taskId?: string) {
    navigation.navigate('FocusBlock', { taskId });
  }

  function handleCheckIn() {
    navigation.navigate('CheckIn', {});
  }

  function handleReports() {
    navigation.navigate('Reports');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.main}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          </View>
          <TouchableOpacity style={styles.crisisButton} onPress={handleCrisisMode}>
            <Text style={styles.crisisButtonText}>Dia difícil?</Text>
          </TouchableOpacity>
        </View>

        {/* Energy Check-in */}
        {!energyLevel && (
          <View style={styles.energyCard}>
            <Text style={styles.energyTitle}>Como está sua energia agora?</Text>
            <View style={styles.energyOptions}>
              {ENERGY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={styles.energyOption}
                  onPress={() => setEnergyLevel(level.value)}
                >
                  <Text style={styles.energyEmoji}>{level.emoji}</Text>
                  <Text style={styles.energyLabel}>{level.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Energy Selected */}
        {energyLevel && (
          <View style={styles.energySelectedCard}>
            <View style={styles.energySelectedContent}>
              <Text style={styles.energySelectedEmoji}>
                {ENERGY_LEVELS.find((l) => l.value === energyLevel)?.emoji}
              </Text>
              <View>
                <Text style={styles.energySelectedLabel}>Sua energia agora</Text>
                <Text style={styles.energySelectedValue}>
                  {ENERGY_LEVELS.find((l) => l.value === energyLevel)?.label}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setEnergyLevel(null)}>
              <Text style={styles.energyChange}>Mudar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pendingTasks}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <TouchableOpacity
            style={[styles.statCard, styles.focusCard]}
            onPress={() => handleFocusBlock()}
          >
            <Text style={styles.focusIcon}>🎯</Text>
            <Text style={styles.focusLabel}>Iniciar Foco</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleCheckIn}>
            <Text style={styles.quickActionEmoji}>📝</Text>
            <Text style={styles.quickActionLabel}>Check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleReports}>
            <Text style={styles.quickActionEmoji}>📊</Text>
            <Text style={styles.quickActionLabel}>Relatórios</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tarefas de Hoje</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>Nenhuma tarefa para hoje</Text>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Adicionar tarefa</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.taskList}>
              {tasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                >
                  <TouchableOpacity
                    style={[
                      styles.taskCheckbox,
                      task.status === 'completed' && styles.taskCheckboxChecked,
                    ]}
                    onPress={() => handleTaskToggle(task.id)}
                  >
                    {task.status === 'completed' && (
                      <Text style={styles.taskCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.taskContent}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.status === 'completed' && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <View style={styles.taskMeta}>
                      {task.estimated_duration_minutes && (
                        <Text style={styles.taskDuration}>
                          ⏱️ {task.estimated_duration_minutes} min
                        </Text>
                      )}
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: getPriorityColor(task.priority) + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityText,
                            { color: getPriorityColor(task.priority) },
                          ]}
                        >
                          {getPriorityLabel(task.priority)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.taskFocusButton}
                    onPress={() => handleFocusBlock(task.id)}
                  >
                    <Text style={styles.taskFocusIcon}>▶️</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Suggested Technique */}
        {energyLevel && energyLevel <= 2 && (
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionIcon}>💡</Text>
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionTitle}>Sugestão para você</Text>
              <Text style={styles.suggestionText}>
                Com energia baixa, que tal começar com uma tarefa pequena de 10-15 min?
              </Text>
            </View>
          </View>
        )}

        {/* Encouragement */}
        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementText}>
            {getEncouragement(completedTasks, pendingTasks)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    high: COLORS.accent.error,
    medium: COLORS.accent.warning,
    low: COLORS.accent.success,
  };
  return colors[priority] || COLORS.neutral.textMuted;
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
  };
  return labels[priority] || priority;
}

function getEncouragement(completed: number, pending: number): string {
  if (completed === 0 && pending > 0) {
    return '🌱 Cada jornada começa com um passo. Escolha uma tarefa pequena para começar!';
  }
  if (completed > 0 && pending === 0) {
    return '🎉 Parabéns! Você concluiu todas as tarefas de hoje!';
  }
  if (completed > pending) {
    return '🔥 Você está arrasando! Mais da metade concluída!';
  }
  if (completed > 0) {
    return '👏 Ótimo progresso! Continue assim!';
  }
  return '✨ Pronto para um dia produtivo?';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
  },
  crisisButton: {
    backgroundColor: COLORS.crisis.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  crisisButtonText: {
    fontSize: 12,
    color: COLORS.neutral.textSecondary,
  },
  energyCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  energyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  energyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  energyOption: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  energyEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  energyLabel: {
    fontSize: 11,
    color: COLORS.neutral.textMuted,
  },
  energySelectedCard: {
    backgroundColor: COLORS.primary.main + '10',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  energySelectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  energySelectedEmoji: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  energySelectedLabel: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
  },
  energySelectedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.main,
  },
  energyChange: {
    fontSize: 14,
    color: COLORS.primary.main,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
    marginTop: SPACING.xs,
  },
  focusCard: {
    backgroundColor: COLORS.primary.main,
  },
  focusIcon: {
    fontSize: 24,
  },
  focusLabel: {
    fontSize: 12,
    color: COLORS.primary.contrast,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionEmoji: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral.textPrimary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  sectionAction: {
    fontSize: 14,
    color: COLORS.primary.main,
  },
  emptyState: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.neutral.textMuted,
    marginBottom: SPACING.md,
  },
  addButton: {
    backgroundColor: COLORS.primary.main + '10',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  addButtonText: {
    fontSize: 14,
    color: COLORS.primary.main,
    fontWeight: '500',
  },
  taskList: {
    gap: SPACING.sm,
  },
  taskCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckboxChecked: {
    backgroundColor: COLORS.accent.success,
    borderColor: COLORS.accent.success,
  },
  taskCheckmark: {
    color: COLORS.neutral.white,
    fontSize: 14,
    fontWeight: '700',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.xs,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.neutral.textMuted,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  taskDuration: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  taskFocusButton: {
    padding: SPACING.sm,
  },
  taskFocusIcon: {
    fontSize: 16,
  },
  suggestionCard: {
    backgroundColor: COLORS.secondary.light + '40',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  suggestionIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary.dark,
    marginBottom: SPACING.xs,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.neutral.textPrimary,
    lineHeight: 20,
  },
  encouragementCard: {
    backgroundColor: COLORS.primary.main + '08',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
