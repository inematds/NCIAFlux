'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getStorageKey } from '@/lib/storage';

interface RoutineStats {
  morningCompletedDays: number;
  eveningCompletedDays: number;
  currentStreak: number;
}

export default function RoutinesPage() {
  const [stats, setStats] = useState<RoutineStats>({
    morningCompletedDays: 0,
    eveningCompletedDays: 0,
    currentStreak: 0,
  });
  const [chronotype, setChronotype] = useState<string | null>(null);

  useEffect(() => {
    // Load chronotype
    const savedChronotype = localStorage.getItem(getStorageKey('nciaflux_chronotype'));
    setChronotype(savedChronotype);

    // Calculate stats from planner data
    const today = new Date();
    let morningDays = 0;
    let eveningDays = 0;
    let streak = 0;

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const planData = localStorage.getItem(getStorageKey(`nciaflux_planner_${dateStr}`));

      if (planData) {
        const plan = JSON.parse(planData);
        if (plan.morningRoutineCompleted) morningDays++;
        if (plan.eveningRoutineCompleted) eveningDays++;

        if (i < 7 && (plan.morningRoutineCompleted || plan.eveningRoutineCompleted)) {
          streak++;
        }
      }
    }

    setStats({
      morningCompletedDays: morningDays,
      eveningCompletedDays: eveningDays,
      currentStreak: streak,
    });
  }, []);

  const CHRONOTYPE_TIPS: Record<string, { morning: string; evening: string }> = {
    bear: {
      morning: 'Comece devagar com alongamento e luz natural. Seu pico vem no meio da manha.',
      evening: 'Evite telas apos 21h. Seu corpo segue o ritmo solar.',
    },
    dolphin: {
      morning: 'Exercicio intenso logo cedo ajuda a queimar energia ansiosa.',
      evening: 'Ritual de sono e OBRIGATORIO. Sua mente nao para sozinha.',
    },
    owl: {
      morning: 'Sem culpa por acordar tarde. Luz solar e agua assim que levantar.',
      evening: 'Seu pico criativo e agora! Mas defina horario limite.',
    },
    lion: {
      morning: 'Aproveite! Este e seu melhor momento. Tarefas dificeis primeiro.',
      evening: 'Respeite seu cansaco. Durma cedo para renovar a energia.',
    },
  };

  const tip = chronotype ? CHRONOTYPE_TIPS[chronotype] : null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
          Rotinas
        </h1>
        <p className="text-neutral-textSecondary mt-1">
          Construa habitos que funcionam para voce
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-yellow-500">{stats.morningCompletedDays}</p>
          <p className="text-xs text-neutral-textMuted">Manhas completadas</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-indigo-500">{stats.eveningCompletedDays}</p>
          <p className="text-xs text-neutral-textMuted">Noites completadas</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-accent-success">{stats.currentStreak}</p>
          <p className="text-xs text-neutral-textMuted">Dias seguidos</p>
        </div>
      </div>

      {/* Chronotype Tip */}
      {tip && (
        <div className="bg-primary-main/10 rounded-2xl p-5 mb-6">
          <p className="text-sm text-primary-main font-medium mb-1">
            Dica para seu cronotipo ({chronotype})
          </p>
          <p className="text-neutral-textSecondary text-sm">
            🌅 {tip.morning}
          </p>
        </div>
      )}

      {/* Routine Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Morning Routine */}
        <Link
          href="/dashboard/routines/morning"
          className="block bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">🌅</span>
            <div>
              <h2 className="text-xl font-bold text-neutral-textPrimary">Rotina Matinal</h2>
              <p className="text-sm text-neutral-textSecondary">Comece o dia com intencao</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-neutral-textSecondary">
            <p>• Prepare seu corpo e mente</p>
            <p>• Defina prioridades do dia</p>
            <p>• Crie momentum positivo</p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-primary-main font-medium">Configurar →</span>
          </div>
        </Link>

        {/* Evening Routine */}
        <Link
          href="/dashboard/routines/evening"
          className="block bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">🌙</span>
            <div>
              <h2 className="text-xl font-bold text-neutral-textPrimary">Rotina Noturna</h2>
              <p className="text-sm text-neutral-textSecondary">Feche o dia com calma</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-neutral-textSecondary">
            <p>• Revise o que conquistou</p>
            <p>• Prepare o amanha</p>
            <p>• Desacelere para dormir bem</p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-primary-main font-medium">Configurar →</span>
            {tip && (
              <span className="text-xs text-neutral-textMuted">
                💡 {tip.evening.slice(0, 30)}...
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Quick Tips */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-neutral-textPrimary mb-4">
          Dicas para criar rotinas que funcionam
        </h3>
        <div className="space-y-3 text-sm text-neutral-textSecondary">
          <div className="flex items-start gap-3">
            <span className="text-lg">🎯</span>
            <p><strong>Comece pequeno:</strong> 2-3 itens por rotina. Voce pode expandir depois.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">⏰</span>
            <p><strong>Horario fixo:</strong> Mesmo horario todo dia cria habito automatico.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🔗</span>
            <p><strong>Encadeie habitos:</strong> Conecte novo habito a um existente (ex: meditar depois do cafe).</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">💪</span>
            <p><strong>Seja flexivel:</strong> Dias ruins acontecem. Uma rotina minima e melhor que nenhuma.</p>
          </div>
        </div>
      </div>

      {/* Link to Chronotype */}
      {!chronotype && (
        <div className="mt-6 text-center">
          <p className="text-neutral-textMuted mb-2">
            Descubra seu cronotipo para rotinas personalizadas
          </p>
          <Link
            href="/dashboard/chronotype"
            className="text-primary-main font-medium hover:underline"
          >
            Fazer quiz de cronotipo →
          </Link>
        </div>
      )}
    </div>
  );
}
