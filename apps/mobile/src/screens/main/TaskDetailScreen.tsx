import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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

type TaskDetailRouteProp = RouteProp<MainStackParamList, 'TaskDetail'>;
type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskData {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  estimatedMinutes?: number;
  scheduledTime?: string;
  subtasks: SubTask[];
  notes: string;
}

// Mock data - In production, this would come from Supabase/context
const MOCK_TASKS: Record<string, TaskData> = {
  '1': {
    id: '1',
    title: 'Revisar emails importantes',
    description: 'Checar e responder emails urgentes do trabalho e clientes.',
    priority: 'high',
    category: 'work',
    status: 'pending',
    estimatedMinutes: 30,
    scheduledTime: '09:00',
    subtasks: [
      { id: 's1', title: 'Verificar inbox principal', completed: false },
      { id: 's2', title: 'Responder emails urgentes', completed: false },
      { id: 's3', title: 'Arquivar emails lidos', completed: false },
    ],
    notes: 'Priorizar emails de clientes VIP.',
  },
  '2': {
    id: '2',
    title: 'Reunião de equipe',
    description: 'Reunião semanal com a equipe de desenvolvimento para alinhamento.',
    priority: 'high',
    category: 'work',
    status: 'pending',
    estimatedMinutes: 60,
    scheduledTime: '10:00',
    subtasks: [
      { id: 's1', title: 'Preparar pauta', completed: true },
      { id: 's2', title: 'Revisar status das tarefas', completed: false },
    ],
    notes: '',
  },
  '3': {
    id: '3',
    title: 'Almoço',
    description: 'Pausa para alimentação e descanso.',
    priority: 'medium',
    category: 'health',
    status: 'pending',
    estimatedMinutes: 45,
    scheduledTime: '12:00',
    subtasks: [],
    notes: 'Lembrar de beber água.',
  },
  '4': {
    id: '4',
    title: 'Finalizar relatório',
    description: 'Completar relatório mensal de atividades.',
    priority: 'high',
    category: 'work',
    status: 'pending',
    estimatedMinutes: 90,
    scheduledTime: '14:00',
    subtasks: [
      { id: 's1', title: 'Coletar dados', completed: true },
      { id: 's2', title: 'Criar gráficos', completed: true },
      { id: 's3', title: 'Escrever conclusões', completed: false },
      { id: 's4', title: 'Revisar formatação', completed: false },
    ],
    notes: 'Entregar até sexta-feira.',
  },
  '5': {
    id: '5',
    title: 'Exercício físico',
    description: 'Sessão de exercícios para manter a saúde.',
    priority: 'medium',
    category: 'health',
    status: 'pending',
    estimatedMinutes: 30,
    scheduledTime: '18:00',
    subtasks: [],
    notes: 'Alternância: cardio e força.',
  },
};

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

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: COLORS.secondary.main },
  in_progress: { label: 'Em Andamento', color: COLORS.primary.main },
  completed: { label: 'Concluída', color: COLORS.accent.success },
  skipped: { label: 'Pulada', color: COLORS.neutral.textMuted },
};

export function TaskDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TaskDetailRouteProp>();
  const { taskId } = route.params;

  // Get task data (mock for now)
  const initialTask = MOCK_TASKS[taskId] || {
    id: taskId,
    title: 'Tarefa não encontrada',
    description: '',
    priority: 'medium' as TaskPriority,
    category: 'other' as TaskCategory,
    status: 'pending' as TaskStatus,
    subtasks: [],
    notes: '',
  };

  const [task, setTask] = useState<TaskData>(initialTask);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedNotes, setEditedNotes] = useState(task.notes);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  function toggleSubtask(subtaskId: string) {
    setTask((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      ),
    }));
  }

  function addSubtask() {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: SubTask = {
      id: `st_${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    setTask((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, newSubtask],
    }));

    setNewSubtaskTitle('');
    setShowAddSubtask(false);
  }

  function deleteSubtask(subtaskId: string) {
    setTask((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((st) => st.id !== subtaskId),
    }));
  }

  function saveEdits() {
    setTask((prev) => ({
      ...prev,
      title: editedTitle,
      description: editedDescription,
      notes: editedNotes,
    }));
    setIsEditing(false);
  }

  function toggleStatus() {
    const statusOrder: TaskStatus[] = ['pending', 'in_progress', 'completed', 'skipped'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    setTask((prev) => ({ ...prev, status: statusOrder[nextIndex] }));
  }

  function changePriority(priority: TaskPriority) {
    setTask((prev) => ({ ...prev, priority }));
  }

  function startFocusBlock() {
    navigation.navigate('FocusBlock', { taskId: task.id });
  }

  function deleteTask() {
    Alert.alert(
      'Excluir Tarefa',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            // In production, delete from Supabase
            navigation.goBack();
          },
        },
      ]
    );
  }

  const subtaskProgress = task.subtasks.length > 0
    ? Math.round((task.subtasks.filter((st) => st.completed).length / task.subtasks.length) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {isEditing ? (
            <>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.headerButton}>
                <Text style={styles.headerButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdits} style={styles.headerButtonPrimary}>
                <Text style={styles.headerButtonPrimaryText}>Salvar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerButton}>
                <Text style={styles.headerButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteTask} style={styles.headerButton}>
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Title & Description */}
        <View style={styles.mainSection}>
          {isEditing ? (
            <>
              <TextInput
                style={styles.editTitleInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Título da tarefa"
                placeholderTextColor={COLORS.neutral.textMuted}
              />
              <TextInput
                style={styles.editDescriptionInput}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Descrição (opcional)"
                placeholderTextColor={COLORS.neutral.textMuted}
                multiline
              />
            </>
          ) : (
            <>
              <Text style={styles.title}>{task.title}</Text>
              {task.description ? (
                <Text style={styles.description}>{task.description}</Text>
              ) : null}
            </>
          )}
        </View>

        {/* Status & Meta */}
        <View style={styles.metaSection}>
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[task.status].color + '20' }]}
            onPress={toggleStatus}
          >
            <View style={[styles.statusDot, { backgroundColor: STATUS_CONFIG[task.status].color }]} />
            <Text style={[styles.statusText, { color: STATUS_CONFIG[task.status].color }]}>
              {STATUS_CONFIG[task.status].label}
            </Text>
          </TouchableOpacity>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Categoria</Text>
              <Text style={styles.metaValue}>
                {CATEGORY_CONFIG[task.category].emoji} {CATEGORY_CONFIG[task.category].label}
              </Text>
            </View>
            {task.scheduledTime && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Horário</Text>
                <Text style={styles.metaValue}>⏰ {task.scheduledTime}</Text>
              </View>
            )}
            {task.estimatedMinutes && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Duração</Text>
                <Text style={styles.metaValue}>~{task.estimatedMinutes} min</Text>
              </View>
            )}
          </View>
        </View>

        {/* Priority Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prioridade</Text>
          <View style={styles.priorityOptions}>
            {(['high', 'medium', 'low'] as TaskPriority[]).map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityOption,
                  task.priority === priority && styles.priorityOptionSelected,
                  {
                    borderColor:
                      task.priority === priority
                        ? PRIORITY_CONFIG[priority].color
                        : COLORS.neutral.border,
                  },
                ]}
                onPress={() => changePriority(priority)}
              >
                <Text style={styles.priorityOptionText}>
                  {PRIORITY_CONFIG[priority].emoji} {PRIORITY_CONFIG[priority].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subtasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Subtarefas</Text>
            {task.subtasks.length > 0 && (
              <Text style={styles.subtaskProgress}>{subtaskProgress}%</Text>
            )}
          </View>

          {task.subtasks.length > 0 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${subtaskProgress}%` }]} />
            </View>
          )}

          <View style={styles.subtasksList}>
            {task.subtasks.map((subtask) => (
              <View key={subtask.id} style={styles.subtaskItem}>
                <TouchableOpacity
                  style={styles.subtaskCheckbox}
                  onPress={() => toggleSubtask(subtask.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      subtask.completed && styles.checkboxChecked,
                    ]}
                  >
                    {subtask.completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
                <Text
                  style={[
                    styles.subtaskTitle,
                    subtask.completed && styles.subtaskTitleCompleted,
                  ]}
                >
                  {subtask.title}
                </Text>
                <TouchableOpacity onPress={() => deleteSubtask(subtask.id)}>
                  <Text style={styles.subtaskDelete}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.addSubtaskButton}
            onPress={() => setShowAddSubtask(true)}
          >
            <Text style={styles.addSubtaskText}>+ Adicionar subtarefa</Text>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas</Text>
          {isEditing ? (
            <TextInput
              style={styles.notesInput}
              value={editedNotes}
              onChangeText={setEditedNotes}
              placeholder="Adicionar notas..."
              placeholderTextColor={COLORS.neutral.textMuted}
              multiline
            />
          ) : (
            <Text style={styles.notesText}>
              {task.notes || 'Nenhuma nota adicionada.'}
            </Text>
          )}
        </View>

        {/* Focus Block Button */}
        <TouchableOpacity style={styles.focusButton} onPress={startFocusBlock}>
          <Text style={styles.focusButtonIcon}>🎯</Text>
          <View>
            <Text style={styles.focusButtonText}>Iniciar Bloco de Foco</Text>
            <Text style={styles.focusButtonSubtext}>
              Concentre-se nesta tarefa com temporizador
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Subtask Modal */}
      <Modal
        visible={showAddSubtask}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddSubtask(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Subtarefa</Text>
              <TouchableOpacity onPress={() => setShowAddSubtask(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              placeholder="O que você precisa fazer?"
              placeholderTextColor={COLORS.neutral.textMuted}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.saveButton, !newSubtaskTitle.trim() && styles.saveButtonDisabled]}
              onPress={addSubtask}
              disabled={!newSubtaskTitle.trim()}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  headerButtonText: {
    fontSize: 16,
    color: COLORS.primary.main,
    fontWeight: '500',
  },
  headerButtonPrimary: {
    backgroundColor: COLORS.primary.main,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  headerButtonPrimaryText: {
    fontSize: 16,
    color: COLORS.primary.contrast,
    fontWeight: '600',
  },
  deleteButtonText: {
    fontSize: 16,
    color: COLORS.accent.error,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  mainSection: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
    lineHeight: 24,
  },
  editTitleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  editDescriptionInput: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  metaSection: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
  },
  metaItem: {},
  metaLabel: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 15,
    color: COLORS.neutral.textPrimary,
    fontWeight: '500',
  },
  section: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtaskProgress: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary.main,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary.main,
    borderRadius: 3,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
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
  subtasksList: {
    gap: SPACING.xs,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  subtaskCheckbox: {
    marginRight: SPACING.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
    fontSize: 12,
    fontWeight: '700',
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 15,
    color: COLORS.neutral.textPrimary,
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.neutral.textMuted,
  },
  subtaskDelete: {
    fontSize: 22,
    color: COLORS.neutral.textMuted,
    paddingHorizontal: SPACING.xs,
  },
  addSubtaskButton: {
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  addSubtaskText: {
    fontSize: 14,
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  notesInput: {
    fontSize: 15,
    color: COLORS.neutral.textPrimary,
    backgroundColor: COLORS.neutral.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  notesText: {
    fontSize: 15,
    color: COLORS.neutral.textSecondary,
    lineHeight: 22,
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  focusButtonIcon: {
    fontSize: 32,
  },
  focusButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary.contrast,
  },
  focusButtonSubtext: {
    fontSize: 13,
    color: COLORS.primary.contrast,
    opacity: 0.8,
    marginTop: 2,
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
