'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  color: string;
  emoji: string;
  status: 'active' | 'archived' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  content: string;
  completed: boolean;
  projectId?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

const COLORS: Record<string, { class: string; light: string }> = {
  blue: { class: 'bg-blue-500', light: 'bg-blue-100' },
  green: { class: 'bg-green-500', light: 'bg-green-100' },
  purple: { class: 'bg-purple-500', light: 'bg-purple-100' },
  orange: { class: 'bg-orange-500', light: 'bg-orange-100' },
  pink: { class: 'bg-pink-500', light: 'bg-pink-100' },
  yellow: { class: 'bg-yellow-500', light: 'bg-yellow-100' },
  red: { class: 'bg-red-500', light: 'bg-red-100' },
  teal: { class: 'bg-teal-500', light: 'bg-teal-100' },
};

const PRIORITY_CONFIG = {
  high: { label: 'Alta', color: 'text-red-600 bg-red-100' },
  medium: { label: 'Media', color: 'text-yellow-600 bg-yellow-100' },
  low: { label: 'Baixa', color: 'text-green-600 bg-green-100' },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showAddTask, setShowAddTask] = useState(false);

  // Load data
  useEffect(() => {
    const savedProjects = localStorage.getItem('nciaflux_projects');
    if (savedProjects) {
      const projects: Project[] = JSON.parse(savedProjects);
      const found = projects.find(p => p.id === projectId);
      if (found) {
        setProject(found);
      } else {
        router.push('/dashboard/projects');
      }
    }

    const savedTasks = localStorage.getItem('nciaflux_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, [projectId, router]);

  // Save tasks
  function saveTasks(newTasks: Task[]) {
    setTasks(newTasks);
    localStorage.setItem('nciaflux_tasks', JSON.stringify(newTasks));
  }

  function addTask() {
    if (!newTaskContent.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      content: newTaskContent.trim(),
      completed: false,
      projectId,
      priority: newTaskPriority,
      createdAt: new Date().toISOString(),
    };

    saveTasks([newTask, ...tasks]);
    setNewTaskContent('');
    setShowAddTask(false);
  }

  function toggleTask(taskId: string) {
    saveTasks(tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  }

  function deleteTask(taskId: string) {
    saveTasks(tasks.filter(t => t.id !== taskId));
  }

  function removeFromProject(taskId: string) {
    saveTasks(tasks.map(t =>
      t.id === taskId ? { ...t, projectId: undefined } : t
    ));
  }

  if (!project) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full" />
      </div>
    );
  }

  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const filteredTasks = projectTasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = projectTasks.filter(t => t.completed).length;
  const progress = projectTasks.length > 0
    ? Math.round((completedCount / projectTasks.length) * 100)
    : 0;

  const colorConfig = COLORS[project.color] || COLORS.blue;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/projects"
          className="text-sm text-neutral-textMuted hover:text-primary-main mb-2 inline-block"
        >
          ← Voltar aos projetos
        </Link>

        <div className={`${colorConfig.light} rounded-2xl p-6`}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{project.emoji}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-neutral-textPrimary">{project.name}</h1>
              <p className="text-sm text-neutral-textMuted">
                {projectTasks.length} tarefas • {completedCount} concluidas
              </p>
            </div>
            <div className={`w-4 h-4 rounded-full ${colorConfig.class}`} />
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-neutral-textSecondary">Progresso</span>
              <span className="font-medium text-neutral-textPrimary">{progress}%</span>
            </div>
            <div className="h-3 bg-white/50 rounded-full overflow-hidden">
              <div
                className={`h-full ${colorConfig.class} transition-all`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Button */}
      <button
        onClick={() => setShowAddTask(true)}
        className="w-full py-3 mb-6 rounded-xl border-2 border-dashed border-neutral-border text-neutral-textSecondary hover:border-primary-main hover:text-primary-main transition-colors"
      >
        + Adicionar tarefa
      </button>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-main text-white'
                : 'bg-white text-neutral-textSecondary hover:bg-neutral-background'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : 'Concluidas'}
            {f === 'all' && ` (${projectTasks.length})`}
            {f === 'pending' && ` (${projectTasks.filter(t => !t.completed).length})`}
            {f === 'completed' && ` (${completedCount})`}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl block mb-2">📋</span>
            <p className="text-neutral-textMuted">
              {filter === 'all'
                ? 'Nenhuma tarefa neste projeto'
                : filter === 'pending'
                  ? 'Nenhuma tarefa pendente'
                  : 'Nenhuma tarefa concluida'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-border">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 hover:bg-neutral-background/50 transition-colors"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-accent-success border-accent-success text-white'
                      : 'border-neutral-border hover:border-primary-main'
                  }`}
                >
                  {task.completed && '✓'}
                </button>

                <div className="flex-1">
                  <p className={`${task.completed ? 'line-through text-neutral-textMuted' : 'text-neutral-textPrimary'}`}>
                    {task.content}
                  </p>
                </div>

                <span className={`text-xs px-2 py-1 rounded-full ${PRIORITY_CONFIG[task.priority].color}`}>
                  {PRIORITY_CONFIG[task.priority].label}
                </span>

                <div className="flex gap-1">
                  <button
                    onClick={() => removeFromProject(task.id)}
                    className="p-2 text-neutral-textMuted hover:text-secondary-main hover:bg-secondary-main/10 rounded-lg"
                    title="Remover do projeto"
                  >
                    ↗️
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-neutral-textMuted hover:text-accent-error hover:bg-accent-error/10 rounded-lg"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-neutral-textPrimary mb-4">
              Nova Tarefa
            </h3>

            <input
              type="text"
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="O que precisa ser feito?"
              className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main mb-4"
              autoFocus
            />

            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">Prioridade</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setNewTaskPriority(p)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      newTaskPriority === p
                        ? PRIORITY_CONFIG[p].color
                        : 'bg-neutral-background text-neutral-textSecondary'
                    }`}
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddTask(false)}
                className="flex-1 py-3 rounded-xl border border-neutral-border text-neutral-textSecondary"
              >
                Cancelar
              </button>
              <button
                onClick={addTask}
                className="flex-1 py-3 rounded-xl bg-primary-main text-white font-semibold"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
