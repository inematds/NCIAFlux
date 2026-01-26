'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userStorage, getStorageKey } from '@/lib/storage';
import HelpButton from '@/components/HelpButton';
import { getHelpContent } from '@/lib/help-content';

type CheckInStep = 'mood' | 'energy' | 'notes' | 'complete';

interface Task {
  id: string;
  title: string;
  priority?: 'high' | 'medium' | 'low';
  isTop1?: boolean;
  status?: string;
  completed?: boolean;
  estimatedMinutes?: number;
  projectId?: string;
}

const CHECK_IN_MOODS = [
  { value: 'great', emoji: '😊', label: 'Otimo', level: 5 },
  { value: 'good', emoji: '🙂', label: 'Bem', level: 4 },
  { value: 'okay', emoji: '😐', label: 'Ok', level: 3 },
  { value: 'low', emoji: '😔', label: 'Baixo', level: 2 },
  { value: 'struggling', emoji: '😢', label: 'Dificil', level: 1 },
];

const ENERGY_LEVELS = [
  { value: 1, emoji: '😴', label: 'Muito baixa' },
  { value: 2, emoji: '🥱', label: 'Baixa' },
  { value: 3, emoji: '😐', label: 'Moderada' },
  { value: 4, emoji: '⚡', label: 'Boa' },
  { value: 5, emoji: '🔥', label: 'Alta' },
];

export default function CheckInPage() {
  const router = useRouter();
  const user = userStorage.get();

  const [step, setStep] = useState<CheckInStep>('mood');
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks on mount
  useEffect(() => {
    const tasksData = localStorage.getItem(getStorageKey('nciaflux_tasks'));
    if (tasksData) {
      const allTasks: Task[] = JSON.parse(tasksData);
      // Filter to pending/in_progress tasks only
      const pendingTasks = allTasks.filter(
        (t) => !t.completed && t.status !== 'completed'
      );
      setTasks(pendingTasks);
    }
  }, []);

  function getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  function animateTransition(callback: () => void) {
    setIsAnimating(true);
    setTimeout(() => {
      callback();
      setIsAnimating(false);
    }, 200);
  }

  function handleMoodSelect(selectedMood: string) {
    setMood(selectedMood);
    animateTransition(() => setStep('energy'));
  }

  function handleEnergySelect(selectedEnergy: number) {
    setEnergy(selectedEnergy);
    animateTransition(() => setStep('notes'));
  }

  function handleSubmit() {
    // Save check-in to localStorage with today's date as key
    const today = new Date().toISOString().split('T')[0];
    const checkinsKey = getStorageKey('nciaflux_checkins');
    const checkinsData = localStorage.getItem(checkinsKey);
    const checkins = checkinsData ? JSON.parse(checkinsData) : {};

    checkins[today] = {
      id: `checkin_${Date.now()}`,
      date: today,
      userId: user?.id,
      mood,
      energy,
      notes,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(checkinsKey, JSON.stringify(checkins));
    animateTransition(() => setStep('complete'));
  }

  function getProgress(): number {
    switch (step) {
      case 'mood': return 25;
      case 'energy': return 50;
      case 'notes': return 75;
      case 'complete': return 100;
      default: return 0;
    }
  }

  // Get recommendations based on mood and energy
  function getRecommendations() {
    const moodLevel = CHECK_IN_MOODS.find((m) => m.value === mood)?.level || 3;
    const energyLevel = energy || 3;
    const combinedScore = (moodLevel + energyLevel) / 2;

    // Categorize tasks
    const highPriorityTasks = tasks.filter((t) => t.priority === 'high' || t.isTop1);
    const quickTasks = tasks.filter((t) => (t.estimatedMinutes || 30) <= 15);
    const mediumTasks = tasks.filter((t) => t.priority === 'medium' || (!t.priority && !t.isTop1));

    if (mood === 'struggling' || moodLevel <= 1) {
      // Struggling - Crisis mode and self-care
      return {
        type: 'crisis' as const,
        title: 'Cuide de voce primeiro',
        message: 'Tudo bem nao estar bem. Que tal fazer uma pausa e usar algumas tecnicas para se acalmar?',
        primaryAction: { label: 'Modo Crise', href: '/dashboard/crisis', icon: '🆘' },
        secondaryActions: [
          { label: 'Apenas respirar', href: '/dashboard/focus', icon: '🧘' },
        ],
        tasks: [],
      };
    }

    if (combinedScore <= 2) {
      // Very low - suggest easy wins
      return {
        type: 'low' as const,
        title: 'Dia de vitorias pequenas',
        message: 'Energia baixa? Vamos com calma. Escolha uma tarefa rapida para comecar.',
        primaryAction: { label: 'Ver tarefas rapidas', href: '/dashboard/tasks?priority=low', icon: '✨' },
        secondaryActions: [
          { label: 'Descansar', href: '/dashboard', icon: '😴' },
        ],
        tasks: quickTasks.slice(0, 3),
        taskLabel: 'Tarefas rapidas (menos de 15 min):',
      };
    }

    if (combinedScore <= 3.5) {
      // Medium - balanced approach
      return {
        type: 'medium' as const,
        title: 'Um passo de cada vez',
        message: 'Dia ok! Vamos manter um ritmo tranquilo. Escolha uma tarefa para comecar.',
        primaryAction: { label: 'Timer de Foco', href: '/dashboard/focus', icon: '🎯' },
        secondaryActions: [
          { label: 'Ver todas tarefas', href: '/dashboard/tasks', icon: '📋' },
          { label: 'Planejar o dia', href: '/dashboard/planner', icon: '📅' },
        ],
        tasks: mediumTasks.slice(0, 3),
        taskLabel: 'Sugestoes para hoje:',
      };
    }

    // High energy - go for it!
    return {
      type: 'high' as const,
      title: 'Bora com tudo! 🚀',
      message: 'Energia alta e humor bom? Hora de atacar as tarefas importantes!',
      primaryAction: { label: 'Comecar Foco', href: '/dashboard/focus', icon: '🔥' },
      secondaryActions: [
        { label: 'Ver prioridades', href: '/dashboard/tasks?priority=high', icon: '⚡' },
        { label: 'Brain Dump', href: '/dashboard/brain-dump', icon: '📝' },
      ],
      tasks: highPriorityTasks.slice(0, 3),
      taskLabel: 'Tarefas prioritarias:',
    };
  }

  const selectedMood = CHECK_IN_MOODS.find((m) => m.value === mood);
  const selectedEnergy = ENERGY_LEVELS.find((e) => e.value === energy);
  const recommendations = step === 'complete' ? getRecommendations() : null;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="text-neutral-textSecondary hover:text-neutral-textPrimary"
        >
          ← Voltar
        </button>
        <h1 className="text-xl font-semibold text-neutral-textPrimary">Check-in</h1>
        <div className="w-16"></div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-1 bg-neutral-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-main rounded-full transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className={`transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {/* Mood Step */}
        {step === 'mood' && (
          <div>
            <h2 className="text-3xl font-bold text-neutral-textPrimary mb-2">
              {getTimeBasedGreeting()}, {user?.name?.split(' ')[0]}!
            </h2>
            <p className="text-xl text-neutral-textSecondary mb-8">
              Como voce esta se sentindo agora?
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CHECK_IN_MOODS.map((moodOption) => (
                <button
                  key={moodOption.value}
                  onClick={() => handleMoodSelect(moodOption.value)}
                  className={`p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                    mood === moodOption.value
                      ? 'border-primary-main bg-primary-main/10'
                      : 'border-transparent bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <span className="text-5xl block mb-3">{moodOption.emoji}</span>
                  <span className={`font-medium ${
                    mood === moodOption.value ? 'text-primary-main' : 'text-neutral-textSecondary'
                  }`}>
                    {moodOption.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Energy Step */}
        {step === 'energy' && (
          <div>
            <h2 className="text-2xl font-bold text-neutral-textPrimary mb-8">
              Como esta sua energia?
            </h2>

            <div className="space-y-3">
              {ENERGY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleEnergySelect(level.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    energy === level.value
                      ? 'border-primary-main bg-primary-main/10'
                      : 'border-transparent bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <span className="text-3xl">{level.emoji}</span>
                  <div className="flex-1">
                    <div className="h-2 bg-neutral-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          energy === level.value ? 'bg-primary-main' : 'bg-neutral-textMuted'
                        }`}
                        style={{ width: `${level.value * 20}%` }}
                      />
                    </div>
                  </div>
                  <span className={`w-24 text-right font-medium ${
                    energy === level.value ? 'text-primary-main' : 'text-neutral-textSecondary'
                  }`}>
                    {level.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes Step */}
        {step === 'notes' && (
          <div>
            <h2 className="text-2xl font-bold text-neutral-textPrimary mb-2">
              Quer adicionar algo mais?
            </h2>
            <p className="text-neutral-textMuted mb-6">Opcional - pode pular se preferir</p>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Como voce esta se sentindo, o que esta pensando..."
              className="w-full p-4 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main min-h-[150px] resize-none"
            />

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl border border-neutral-border text-neutral-textSecondary font-medium hover:bg-neutral-background transition-colors"
              >
                Pular
              </button>
              <button
                onClick={handleSubmit}
                className="flex-[2] py-3 rounded-xl bg-primary-main text-white font-semibold hover:bg-primary-dark transition-colors"
              >
                Enviar
              </button>
            </div>
          </div>
        )}

        {/* Complete Step - Now with Recommendations! */}
        {step === 'complete' && recommendations && (
          <div>
            {/* Summary Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedMood?.emoji}</span>
                    <span className="text-sm text-neutral-textMuted">{selectedMood?.label}</span>
                  </div>
                  <div className="w-px h-6 bg-neutral-border"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedEnergy?.emoji}</span>
                    <span className="text-sm text-neutral-textMuted">{selectedEnergy?.label}</span>
                  </div>
                </div>
                <span className="text-xs text-accent-success font-medium">✓ Registrado</span>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`rounded-2xl p-6 mb-6 ${
              recommendations.type === 'crisis'
                ? 'bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-200'
                : recommendations.type === 'high'
                ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200'
                : recommendations.type === 'low'
                ? 'bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200'
                : 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200'
            }`}>
              <h2 className="text-2xl font-bold text-neutral-textPrimary mb-2">
                {recommendations.title}
              </h2>
              <p className="text-neutral-textSecondary mb-6">
                {recommendations.message}
              </p>

              {/* Primary Action */}
              <Link
                href={recommendations.primaryAction.href}
                className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] mb-4 ${
                  recommendations.type === 'crisis'
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : recommendations.type === 'high'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-primary-main text-white hover:bg-primary-dark'
                }`}
              >
                <span className="text-2xl">{recommendations.primaryAction.icon}</span>
                {recommendations.primaryAction.label}
              </Link>

              {/* Secondary Actions */}
              <div className="flex gap-3">
                {recommendations.secondaryActions.map((action, idx) => (
                  <Link
                    key={idx}
                    href={action.href}
                    className="flex-1 py-3 rounded-xl border-2 border-white/50 bg-white/30 text-neutral-textPrimary font-medium flex items-center justify-center gap-2 hover:bg-white/50 transition-colors"
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Suggested Tasks */}
            {recommendations.tasks && recommendations.tasks.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                <p className="text-sm font-semibold text-neutral-textMuted mb-3">
                  {recommendations.taskLabel}
                </p>
                <div className="space-y-2">
                  {recommendations.tasks.map((task) => (
                    <Link
                      key={task.id}
                      href="/dashboard/focus"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-background transition-colors group"
                    >
                      <span className="text-lg">
                        {task.isTop1 ? '⭐' : task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                      </span>
                      <span className="flex-1 text-neutral-textPrimary group-hover:text-primary-main transition-colors">
                        {task.title}
                      </span>
                      {task.estimatedMinutes && (
                        <span className="text-xs text-neutral-textMuted">
                          ~{task.estimatedMinutes}min
                        </span>
                      )}
                      <span className="text-neutral-textMuted group-hover:text-primary-main transition-colors">
                        ▶
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Skip to Dashboard */}
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 text-neutral-textMuted hover:text-neutral-textSecondary transition-colors text-sm"
            >
              Ir para o Dashboard →
            </button>
          </div>
        )}
      </div>

      {/* Help Button */}
      <HelpButton content={getHelpContent('checkin')} />
    </div>
  );
}
