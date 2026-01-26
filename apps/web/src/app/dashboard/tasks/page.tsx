'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userStorage, getStorageKey } from '@/lib/storage';
import { userStatsService } from '@/lib/hybrid-storage';
import HelpButton from '@/components/HelpButton';
import { getHelpContent } from '@/lib/help-content';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
type TaskPriority = 'high' | 'medium' | 'low';

// Unified task interface that handles all task sources
interface UnifiedTask {
  id: string;
  title: string; // Will use content if title not present
  description?: string;
  assignee?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  projectId?: string;
  category?: string;
  createdAt: string;
  updatedAt?: string;
  // From planner
  period?: 'morning' | 'afternoon' | 'evening';
  completed?: boolean;
  isTop1?: boolean;
  content?: string; // Alternative to title
}

interface Project {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; emoji: string }> = {
  pending: { label: 'Pendente', color: 'text-secondary-dark', bg: 'bg-secondary-main/20', emoji: '⏳' },
  in_progress: { label: 'Em Andamento', color: 'text-primary-main', bg: 'bg-primary-main/20', emoji: '🔄' },
  completed: { label: 'Concluída', color: 'text-accent-success', bg: 'bg-accent-success/20', emoji: '✅' },
  skipped: { label: 'Pulada', color: 'text-neutral-textMuted', bg: 'bg-neutral-background', emoji: '⏭️' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; emoji: string }> = {
  high: { label: 'Alta', color: 'text-accent-error', emoji: '🔴' },
  medium: { label: 'Média', color: 'text-secondary-dark', emoji: '🟡' },
  low: { label: 'Baixa', color: 'text-accent-success', emoji: '🟢' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<UnifiedTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<UnifiedTask | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load tasks and projects from storage on mount
  useEffect(() => {
    loadTasks();
    loadProjects();

    // Listen for refresh events from chat
    const handleRefresh = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.type === 'tasks' || detail.type === 'all') {
        loadTasks();
      }
    };
    window.addEventListener('nciaflux-data-refresh', handleRefresh);
    return () => window.removeEventListener('nciaflux-data-refresh', handleRefresh);
  }, []);

  function loadTasks() {
    const saved = localStorage.getItem(getStorageKey('nciaflux_tasks'));
    if (saved) {
      const rawTasks = JSON.parse(saved);
      // Normalize tasks to unified format
      const normalized = rawTasks.map((t: Record<string, unknown>) => ({
        ...t,
        title: t.title || t.content || 'Sem título',
        status: t.status || (t.completed ? 'completed' : 'pending'),
        priority: t.priority || 'medium',
        createdAt: t.createdAt || new Date().toISOString(),
      }));
      setTasks(normalized);
    }
  }

  function loadProjects() {
    const saved = localStorage.getItem(getStorageKey('nciaflux_projects'));
    if (saved) {
      setProjects(JSON.parse(saved));
    }
  }

  function saveTasks(newTasks: UnifiedTask[]) {
    localStorage.setItem(getStorageKey('nciaflux_tasks'), JSON.stringify(newTasks));
    setTasks(newTasks);
  }

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterProject !== 'all' && task.projectId !== filterProject) return false;
    const searchText = task.title || task.content || '';
    if (searchQuery && !searchText.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
  };

  function handleAddTask(taskData: Omit<UnifiedTask, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTask: UnifiedTask = {
      ...taskData,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTasks([...tasks, newTask]);
    setShowAddModal(false);

    // Track task creation in Supabase stats
    const user = userStorage.get();
    if (user) {
      userStatsService.incrementTaskStats(user.email, 1, 0);
    }
  }

  function handleUpdateTask(id: string, updates: Partial<UnifiedTask>) {
    const newTasks = tasks.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    saveTasks(newTasks);
    setEditingTask(null);
  }

  function handleDeleteTask(id: string) {
    saveTasks(tasks.filter(t => t.id !== id));
    setDeleteConfirm(null);
  }

  function handleStatusChange(id: string, newStatus: TaskStatus) {
    const oldTask = tasks.find(t => t.id === id);
    handleUpdateTask(id, { status: newStatus, completed: newStatus === 'completed' });

    // Track task completion in Supabase stats
    if (newStatus === 'completed' && oldTask?.status !== 'completed') {
      const user = userStorage.get();
      if (user) {
        userStatsService.incrementTaskStats(user.email, 0, 1);
      }
    }
  }

  function getProjectById(projectId?: string) {
    return projects.find(p => p.id === projectId);
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
            Gestão de Tarefas
          </h1>
          <p className="text-neutral-textSecondary mt-1">
            Acompanhe e gerencie todas as suas tarefas
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/planner"
            className="px-4 py-3 rounded-xl border border-neutral-border text-neutral-textSecondary hover:bg-neutral-background transition-colors flex items-center gap-2"
          >
            📅 Planner
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-main text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-neutral-textPrimary">{stats.total}</p>
          <p className="text-sm text-neutral-textSecondary">Total</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-accent-success">{stats.completed}</p>
          <p className="text-sm text-neutral-textSecondary">Concluídas</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-primary-main">{stats.inProgress}</p>
          <p className="text-sm text-neutral-textSecondary">Em Andamento</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-secondary-dark">{stats.pending}</p>
          <p className="text-sm text-neutral-textSecondary">Pendentes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
              className="px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluída</option>
              <option value="skipped">Pulada</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
              className="px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
            >
              <option value="all">Todas as prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
            {projects.length > 0 && (
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
              >
                <option value="all">Todos os projetos</option>
                <option value="">Sem projeto</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-neutral-textMuted mb-4">Nenhuma tarefa encontrada.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-primary-main font-medium hover:underline"
            >
              Criar primeira tarefa
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const project = getProjectById(task.projectId);
            return (
              <div
                key={task.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-1 ${
                      task.status === 'completed'
                        ? 'bg-accent-success border-accent-success text-white'
                        : 'border-neutral-border hover:border-primary-main'
                    }`}
                  >
                    {task.status === 'completed' && '✓'}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        onClick={() => setEditingTask(task)}
                        className="cursor-pointer flex-1"
                      >
                        <p className={`font-medium ${
                          task.status === 'completed' ? 'line-through text-neutral-textMuted' : 'text-neutral-textPrimary'
                        }`}>
                          {task.isTop1 && <span className="text-accent-success mr-1">⭐</span>}
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-neutral-textMuted mt-1">{task.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-2 hover:bg-neutral-background rounded-lg transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(task.id)}
                          className="p-2 hover:bg-neutral-background rounded-lg transition-colors"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {/* Priority */}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {PRIORITY_CONFIG[task.priority].emoji} {PRIORITY_CONFIG[task.priority].label}
                      </span>

                      {/* Status */}
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className={`text-xs px-2 py-1 rounded-full border-none cursor-pointer ${STATUS_CONFIG[task.status].bg} ${STATUS_CONFIG[task.status].color}`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                          <option key={value} value={value}>{config.emoji} {config.label}</option>
                        ))}
                      </select>

                      {/* Project */}
                      {project && (
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200"
                        >
                          {project.emoji} {project.name}
                        </Link>
                      )}

                      {/* Due Date */}
                      {task.dueDate && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          new Date(task.dueDate) < new Date() && task.status !== 'completed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          📅 {new Date(task.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      )}

                      {/* Period */}
                      {task.period && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {task.period === 'morning' ? '🌅 Manhã' :
                           task.period === 'afternoon' ? '☀️ Tarde' : '🌙 Noite'}
                        </span>
                      )}

                      {/* Assignee */}
                      {task.assignee && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          👤 {task.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <TaskModal
          projects={projects}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTask}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskModal
          task={editingTask}
          projects={projects}
          onClose={() => setEditingTask(null)}
          onSave={(data) => handleUpdateTask(editingTask.id, data)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-neutral-textPrimary mb-2">
              Confirmar exclusão
            </h3>
            <p className="text-neutral-textSecondary mb-6">
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteTask(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-accent-error text-white rounded-lg font-medium hover:bg-accent-error/90 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Button */}
      <HelpButton content={getHelpContent('tasks')} />
    </div>
  );
}

function TaskModal({
  task,
  projects,
  onClose,
  onSave,
}: {
  task?: UnifiedTask;
  projects: Project[];
  onClose: () => void;
  onSave: (task: Omit<UnifiedTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const user = userStorage.get();
  const [formData, setFormData] = useState({
    title: task?.title || task?.content || '',
    description: task?.description || '',
    assignee: task?.assignee || user?.name || '',
    priority: task?.priority || 'medium' as TaskPriority,
    status: task?.status || 'pending' as TaskStatus,
    dueDate: task?.dueDate || new Date().toISOString().split('T')[0],
    projectId: task?.projectId || '',
    period: task?.period || '' as '' | 'morning' | 'afternoon' | 'evening',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...formData,
      projectId: formData.projectId || undefined,
      period: formData.period || undefined,
      completed: formData.status === 'completed',
    } as Omit<UnifiedTask, 'id' | 'createdAt' | 'updatedAt'>);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-textPrimary">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button onClick={onClose} className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="O que precisa ser feito?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main min-h-[80px]"
              placeholder="Detalhes adicionais..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
              >
                <option value="high">🔴 Alta</option>
                <option value="medium">🟡 Média</option>
                <option value="low">🟢 Baixa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
              >
                <option value="pending">⏳ Pendente</option>
                <option value="in_progress">🔄 Em Andamento</option>
                <option value="completed">✅ Concluída</option>
                <option value="skipped">⏭️ Pulada</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Prazo
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Período do dia
              </label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value as '' | 'morning' | 'afternoon' | 'evening' })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
              >
                <option value="">Não definido</option>
                <option value="morning">🌅 Manhã</option>
                <option value="afternoon">☀️ Tarde</option>
                <option value="evening">🌙 Noite</option>
              </select>
            </div>
          </div>
          {projects.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Projeto
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
              >
                <option value="">Sem projeto</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Responsável
            </label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Nome do responsável"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-neutral-border rounded-xl text-neutral-textSecondary hover:bg-neutral-background transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary-main text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              {task ? 'Salvar' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
