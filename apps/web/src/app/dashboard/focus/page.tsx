'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type FocusMode = 'pomodoro' | 'deep_work' | 'timeboxing' | 'free_flow';
type FocusState = 'idle' | 'focusing' | 'break' | 'paused';

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

export default function FocusPage() {
  const [selectedMode, setSelectedMode] = useState<FocusMode>('pomodoro');
  const [focusState, setFocusState] = useState<FocusState>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [freeFlowTime, setFreeFlowTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentMode = FOCUS_MODES.find((m) => m.id === selectedMode)!;

  // Load stats from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stats = JSON.parse(localStorage.getItem('nciaflux_focus_stats') || '{}');
    if (stats[today]) {
      setTotalFocusTime(stats[today].totalMinutes || 0);
      setSessionsCompleted(stats[today].sessions || 0);
    }
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((addMinutes: number, addSession: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const stats = JSON.parse(localStorage.getItem('nciaflux_focus_stats') || '{}');
    if (!stats[today]) {
      stats[today] = { totalMinutes: 0, sessions: 0 };
    }
    stats[today].totalMinutes += addMinutes;
    if (addSession) {
      stats[today].sessions += 1;
    }
    localStorage.setItem('nciaflux_focus_stats', JSON.stringify(stats));
    setTotalFocusTime(stats[today].totalMinutes);
    setSessionsCompleted(stats[today].sessions);
  }, []);

  // Timer logic
  useEffect(() => {
    if (focusState === 'focusing' || focusState === 'break') {
      intervalRef.current = setInterval(() => {
        if (selectedMode === 'free_flow' && focusState === 'focusing') {
          setFreeFlowTime((prev) => prev + 1);
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              // Timer completed
              if (focusState === 'focusing') {
                saveStats(currentMode.focusTime, true);
                if (currentMode.breakTime > 0) {
                  setFocusState('break');
                  return currentMode.breakTime * 60;
                } else {
                  setFocusState('idle');
                  return 0;
                }
              } else {
                // Break completed
                setFocusState('idle');
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

  function startFocus() {
    if (selectedMode === 'free_flow') {
      setFreeFlowTime(0);
      setFocusState('focusing');
    } else {
      setTimeLeft(currentMode.focusTime * 60);
      setFocusState('focusing');
    }
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
    setFocusState('idle');
    setTimeLeft(0);
    setFreeFlowTime(0);
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

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
          Timer de Foco
        </h1>
        <p className="text-neutral-textSecondary mt-1">
          Escolha uma tecnica e concentre-se
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

      {focusState === 'idle' ? (
        <>
          {/* Mode Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4">
              Escolha uma tecnica
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {FOCUS_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    selectedMode === mode.id
                      ? 'border-primary-main bg-primary-main/5'
                      : 'border-transparent bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{mode.emoji}</span>
                    <span className={`text-lg font-semibold ${
                      selectedMode === mode.id ? 'text-primary-main' : 'text-neutral-textPrimary'
                    }`}>
                      {mode.name}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-textSecondary">{mode.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startFocus}
            className="w-full py-4 rounded-xl bg-primary-main text-white font-semibold text-lg hover:bg-primary-dark transition-colors"
          >
            Iniciar Foco
          </button>
        </>
      ) : (
        /* Timer Display */
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="mb-6">
            <span className="text-6xl">{currentMode.emoji}</span>
          </div>

          <p className={`text-lg font-medium mb-2 ${
            focusState === 'break' ? 'text-accent-success' : 'text-primary-main'
          }`}>
            {focusState === 'break' ? 'Pausa' : focusState === 'paused' ? 'Pausado' : 'Focando'}
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
      )}

      {/* Tips */}
      {focusState === 'idle' && (
        <div className="mt-8 bg-secondary-main/10 rounded-xl p-6">
          <h3 className="font-semibold text-neutral-textPrimary mb-3">Dicas para focar melhor:</h3>
          <ul className="space-y-2 text-sm text-neutral-textSecondary">
            <li>• Silencie notificacoes do celular</li>
            <li>• Use fones de ouvido com musica instrumental</li>
            <li>• Tenha agua por perto</li>
            <li>• Defina uma unica tarefa antes de comecar</li>
          </ul>
        </div>
      )}
    </div>
  );
}
