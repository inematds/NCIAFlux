'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DayPlan {
  date: string;
  confirmation: string;
  gratitude: string;
  mood: string;
  sleepQuality: number;
  expectedRating: number;
  top1: string | null;
  morningRoutineCompleted: boolean;
  eveningRoutineCompleted: boolean;
  morningReview: string;
  eveningReview: string;
}

interface PlannerTask {
  id: string;
  content: string;
  period: 'morning' | 'afternoon' | 'evening';
  completed: boolean;
  isTop1: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  projectId?: string;
  createdAt: string;
}

const MOODS = [
  { value: 'great', emoji: '😊', label: 'Otimo' },
  { value: 'good', emoji: '🙂', label: 'Bem' },
  { value: 'neutral', emoji: '😐', label: 'Normal' },
  { value: 'tired', emoji: '😴', label: 'Cansado' },
  { value: 'anxious', emoji: '😰', label: 'Ansioso' },
];

const PERIODS = [
  { id: 'morning', label: 'Manha', emoji: '🌅', time: '6h - 12h', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'afternoon', label: 'Tarde', emoji: '☀️', time: '12h - 18h', color: 'bg-orange-50 border-orange-200' },
  { id: 'evening', label: 'Noite', emoji: '🌙', time: '18h - 24h', color: 'bg-indigo-50 border-indigo-200' },
];

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'bg-gray-100 text-gray-700', emoji: '⏳' },
  in_progress: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700', emoji: '🔄' },
  completed: { label: 'Concluida', color: 'bg-green-100 text-green-700', emoji: '✅' },
  skipped: { label: 'Pulada', color: 'bg-gray-100 text-gray-500', emoji: '⏭️' },
};

const PRIORITY_CONFIG = {
  high: { label: 'Alta', color: 'bg-red-100 text-red-700', emoji: '🔴' },
  medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-700', emoji: '🟡' },
  low: { label: 'Baixa', color: 'bg-green-100 text-green-700', emoji: '🟢' },
};

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; emoji: string }[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null);

  // New task form state
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskPeriod, setNewTaskPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [newTaskStatus, setNewTaskStatus] = useState<'pending' | 'in_progress' | 'completed' | 'skipped'>('pending');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskProject, setNewTaskProject] = useState<string>('');

  // Load data
  useEffect(() => {
    loadData(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  function loadData(date: string) {
    // Load plan
    const savedPlan = localStorage.getItem(`nciaflux_planner_${date}`);
    if (savedPlan) {
      setPlan(JSON.parse(savedPlan));
    } else {
      // Create new plan
      const brainDumpData = localStorage.getItem('nciaflux_brain_dump');
      let top1 = null;
      if (brainDumpData) {
        const { items } = JSON.parse(brainDumpData);
        const top1Item = items?.find((i: { isTop1: boolean }) => i.isTop1);
        if (top1Item) {
          top1 = top1Item.content;
        }
      }

      const newPlan: DayPlan = {
        date,
        confirmation: '',
        gratitude: '',
        mood: '',
        sleepQuality: 0,
        expectedRating: 0,
        top1,
        morningRoutineCompleted: false,
        eveningRoutineCompleted: false,
        morningReview: '',
        eveningReview: '',
      };
      setPlan(newPlan);
      savePlan(newPlan);
    }

    // Load tasks for this date from global tasks storage
    const savedTasks = localStorage.getItem('nciaflux_tasks');
    if (savedTasks) {
      const allTasks: PlannerTask[] = JSON.parse(savedTasks);
      const dayTasks = allTasks.filter(t => t.dueDate === date);
      setTasks(dayTasks);
    } else {
      setTasks([]);
    }

    // Load projects
    const savedProjects = localStorage.getItem('nciaflux_projects');
    if (savedProjects) {
      const projectsList = JSON.parse(savedProjects);
      setProjects(projectsList.filter((p: { status: string }) => p.status === 'active'));
    }
  }

  function savePlan(planToSave: DayPlan) {
    localStorage.setItem(`nciaflux_planner_${planToSave.date}`, JSON.stringify(planToSave));
  }

  function saveTasksToStorage(updatedTasks: PlannerTask[]) {
    // Get all tasks
    const savedTasks = localStorage.getItem('nciaflux_tasks');
    let allTasks: PlannerTask[] = savedTasks ? JSON.parse(savedTasks) : [];

    // Remove tasks for this date
    allTasks = allTasks.filter(t => t.dueDate !== selectedDate);

    // Add updated tasks
    allTasks = [...allTasks, ...updatedTasks];

    localStorage.setItem('nciaflux_tasks', JSON.stringify(allTasks));
    setTasks(updatedTasks);
  }

  function updatePlan(updates: Partial<DayPlan>) {
    if (!plan) return;
    const updated = { ...plan, ...updates };
    setPlan(updated);
    savePlan(updated);
  }

  function resetTaskForm() {
    setNewTaskContent('');
    setNewTaskPeriod('morning');
    setNewTaskStatus('pending');
    setNewTaskPriority('medium');
    setNewTaskProject('');
    setEditingTask(null);
  }

  function openAddTask(period: 'morning' | 'afternoon' | 'evening') {
    resetTaskForm();
    setNewTaskPeriod(period);
    setShowAddTask(true);
  }

  function openEditTask(task: PlannerTask) {
    setEditingTask(task);
    setNewTaskContent(task.content);
    setNewTaskPeriod(task.period);
    setNewTaskStatus(task.status);
    setNewTaskPriority(task.priority);
    setNewTaskProject(task.projectId || '');
    setShowAddTask(true);
  }

  function saveTask() {
    if (!newTaskContent.trim()) return;

    if (editingTask) {
      // Update existing task
      const updatedTasks = tasks.map(t =>
        t.id === editingTask.id
          ? {
              ...t,
              content: newTaskContent.trim(),
              period: newTaskPeriod,
              status: newTaskStatus,
              priority: newTaskPriority,
              projectId: newTaskProject || undefined,
              completed: newTaskStatus === 'completed',
            }
          : t
      );
      saveTasksToStorage(updatedTasks);
    } else {
      // Add new task
      const newTask: PlannerTask = {
        id: `task_${Date.now()}`,
        content: newTaskContent.trim(),
        period: newTaskPeriod,
        completed: newTaskStatus === 'completed',
        isTop1: false,
        status: newTaskStatus,
        priority: newTaskPriority,
        dueDate: selectedDate,
        projectId: newTaskProject || undefined,
        createdAt: new Date().toISOString(),
      };
      saveTasksToStorage([...tasks, newTask]);
    }

    resetTaskForm();
    setShowAddTask(false);
  }

  function toggleTask(taskId: string) {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const newCompleted = !t.completed;
        return {
          ...t,
          completed: newCompleted,
          status: newCompleted ? 'completed' as const : 'pending' as const,
        };
      }
      return t;
    });
    saveTasksToStorage(updatedTasks);
  }

  function updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'skipped') {
    const updatedTasks = tasks.map(t =>
      t.id === taskId
        ? { ...t, status, completed: status === 'completed' }
        : t
    );
    saveTasksToStorage(updatedTasks);
  }

  function deleteTask(taskId: string) {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    saveTasksToStorage(updatedTasks);
  }

  function navigateDay(offset: number) {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + offset);
    setSelectedDate(current.toISOString().split('T')[0]);
  }

  if (!plan) return null;

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header with Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateDay(-1)}
          className="p-2 rounded-lg hover:bg-neutral-background"
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="text-xl lg:text-2xl font-bold text-neutral-textPrimary capitalize">
            {formatDate(selectedDate)}
          </h1>
          {selectedDate === getToday() && (
            <span className="text-sm text-primary-main font-medium">Hoje</span>
          )}
        </div>
        <button
          onClick={() => navigateDay(1)}
          className="p-2 rounded-lg hover:bg-neutral-background"
        >
          →
        </button>
      </div>

      {/* Morning Check-in Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-neutral-textPrimary mb-4 flex items-center gap-2">
          <span>🌅</span> Comeco do Dia
        </h2>

        {/* Mood */}
        <div className="mb-4">
          <label className="block text-sm text-neutral-textSecondary mb-2">Como voce esta?</label>
          <div className="flex gap-2">
            {MOODS.map(mood => (
              <button
                key={mood.value}
                onClick={() => updatePlan({ mood: mood.value })}
                className={`flex-1 p-3 rounded-xl text-center transition-all ${
                  plan.mood === mood.value
                    ? 'bg-white shadow-md ring-2 ring-primary-main'
                    : 'bg-white/50 hover:bg-white'
                }`}
              >
                <span className="text-2xl block">{mood.emoji}</span>
                <span className="text-xs text-neutral-textMuted">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sleep Quality */}
        <div className="mb-4">
          <label className="block text-sm text-neutral-textSecondary mb-2">
            Qualidade do sono (1-10): <strong>{plan.sleepQuality || '-'}</strong>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={plan.sleepQuality || 5}
            onChange={(e) => updatePlan({ sleepQuality: Number(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-neutral-textMuted">
            <span>Pessimo</span>
            <span>Excelente</span>
          </div>
        </div>

        {/* Day Confirmation */}
        <div className="mb-4">
          <label className="block text-sm text-neutral-textSecondary mb-2">
            🎯 Intencao positiva para hoje
          </label>
          <input
            type="text"
            value={plan.confirmation}
            onChange={(e) => updatePlan({ confirmation: e.target.value })}
            placeholder="Hoje eu vou..."
            className="w-full px-4 py-3 rounded-xl border border-neutral-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-main"
          />
        </div>

        {/* Gratitude */}
        <div>
          <label className="block text-sm text-neutral-textSecondary mb-2">
            🙏 Gratidao
          </label>
          <input
            type="text"
            value={plan.gratitude}
            onChange={(e) => updatePlan({ gratitude: e.target.value })}
            placeholder="Sou grato por..."
            className="w-full px-4 py-3 rounded-xl border border-neutral-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-main"
          />
        </div>
      </div>

      {/* Top 1 Priority */}
      {plan.top1 && (
        <div className="bg-accent-success/10 border-2 border-accent-success rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⭐</span>
            <span className="font-bold text-accent-success">TOP 1 - Prioridade Absoluta</span>
          </div>
          <p className="text-lg text-neutral-textPrimary">{plan.top1}</p>
          <Link
            href="/dashboard/brain-dump"
            className="text-sm text-primary-main hover:underline mt-2 inline-block"
          >
            Alterar no Brain Dump →
          </Link>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-neutral-textSecondary">Progresso do dia</span>
          <span className="text-sm font-medium text-neutral-textPrimary">
            {completedTasks}/{totalTasks} tarefas
          </span>
        </div>
        <div className="h-3 bg-neutral-background rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-main to-accent-success transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Period Sections */}
      {PERIODS.map(period => {
        const periodTasks = tasks.filter(t => t.period === period.id);
        return (
          <div key={period.id} className={`rounded-2xl p-5 mb-4 border ${period.color}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{period.emoji}</span>
                <div>
                  <h3 className="font-semibold text-neutral-textPrimary">{period.label}</h3>
                  <span className="text-xs text-neutral-textMuted">{period.time}</span>
                </div>
              </div>
              <button
                onClick={() => openAddTask(period.id as 'morning' | 'afternoon' | 'evening')}
                className="text-sm px-3 py-1 rounded-lg bg-white text-primary-main hover:bg-primary-main/10"
              >
                + Tarefa
              </button>
            </div>

            {/* Routine Link */}
            {(period.id === 'morning' || period.id === 'evening') && (
              <Link
                href={`/dashboard/routines/${period.id}`}
                className={`flex items-center gap-2 p-3 rounded-xl mb-3 ${
                  period.id === 'morning'
                    ? plan.morningRoutineCompleted
                      ? 'bg-accent-success/20 text-accent-success'
                      : 'bg-white text-neutral-textSecondary'
                    : plan.eveningRoutineCompleted
                      ? 'bg-accent-success/20 text-accent-success'
                      : 'bg-white text-neutral-textSecondary'
                }`}
              >
                <span>
                  {(period.id === 'morning' ? plan.morningRoutineCompleted : plan.eveningRoutineCompleted)
                    ? '✅'
                    : '⏰'}
                </span>
                <span className="text-sm">
                  Rotina {period.id === 'morning' ? 'Matinal' : 'Noturna'}
                </span>
              </Link>
            )}

            {/* Tasks */}
            <div className="space-y-2">
              {periodTasks.length === 0 ? (
                <p className="text-sm text-neutral-textMuted text-center py-4">
                  Nenhuma tarefa para este periodo
                </p>
              ) : (
                periodTasks.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl bg-white ${
                        task.isTop1 ? 'ring-2 ring-accent-success' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                            task.completed
                              ? 'bg-accent-success border-accent-success text-white'
                              : 'border-neutral-border hover:border-primary-main'
                          }`}
                        >
                          {task.completed && '✓'}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div
                            onClick={() => openEditTask(task)}
                            className={`cursor-pointer ${
                              task.completed ? 'line-through text-neutral-textMuted' : 'text-neutral-textPrimary'
                            }`}
                          >
                            {task.isTop1 && <span className="text-accent-success mr-1">⭐</span>}
                            {task.content}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {/* Priority */}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_CONFIG[task.priority].color}`}>
                              {PRIORITY_CONFIG[task.priority].emoji} {PRIORITY_CONFIG[task.priority].label}
                            </span>
                            {/* Status */}
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value as 'pending' | 'in_progress' | 'completed' | 'skipped')}
                              className={`text-xs px-2 py-0.5 rounded-full border-none cursor-pointer ${STATUS_CONFIG[task.status].color}`}
                            >
                              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                                <option key={value} value={value}>{config.emoji} {config.label}</option>
                              ))}
                            </select>
                            {/* Project */}
                            {project && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                {project.emoji} {project.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-neutral-textMuted hover:text-accent-error p-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      {/* Day Rating */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <label className="block text-sm text-neutral-textSecondary mb-2">
          📊 Como voce espera que seja o dia? (1-10): <strong>{plan.expectedRating || '-'}</strong>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={plan.expectedRating || 5}
          onChange={(e) => updatePlan({ expectedRating: Number(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-neutral-textMuted">
          <span>Dificil</span>
          <span>Excelente</span>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/dashboard/brain-dump"
          className="p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <span className="text-2xl block mb-1">🧠</span>
          <span className="text-sm text-neutral-textSecondary">Brain Dump</span>
        </Link>
        <Link
          href="/dashboard/tasks"
          className="p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <span className="text-2xl block mb-1">📋</span>
          <span className="text-sm text-neutral-textSecondary">Todas Tarefas</span>
        </Link>
        <Link
          href="/dashboard/focus"
          className="p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <span className="text-2xl block mb-1">⏱️</span>
          <span className="text-sm text-neutral-textSecondary">Iniciar Foco</span>
        </Link>
      </div>

      {/* Add/Edit Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-neutral-textPrimary mb-4">
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h3>

            {/* Task Content */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">Descricao</label>
              <input
                type="text"
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
                placeholder="O que voce precisa fazer?"
                className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                autoFocus
              />
            </div>

            {/* Period */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">Periodo</label>
              <div className="flex gap-2">
                {PERIODS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setNewTaskPeriod(p.id as 'morning' | 'afternoon' | 'evening')}
                    className={`flex-1 p-2 rounded-lg text-sm ${
                      newTaskPeriod === p.id
                        ? 'bg-primary-main text-white'
                        : 'bg-neutral-background text-neutral-textSecondary'
                    }`}
                  >
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">Prioridade</label>
              <div className="flex gap-2">
                {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                  <button
                    key={value}
                    onClick={() => setNewTaskPriority(value as 'high' | 'medium' | 'low')}
                    className={`flex-1 p-2 rounded-lg text-sm ${
                      newTaskPriority === value
                        ? config.color + ' ring-2 ring-offset-1 ring-gray-400'
                        : 'bg-neutral-background text-neutral-textSecondary'
                    }`}
                  >
                    {config.emoji} {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                  <button
                    key={value}
                    onClick={() => setNewTaskStatus(value as 'pending' | 'in_progress' | 'completed' | 'skipped')}
                    className={`p-2 rounded-lg text-sm ${
                      newTaskStatus === value
                        ? config.color + ' ring-2 ring-offset-1 ring-gray-400'
                        : 'bg-neutral-background text-neutral-textSecondary'
                    }`}
                  >
                    {config.emoji} {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Project */}
            {projects.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm text-neutral-textSecondary mb-2">Projeto (opcional)</label>
                <select
                  value={newTaskProject}
                  onChange={(e) => setNewTaskProject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                >
                  <option value="">Sem projeto</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddTask(false); resetTaskForm(); }}
                className="flex-1 py-3 rounded-xl border border-neutral-border text-neutral-textSecondary"
              >
                Cancelar
              </button>
              <button
                onClick={saveTask}
                className="flex-1 py-3 rounded-xl bg-primary-main text-white font-semibold"
              >
                {editingTask ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
