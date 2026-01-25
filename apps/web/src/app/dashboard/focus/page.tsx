'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getStorageKey } from '@/lib/storage';

type FocusMode = 'pomodoro' | 'deep_work' | 'timeboxing' | 'free_flow';
type FocusState = 'idle' | 'selecting_task' | 'focusing' | 'break' | 'paused' | 'completed';

interface Task {
  id: string;
  title?: string;
  content?: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  projectId?: string;
  isTop1?: boolean;
}

interface Project {
  id: string;
  name: string;
  emoji: string;
}

const FOCUS_MODES = [
  {
    id: 'pomodoro' as FocusMode,
    name: 'Pomodoro',
    emoji: '🍅',
    description: '25 min foco + 5 min pausa',
    focusTime: 25,
    breakTime: 5,
  },
  {
    id: 'deep_work' as FocusMode,
    name: 'Deep Work',
    emoji: '🧠',
    description: '50 min foco + 10 min pausa',
    focusTime: 50,
    breakTime: 10,
  },
  {
    id: 'timeboxing' as FocusMode,
    name: 'Timeboxing',
    emoji: '📦',
    description: '15 min de foco intenso',
    focusTime: 15,
    breakTime: 3,
  },
  {
    id: 'free_flow' as FocusMode,
    name: 'Fluxo Livre',
    emoji: '🌊',
    description: 'Sem timer - foque quanto quiser',
    focusTime: 0,
    breakTime: 0,
  },
];

const PRIORITY_CONFIG = {
  high: { label: 'Alta', color: 'text-accent-error', bg: 'bg-accent-error/10', emoji: '🔴' },
  medium: { label: 'Media', color: 'text-secondary-dark', bg: 'bg-secondary-main/10', emoji: '🟡' },
  low: { label: 'Baixa', color: 'text-accent-success', bg: 'bg-accent-success/10', emoji: '🟢' },
};

export default function FocusPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedMode, setSelectedMode] = useState<FocusMode | null>(null);
  const [focusState, setFocusState] = useState<FocusState>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [freeFlowTime, setFreeFlowTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentMode = selectedMode ? FOCUS_MODES.find((m) => m.id === selectedMode)! : FOCUS_MODES[0];
  const today = new Date().toISOString().split('T')[0];

  // Load tasks and stats
  useEffect(() => {
    // Load tasks
    const savedTasks = localStorage.getItem(getStorageKey('nciaflux_tasks'));
    if (savedTasks) {
      const allTasks: Task[] = JSON.parse(savedTasks);
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const filteredTasks = allTasks
        .filter(t => t.status === 'pending' || t.status === 'in_progress')
        .sort((a, b) => {
          if (a.isTop1 && !b.isTop1) return -1;
          if (!a.isTop1 && b.isTop1) return 1;
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          return 0;
        });
      setTasks(filteredTasks);
    }

    // Load projects
    const savedProjects = localStorage.getItem(getStorageKey('nciaflux_projects'));
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    // Load focus stats
    const stats = JSON.parse(localStorage.getItem(getStorageKey('nciaflux_focus_stats')) || '{}');
    if (stats[today]) {
      setTotalFocusTime(stats[today].totalMinutes || 0);
      setSessionsCompleted(stats[today].sessions || 0);
    }
  }, [today]);

  // Save stats to localStorage
  const saveStats = useCallback((addMinutes: number, addSession: boolean) => {
    const stats = JSON.parse(localStorage.getItem(getStorageKey('nciaflux_focus_stats')) || '{}');
    if (!stats[today]) {
      stats[today] = { totalMinutes: 0, sessions: 0 };
    }
    stats[today].totalMinutes += addMinutes;
    if (addSession) {
      stats[today].sessions += 1;
    }
    localStorage.setItem(getStorageKey('nciaflux_focus_stats'), JSON.stringify(stats));
    setTotalFocusTime(stats[today].totalMinutes);
    setSessionsCompleted(stats[today].sessions);
  }, [today]);

  // Timer logic
  useEffect(() => {
    if (focusState === 'focusing' || focusState === 'break') {
      intervalRef.current = setInterval(() => {
        if (selectedMode === 'free_flow' && focusState === 'focusing') {
          setFreeFlowTime((prev) => prev + 1);
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              if (focusState === 'focusing') {
                saveStats(currentMode.focusTime, true);
                if (currentMode.breakTime > 0) {
                  setFocusState('break');
                  return currentMode.breakTime * 60;
                } else {
                  setFocusState('completed');
                  return 0;
                }
              } else {
                setFocusState('completed');
                return 0;
              }
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [focusState, selectedMode, currentMode, saveStats]);

  function getProjectName(projectId?: string): string {
    if (!projectId) return '';
    const project = projects.find(p => p.id === projectId);
    return project ? `${project.emoji} ${project.name}` : '';
  }

  function getTaskTitle(task: Task): string {
    return task.title || task.content || 'Sem titulo';
  }

  function selectMode(mode: FocusMode) {
    setSelectedMode(mode);
    setFocusState('selecting_task');
  }

  function selectTask(task: Task) {
    setSelectedTask(task);
    startFocus(task);
  }

  function startFocus(task: Task) {
    if (selectedMode === 'free_flow') {
      setFreeFlowTime(0);
    } else {
      setTimeLeft(currentMode.focusTime * 60);
    }
    setFocusState('focusing');
    updateTaskStatus(task.id, 'in_progress');
  }

  function pauseFocus() {
    setFocusState('paused');
  }

  function resumeFocus() {
    setFocusState('focusing');
  }

  function stopFocus() {
    if (selectedMode === 'free_flow') {
      const minutesFocused = Math.floor(freeFlowTime / 60);
      if (minutesFocused > 0) {
        saveStats(minutesFocused, true);
      }
    } else if (focusState === 'focusing') {
      const minutesFocused = Math.floor((currentMode.focusTime * 60 - timeLeft) / 60);
      if (minutesFocused > 0) {
        saveStats(minutesFocused, false);
      }
    }
    resetToIdle();
  }

  function completeTask() {
    if (selectedTask) {
      updateTaskStatus(selectedTask.id, 'completed');
      setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
    }
    resetToIdle();
  }

  function continueWorking() {
    resetToIdle();
  }

  function resetToIdle() {
    setFocusState('idle');
    setSelectedTask(null);
    setSelectedMode(null);
    setTimeLeft(0);
    setFreeFlowTime(0);
  }

  function updateTaskStatus(taskId: string, newStatus: string) {
    const savedTasks = localStorage.getItem(getStorageKey('nciaflux_tasks'));
    if (savedTasks) {
      const allTasks = JSON.parse(savedTasks);
      const updated = allTasks.map((t: Task) =>
        t.id === taskId ? { ...t, status: newStatus, completed: newStatus === 'completed' } : t
      );
      localStorage.setItem(getStorageKey('nciaflux_tasks'), JSON.stringify(updated));
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function getProgressPercentage(): number {
    if (selectedMode === 'free_flow' || focusState === 'idle') return 0;
    const totalSeconds = focusState === 'break'
      ? currentMode.breakTime * 60
      : currentMode.focusTime * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  }

  function isOverdue(dueDate?: string): boolean {
    if (!dueDate) return false;
    return dueDate < today;
  }

  function isDueToday(dueDate?: string): boolean {
    return dueDate === today;
  }

  // ========== IDLE STATE - Choose technique ==========
  if (focusState === 'idle') {
    return (
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
            Timer de Foco
          </h1>
          <p className="text-neutral-textSecondary mt-1">
            Escolha uma tecnica para comecar
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-neutral-textSecondary">Tempo focado hoje</p>
            <p className="text-3xl font-bold text-primary-main mt-1">{totalFocusTime} min</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-neutral-textSecondary">Sessoes completas</p>
            <p className="text-3xl font-bold text-accent-success mt-1">{sessionsCompleted}</p>
          </div>
        </div>

        {/* Technique Selection */}
        <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4">
          Escolha a Tecnica
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {FOCUS_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => selectMode(mode.id)}
              className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-primary-main group"
            >
              <div className="flex items-center gap-4 mb-3">
                <span className="text-4xl">{mode.emoji}</span>
                <div>
                  <span className="text-xl font-semibold text-neutral-textPrimary group-hover:text-primary-main transition-colors">
                    {mode.name}
                  </span>
                  <p className="text-sm text-neutral-textSecondary">{mode.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick tip */}
        <div className="bg-secondary-main/10 rounded-xl p-4">
          <p className="text-sm text-neutral-textSecondary">
            <strong>💡 Dica:</strong> Pomodoro é otimo para tarefas que exigem atencao constante.
            Deep Work para trabalhos criativos. Timeboxing para tarefas rapidas.
          </p>
        </div>
      </div>
    );
  }

  // ========== SELECTING TASK STATE - Choose task or start without ==========
  if (focusState === 'selecting_task' && selectedMode) {
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.isTop1);
    const otherTasks = tasks.filter(t => t.priority !== 'high' && !t.isTop1);

    return (
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={resetToIdle}
            className="text-neutral-textSecondary hover:text-neutral-textPrimary mb-2 flex items-center gap-1"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
            Escolha uma Tarefa
          </h1>
        </div>

        {/* Selected Mode */}
        <div className="bg-primary-main/10 rounded-xl p-4 mb-6 border border-primary-main/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentMode.emoji}</span>
            <div>
              <p className="font-semibold text-neutral-textPrimary">{currentMode.name}</p>
              <p className="text-sm text-neutral-textSecondary">{currentMode.description}</p>
            </div>
          </div>
          <button
            onClick={resetToIdle}
            className="text-sm text-primary-main hover:underline"
          >
            Trocar
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <span className="text-5xl block mb-4">📝</span>
            <h3 className="text-xl font-semibold text-neutral-textPrimary mb-2">
              Nenhuma tarefa pendente
            </h3>
            <p className="text-neutral-textSecondary mb-6">
              Crie uma tarefa para poder focar nela
            </p>
            <Link
              href="/dashboard/tasks"
              className="inline-block px-6 py-3 rounded-xl bg-primary-main text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              Criar Tarefa
            </Link>
          </div>
        ) : (
          <>
            {/* Priority Tasks */}
            {highPriorityTasks.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-neutral-textPrimary mb-3 flex items-center gap-2">
                  <span>🔥</span> Prioridade Alta
                </h2>
                <div className="space-y-3">
                  {highPriorityTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => selectTask(task)}
                      className="w-full p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-left border-l-4 border-accent-error"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {task.isTop1 && <span className="text-lg">⭐</span>}
                            <span className="font-medium text-neutral-textPrimary">
                              {getTaskTitle(task)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            {task.projectId && (
                              <span className="text-neutral-textMuted">
                                {getProjectName(task.projectId)}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className={`${isOverdue(task.dueDate) ? 'text-accent-error' : isDueToday(task.dueDate) ? 'text-secondary-dark' : 'text-neutral-textMuted'}`}>
                                {isOverdue(task.dueDate) ? '⚠️ Atrasada' : isDueToday(task.dueDate) ? '📅 Hoje' : `📅 ${task.dueDate}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-2xl">▶️</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Other Tasks */}
            {otherTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-neutral-textPrimary mb-3 flex items-center gap-2">
                  <span>📋</span> Outras Tarefas
                </h2>
                <div className="space-y-3">
                  {otherTasks.slice(0, 5).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => selectTask(task)}
                      className={`w-full p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-left border-l-4 ${
                        task.priority === 'medium' ? 'border-secondary-main' : 'border-accent-success'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className="font-medium text-neutral-textPrimary">
                            {getTaskTitle(task)}
                          </span>
                          <div className="flex items-center gap-3 text-sm mt-1">
                            <span className={PRIORITY_CONFIG[task.priority].color}>
                              {PRIORITY_CONFIG[task.priority].emoji} {PRIORITY_CONFIG[task.priority].label}
                            </span>
                            {task.projectId && (
                              <span className="text-neutral-textMuted">
                                {getProjectName(task.projectId)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-2xl">▶️</span>
                      </div>
                    </button>
                  ))}
                </div>
                {otherTasks.length > 5 && (
                  <Link
                    href="/dashboard/tasks"
                    className="block text-center text-primary-main font-medium mt-4 hover:underline"
                  >
                    Ver todas as {otherTasks.length} tarefas
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ========== COMPLETED STATE ==========
  if (focusState === 'completed' && selectedTask) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <span className="text-6xl block mb-4">🎉</span>
          <h2 className="text-2xl font-bold text-neutral-textPrimary mb-2">
            Sessao Completa!
          </h2>
          <p className="text-neutral-textSecondary mb-6">
            Voce focou em: <strong>{getTaskTitle(selectedTask)}</strong>
          </p>

          <div className="bg-accent-success/10 rounded-xl p-4 mb-8">
            <p className="text-accent-success font-medium">
              +{currentMode.focusTime || Math.floor(freeFlowTime / 60)} minutos de foco!
            </p>
          </div>

          <p className="text-lg font-medium text-neutral-textPrimary mb-4">
            Voce terminou essa tarefa?
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={completeTask}
              className="px-8 py-3 rounded-xl bg-accent-success text-white font-semibold hover:bg-accent-success/90 transition-colors flex items-center gap-2"
            >
              <span>✅</span> Sim, concluir!
            </button>
            <button
              onClick={continueWorking}
              className="px-8 py-3 rounded-xl bg-secondary-main/20 text-secondary-dark font-semibold hover:bg-secondary-main/30 transition-colors"
            >
              Ainda nao
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== TIMER DISPLAY (focusing, break, paused) ==========
  return (
    <div className="p-6 lg:p-8">
      {/* Task Banner */}
      {selectedTask && (
        <div className="bg-primary-main/10 rounded-xl p-4 mb-6 border border-primary-main/20">
          <p className="text-sm text-primary-main font-medium mb-1">Focando em:</p>
          <p className="text-lg font-semibold text-neutral-textPrimary flex items-center gap-2">
            {selectedTask.isTop1 && <span>⭐</span>}
            {getTaskTitle(selectedTask)}
          </p>
        </div>
      )}

      {/* Timer */}
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <div className="mb-6">
          <span className="text-6xl">{currentMode.emoji}</span>
        </div>

        <p className={`text-lg font-medium mb-2 ${
          focusState === 'break' ? 'text-accent-success' : 'text-primary-main'
        }`}>
          {focusState === 'break' ? '☕ Pausa' : focusState === 'paused' ? '⏸️ Pausado' : '🎯 Focando'}
        </p>

        {selectedMode === 'free_flow' ? (
          <p className="text-6xl font-bold text-neutral-textPrimary mb-8">
            {formatTime(freeFlowTime)}
          </p>
        ) : (
          <>
            <p className="text-6xl font-bold text-neutral-textPrimary mb-4">
              {formatTime(timeLeft)}
            </p>

            {/* Progress Ring */}
            <div className="w-48 h-48 mx-auto mb-8 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke={focusState === 'break' ? '#10B981' : '#6366F1'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - getProgressPercentage() / 100)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-neutral-textPrimary">
                  {Math.ceil(getProgressPercentage())}%
                </span>
              </div>
            </div>
          </>
        )}

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          {focusState === 'paused' ? (
            <button
              onClick={resumeFocus}
              className="px-8 py-3 rounded-xl bg-primary-main text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={pauseFocus}
              className="px-8 py-3 rounded-xl bg-secondary-main/20 text-secondary-dark font-semibold hover:bg-secondary-main/30 transition-colors"
            >
              Pausar
            </button>
          )}
          <button
            onClick={stopFocus}
            className="px-8 py-3 rounded-xl border border-accent-error text-accent-error font-semibold hover:bg-accent-error/10 transition-colors"
          >
            Parar
          </button>
        </div>

        {focusState !== 'paused' && selectedMode !== 'free_flow' && (
          <p className="text-sm text-neutral-textMuted mt-6">
            {focusState === 'break'
              ? 'Descanse um pouco, voce merece!'
              : 'Mantenha o foco, voce consegue!'}
          </p>
        )}
      </div>

      {/* Tips */}
      {focusState === 'focusing' && (
        <div className="mt-8 bg-secondary-main/10 rounded-xl p-6">
          <h3 className="font-semibold text-neutral-textPrimary mb-3">Dicas:</h3>
          <ul className="space-y-2 text-sm text-neutral-textSecondary">
            <li>• Silencie notificacoes do celular</li>
            <li>• Se distrair, anote e volte ao foco</li>
            <li>• Respire fundo se sentir ansiedade</li>
          </ul>
        </div>
      )}
    </div>
  );
}
