import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TaskPriority,
  TaskCategory,
  TaskStatus,
} from '@nciaflux/shared';
import { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface TaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  estimatedMinutes?: number;
  scheduledTime?: string;
}

interface RoutineItem {
  id: string;
  name: string;
  triggerTime: string;
  steps: string[];
  isActive: boolean;
}

// Mock data - In production, this would come from Supabase
const MOCK_TASKS: TaskItem[] = [
  {
    id: '1',
    title: 'Revisar emails importantes',
    priority: 'high',
    category: 'work',
    status: 'pending',
    estimatedMinutes: 30,
    scheduledTime: '09:00',
  },
  {
    id: '2',
    title: 'Reunião de equipe',
    priority: 'high',
    category: 'work',
    status: 'pending',
    estimatedMinutes: 60,
    scheduledTime: '10:00',
  },
  {
    id: '3',
    title: 'Almoço',
    priority: 'medium',
    category: 'health',
    status: 'pending',
    estimatedMinutes: 45,
    scheduledTime: '12:00',
  },
  {
    id: '4',
    title: 'Finalizar relatório',
    priority: 'high',
    category: 'work',
    status: 'pending',
    estimatedMinutes: 90,
    scheduledTime: '14:00',
  },
  {
    id: '5',
    title: 'Exercício físico',
    priority: 'medium',
    category: 'health',
    status: 'pending',
    estimatedMinutes: 30,
    scheduledTime: '18:00',
  },
];

const MOCK_ROUTINES: RoutineItem[] = [
  {
    id: '1',
    name: 'Rotina Matinal',
    triggerTime: '07:00',
    steps: ['Acordar', 'Beber água', 'Alongar', 'Tomar café'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Preparar para dormir',
    triggerTime: '22:00',
    steps: ['Desligar telas', 'Preparar roupa', 'Meditar'],
    isActive: true,
  },
];

const PRIORITY_CONFIG: Record<TaskPriority, { color: string; label: string; emoji: string }> = {
  high: { color: COLORS.accent.error, label: 'Alta', emoji: '🔴' },
  medium: { color: COLORS.secondary.main, label: 'Média', emoji: '🟡' },
  low: { color: COLORS.accent.success, label: 'Baixa', emoji: '🟢' },
};

const CATEGORY_CONFIG: Record<TaskCategory, { emoji: string; label: string }> = {
  work: { emoji: '💼', label: 'Trabalho' },
  personal: { emoji: '👤', label: 'Pessoal' },
  health: { emoji: '💪', label: 'Saúde' },
  social: { emoji: '👥', label: 'Social' },
  learning: { emoji: '📚', label: 'Aprendizado' },
  other: { emoji: '📌', label: 'Outros' },
};

export function PlanScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [tasks, setTasks] = useState<TaskItem[]>(MOCK_TASKS);
  const [routines] = useState<RoutineItem[]>(MOCK_ROUTINES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('work');
  const [activeTab, setActiveTab] = useState<'tasks' | 'routines'>('tasks');

  function openTaskDetail(taskId: string) {
    navigation.navigate('TaskDetail', { taskId });
  }

  const today = new Date();
  const dateString = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  function toggleTaskStatus(taskId: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'completed' ? 'pending' : 'completed',
            }
          : task
      )
    );
  }

  function addTask() {
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      category: newTaskCategory,
      status: 'pending',
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskCategory('work');
    setShowAddModal(false);
  }

  function deleteTask(taskId: string) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  // Sort tasks: pending first, then by priority, then by scheduled time
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    if (a.scheduledTime && b.scheduledTime) {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    }

    return 0;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Meu Plano</Text>
          <Text style={styles.dateText}>{dateString}</Text>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progresso do Dia</Text>
            <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressSubtext}>
            {completedCount} de {totalCount} tarefas concluídas
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tasks' && styles.tabActive]}
            onPress={() => setActiveTab('tasks')}
          >
            <Text
              style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}
            >
              Tarefas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'routines' && styles.tabActive]}
            onPress={() => setActiveTab('routines')}
          >
            <Text
              style={[styles.tabText, activeTab === 'routines' && styles.tabTextActive]}
            >
              Rotinas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <View style={styles.tasksSection}>
            {sortedTasks.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  task.status === 'completed' && styles.taskCompleted,
                ]}
              >
                <TouchableOpacity
                  style={styles.taskCheckbox}
                  onPress={() => toggleTaskStatus(task.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      task.status === 'completed' && styles.checkboxChecked,
                    ]}
                  >
                    {task.status === 'completed' && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.taskContent}
                  onPress={() => openTaskDetail(task.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskHeader}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.status === 'completed' && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <TouchableOpacity onPress={() => deleteTask(task.id)}>
                      <Text style={styles.deleteButton}>×</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.taskMeta}>
                    <View style={styles.taskTags}>
                      <Text style={styles.taskTag}>
                        {CATEGORY_CONFIG[task.category].emoji}{' '}
                        {CATEGORY_CONFIG[task.category].label}
                      </Text>
                      <Text
                        style={[
                          styles.taskPriority,
                          { backgroundColor: PRIORITY_CONFIG[task.priority].color + '20' },
                        ]}
                      >
                        {PRIORITY_CONFIG[task.priority].emoji}{' '}
                        {PRIORITY_CONFIG[task.priority].label}
                      </Text>
                    </View>
                    {task.scheduledTime && (
                      <Text style={styles.taskTime}>⏰ {task.scheduledTime}</Text>
                    )}
                    {task.estimatedMinutes && (
                      <Text style={styles.taskDuration}>
                        ~{task.estimatedMinutes} min
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Task Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addButtonIcon}>+</Text>
              <Text style={styles.addButtonText}>Adicionar tarefa</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Routines Tab */}
        {activeTab === 'routines' && (
          <View style={styles.routinesSection}>
            {routines.map((routine) => (
              <View key={routine.id} style={styles.routineCard}>
                <View style={styles.routineHeader}>
                  <View>
                    <Text style={styles.routineName}>{routine.name}</Text>
                    <Text style={styles.routineTime}>⏰ {routine.triggerTime}</Text>
                  </View>
                  <View
                    style={[
                      styles.routineStatus,
                      routine.isActive && styles.routineStatusActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.routineStatusText,
                        routine.isActive && styles.routineStatusTextActive,
                      ]}
                    >
                      {routine.isActive ? 'Ativa' : 'Inativa'}
                    </Text>
                  </View>
                </View>

                <View style={styles.routineSteps}>
                  {routine.steps.map((step, index) => (
                    <View key={index} style={styles.routineStep}>
                      <Text style={styles.routineStepNumber}>{index + 1}</Text>
                      <Text style={styles.routineStepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <View style={styles.routineHint}>
              <Text style={styles.routineHintText}>
                💡 Rotinas ajudam a automatizar seu dia. Configure gatilhos por horário
                ou condição (ex: "quando acordar", "quando energia estiver baixa").
              </Text>
            </View>
          </View>
        )}

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Dica do dia</Text>
          <Text style={styles.tipsText}>
            Comece pelas tarefas de alta prioridade quando sua energia estiver no
            pico. Deixe tarefas mais leves para momentos de baixa energia.
          </Text>
        </View>
      </ScrollView>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Tarefa</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="O que você precisa fazer?"
              placeholderTextColor={COLORS.neutral.textMuted}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />

            <Text style={styles.inputLabel}>Prioridade</Text>
            <View style={styles.priorityOptions}>
              {(['high', 'medium', 'low'] as TaskPriority[]).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityOption,
                    newTaskPriority === priority && styles.priorityOptionSelected,
                    {
                      borderColor:
                        newTaskPriority === priority
                          ? PRIORITY_CONFIG[priority].color
                          : COLORS.neutral.border,
                    },
                  ]}
                  onPress={() => setNewTaskPriority(priority)}
                >
                  <Text style={styles.priorityOptionText}>
                    {PRIORITY_CONFIG[priority].emoji} {PRIORITY_CONFIG[priority].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Categoria</Text>
            <View style={styles.categoryOptions}>
              {(['work', 'personal', 'health', 'social', 'learning', 'other'] as TaskCategory[]).map(
                (category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      newTaskCategory === category && styles.categoryOptionSelected,
                    ]}
                    onPress={() => setNewTaskCategory(category)}
                  >
                    <Text style={styles.categoryOptionText}>
                      {CATEGORY_CONFIG[category].emoji}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, !newTaskTitle.trim() && styles.saveButtonDisabled]}
              onPress={addTask}
              disabled={!newTaskTitle.trim()}
            >
              <Text style={styles.saveButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
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
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
    marginTop: SPACING.xs,
    textTransform: 'capitalize',
  },
  progressCard: {
    backgroundColor: COLORS.primary.main + '15',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary.main,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary.main,
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    marginTop: SPACING.sm,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  tabActive: {
    backgroundColor: COLORS.primary.main,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary.contrast,
  },
  tasksSection: {
    gap: SPACING.sm,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskCompleted: {
    opacity: 0.6,
  },
  taskCheckbox: {
    marginRight: SPACING.md,
    paddingTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent.success,
    borderColor: COLORS.accent.success,
  },
  checkmark: {
    color: COLORS.neutral.white,
    fontSize: 14,
    fontWeight: '700',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.neutral.textMuted,
  },
  deleteButton: {
    fontSize: 24,
    color: COLORS.neutral.textMuted,
    lineHeight: 24,
  },
  taskMeta: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  taskTags: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  taskTag: {
    fontSize: 12,
    color: COLORS.neutral.textSecondary,
    backgroundColor: COLORS.neutral.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  taskPriority: {
    fontSize: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  taskTime: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
  },
  taskDuration: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
    borderStyle: 'dashed',
    marginTop: SPACING.sm,
  },
  addButtonIcon: {
    fontSize: 24,
    color: COLORS.primary.main,
    marginRight: SPACING.sm,
  },
  addButtonText: {
    fontSize: 16,
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  routinesSection: {
    gap: SPACING.md,
  },
  routineCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  routineName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  routineTime: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    marginTop: 2,
  },
  routineStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral.border,
  },
  routineStatusActive: {
    backgroundColor: COLORS.accent.success + '20',
  },
  routineStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral.textMuted,
  },
  routineStatusTextActive: {
    color: COLORS.accent.success,
  },
  routineSteps: {
    gap: SPACING.sm,
  },
  routineStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary.main + '15',
    color: COLORS.primary.main,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: SPACING.sm,
  },
  routineStepText: {
    fontSize: 15,
    color: COLORS.neutral.textSecondary,
  },
  routineHint: {
    backgroundColor: COLORS.secondary.light + '30',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  routineHintText: {
    fontSize: 14,
    color: COLORS.secondary.dark,
    lineHeight: 20,
  },
  tipsSection: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.xl,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.sm,
  },
  tipsText: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.neutral.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
  },
  modalClose: {
    fontSize: 32,
    color: COLORS.neutral.textMuted,
    lineHeight: 32,
  },
  input: {
    backgroundColor: COLORS.neutral.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.textSecondary,
    marginBottom: SPACING.sm,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
    alignItems: 'center',
  },
  priorityOptionSelected: {
    backgroundColor: COLORS.neutral.background,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral.textPrimary,
  },
  categoryOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  categoryOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryOptionSelected: {
    borderColor: COLORS.primary.main,
    backgroundColor: COLORS.primary.main + '15',
  },
  categoryOptionText: {
    fontSize: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary.contrast,
  },
});
