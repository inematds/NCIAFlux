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
  tasks: PlannerTask[];
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
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPeriod, setNewTaskPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [showAddTask, setShowAddTask] = useState(false);

  // Load plan from localStorage
  useEffect(() => {
    loadPlan(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  function loadPlan(date: string) {
    const saved = localStorage.getItem(`nciaflux_planner_${date}`);
    if (saved) {
      setPlan(JSON.parse(saved));
    } else {
      // Create new plan for the day
      const brainDumpData = localStorage.getItem('nciaflux_brain_dump');
      let top1 = null;
      const initialTasks: PlannerTask[] = [];

      if (brainDumpData) {
        const { items } = JSON.parse(brainDumpData);
        const top1Item = items?.find((i: { isTop1: boolean }) => i.isTop1);
        if (top1Item) {
          top1 = top1Item.content;
          initialTasks.push({
            id: `task_${Date.now()}`,
            content: top1Item.content,
            period: 'morning',
            completed: false,
            isTop1: true,
          });
        }

        // Add "today" items from brain dump
        const todayItems = items?.filter((i: { status: string; isTop1: boolean }) => i.status === 'today' && !i.isTop1) || [];
        todayItems.slice(0, 2).forEach((item: { content: string }, index: number) => {
          initialTasks.push({
            id: `task_${Date.now()}_${index}`,
            content: item.content,
            period: index === 0 ? 'afternoon' : 'evening',
            completed: false,
            isTop1: false,
          });
        });
      }

      const newPlan: DayPlan = {
        date,
        confirmation: '',
        gratitude: '',
        mood: '',
        sleepQuality: 0,
        expectedRating: 0,
        top1,
        tasks: initialTasks,
        morningRoutineCompleted: false,
        eveningRoutineCompleted: false,
        morningReview: '',
        eveningReview: '',
      };
      setPlan(newPlan);
      savePlan(newPlan);
    }
  }

  function savePlan(planToSave: DayPlan) {
    localStorage.setItem(`nciaflux_planner_${planToSave.date}`, JSON.stringify(planToSave));
  }

  function updatePlan(updates: Partial<DayPlan>) {
    if (!plan) return;
    const updated = { ...plan, ...updates };
    setPlan(updated);
    savePlan(updated);
  }

  function addTask() {
    if (!newTaskText.trim() || !plan) return;

    const newTask: PlannerTask = {
      id: `task_${Date.now()}`,
      content: newTaskText.trim(),
      period: newTaskPeriod,
      completed: false,
      isTop1: false,
    };

    updatePlan({ tasks: [...plan.tasks, newTask] });
    setNewTaskText('');
    setShowAddTask(false);
  }

  function toggleTask(taskId: string) {
    if (!plan) return;
    const updated = plan.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updatePlan({ tasks: updated });
  }

  function deleteTask(taskId: string) {
    if (!plan) return;
    updatePlan({ tasks: plan.tasks.filter(t => t.id !== taskId) });
  }

  function navigateDay(offset: number) {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + offset);
    setSelectedDate(current.toISOString().split('T')[0]);
  }

  if (!plan) return null;

  const completedTasks = plan.tasks.filter(t => t.completed).length;
  const totalTasks = plan.tasks.length;
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
        const periodTasks = plan.tasks.filter(t => t.period === period.id);
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
                onClick={() => {
                  setNewTaskPeriod(period.id as 'morning' | 'afternoon' | 'evening');
                  setShowAddTask(true);
                }}
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
                periodTasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-xl bg-white ${
                      task.isTop1 ? 'ring-2 ring-accent-success' : ''
                    }`}
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
                    <span
                      className={`flex-1 ${
                        task.completed ? 'line-through text-neutral-textMuted' : 'text-neutral-textPrimary'
                      }`}
                    >
                      {task.isTop1 && <span className="text-accent-success mr-1">⭐</span>}
                      {task.content}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-neutral-textMuted hover:text-accent-error p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))
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
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/dashboard/brain-dump"
          className="p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <span className="text-2xl block mb-1">🧠</span>
          <span className="text-sm text-neutral-textSecondary">Brain Dump</span>
        </Link>
        <Link
          href="/dashboard/focus"
          className="p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <span className="text-2xl block mb-1">⏱️</span>
          <span className="text-sm text-neutral-textSecondary">Iniciar Foco</span>
        </Link>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-neutral-textPrimary mb-4">
              Nova Tarefa - {PERIODS.find(p => p.id === newTaskPeriod)?.label}
            </h3>
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="O que voce precisa fazer?"
              className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main mb-4"
              autoFocus
            />
            <div className="flex gap-2 mb-4">
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
