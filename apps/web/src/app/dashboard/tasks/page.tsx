'use client';

import { useState, useEffect } from 'react';
import { tasksStorage, StoredTask, userStorage } from '@/lib/storage';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
type TaskPriority = 'high' | 'medium' | 'low';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: 'text-secondary-dark', bg: 'bg-secondary-main/20' },
  in_progress: { label: 'Em Andamento', color: 'text-primary-main', bg: 'bg-primary-main/20' },
  completed: { label: 'Concluída', color: 'text-accent-success', bg: 'bg-accent-success/20' },
  skipped: { label: 'Pulada', color: 'text-neutral-textMuted', bg: 'bg-neutral-background' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; emoji: string }> = {
  high: { label: 'Alta', color: 'text-accent-error', emoji: '🔴' },
  medium: { label: 'Média', color: 'text-secondary-dark', emoji: '🟡' },
  low: { label: 'Baixa', color: 'text-accent-success', emoji: '🟢' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<StoredTask[]>([]);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<StoredTask | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load tasks from storage on mount
  useEffect(() => {
    setTasks(tasksStorage.getAll());
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
  };

  function handleAddTask(taskData: Omit<StoredTask, 'id' | 'createdAt' | 'updatedAt'>) {
    tasksStorage.add(taskData);
    setTasks(tasksStorage.getAll());
    setShowAddModal(false);
  }

  function handleUpdateTask(id: string, updates: Partial<StoredTask>) {
    tasksStorage.update(id, updates);
    setTasks(tasksStorage.getAll());
    setEditingTask(null);
  }

  function handleDeleteTask(id: string) {
    tasksStorage.delete(id);
    setTasks(tasksStorage.getAll());
    setDeleteConfirm(null);
  }

  function handleStatusChange(id: string, newStatus: TaskStatus) {
    tasksStorage.update(id, { status: newStatus });
    setTasks(tasksStorage.getAll());
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
            Acompanhe e gerencie suas tarefas
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-main text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2 self-start"
        >
          <span className="text-xl">+</span>
          Nova Tarefa
        </button>
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
          <div className="flex gap-3">
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
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-background">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-neutral-textSecondary">
                  Tarefa
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-neutral-textSecondary">
                  Responsável
                </th>
                <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">
                  Prioridade
                </th>
                <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">
                  Status
                </th>
                <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">
                  Prazo
                </th>
                <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-neutral-border last:border-0 hover:bg-neutral-background/50"
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-neutral-textPrimary">{task.title}</p>
                      <p className="text-sm text-neutral-textMuted">{task.description}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-light/20 rounded-full flex items-center justify-center text-xs font-medium text-primary-main">
                        {task.assignee.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-neutral-textSecondary">{task.assignee}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={PRIORITY_CONFIG[task.priority].color}>
                      {PRIORITY_CONFIG[task.priority].emoji} {PRIORITY_CONFIG[task.priority].label}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${STATUS_CONFIG[task.status].bg} ${STATUS_CONFIG[task.status].color}`}
                    >
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Em Andamento</option>
                      <option value="completed">Concluída</option>
                      <option value="skipped">Pulada</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-center text-neutral-textSecondary">
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-neutral-textMuted">Nenhuma tarefa encontrada.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-primary-main font-medium hover:underline"
            >
              Criar primeira tarefa
            </button>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <TaskModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTask}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskModal
          task={editingTask}
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
    </div>
  );
}

function TaskModal({
  task,
  onClose,
  onSave,
}: {
  task?: StoredTask;
  onClose: () => void;
  onSave: (task: Omit<StoredTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const user = userStorage.get();
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignee: task?.assignee || user?.name || 'Usuário Demo',
    priority: task?.priority || 'medium' as TaskPriority,
    status: task?.status || 'pending' as TaskStatus,
    dueDate: task?.dueDate || new Date().toISOString().split('T')[0],
    category: task?.category || 'Trabalho',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
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
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Responsável
            </label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              required
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
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Prazo
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                required
              />
            </div>
          </div>
          {task && (
            <div>
              <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
              >
                <option value="pending">Pendente</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluída</option>
                <option value="skipped">Pulada</option>
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              {task ? 'Salvar' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
