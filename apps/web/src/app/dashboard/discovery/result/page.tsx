'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStorageKey } from '@/lib/storage';

interface CognitiveProfile {
  id: string;
  summary: string;
  insight: string;
  suggestion: string;
  chronotype: string;
  energy_pattern: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
  };
  execution_style: string;
  distraction_triggers: string[];
  coping_strengths: string[];
  focus_duration_minutes: number;
  best_focus_time: string;
  needs_external_accountability: boolean;
  response_to_pressure: string;
}

interface DiscoveryAnswer {
  question_id: string;
  value: string | string[] | number;
}

function generateProfile(answers: Record<string, DiscoveryAnswer>): CognitiveProfile {
  // Extract answers
  const chronotype = answers['0']?.value as string || 'normal';
  const wakeEnergy = answers['1']?.value as string || 'medium';
  const productiveTime = answers['2']?.value as string || 'afternoon';
  const focusDuration = answers['3']?.value as number || 25;
  const distractions = (answers['4']?.value as string[]) || ['notifications'];
  const executionStyle = answers['5']?.value as string || 'sequential';
  const copingStrategies = (answers['6']?.value as string[]) || ['lists'];
  const accountability = answers['7']?.value as string || 'sometimes';
  const pressureResponse = answers['8']?.value as string || 'mixed';

  // Generate energy pattern based on chronotype and productive time
  let energyPattern = {
    morning: 'medium',
    afternoon: 'medium',
    evening: 'medium',
    night: 'low',
  };

  // Adjust energy pattern based on chronotype
  if (chronotype === 'early_bird') {
    energyPattern = { morning: 'high', afternoon: 'medium', evening: 'low', night: 'low' };
  } else if (chronotype === 'night_owl') {
    energyPattern = { morning: 'low', afternoon: 'medium', evening: 'high', night: 'high' };
  } else if (chronotype === 'nocturnal') {
    energyPattern = { morning: 'low', afternoon: 'low', evening: 'medium', night: 'high' };
  } else if (chronotype === 'shift_worker') {
    energyPattern = { morning: 'medium', afternoon: 'medium', evening: 'medium', night: 'medium' };
  } else if (chronotype === 'insomniac' || chronotype === 'irregular') {
    energyPattern = { morning: 'low', afternoon: 'medium', evening: 'medium', night: 'medium' };
  }

  // Override with productive time preference
  if (productiveTime === 'early_morning' || productiveTime === 'morning') {
    energyPattern.morning = 'high';
  } else if (productiveTime === 'afternoon') {
    energyPattern.afternoon = 'high';
  } else if (productiveTime === 'evening') {
    energyPattern.evening = 'high';
  } else if (productiveTime === 'late_night' || productiveTime === 'dawn') {
    energyPattern.night = 'high';
  }

  // Generate personalized summary
  const summaryParts = [];

  // Chronotype-based summary
  if (chronotype === 'early_bird') {
    summaryParts.push('Voce e uma cotovia - funciona melhor cedo e seu dia rende nas primeiras horas.');
  } else if (chronotype === 'night_owl') {
    summaryParts.push('Voce e uma coruja - seu cerebro acorda de verdade a noite.');
  } else if (chronotype === 'nocturnal') {
    summaryParts.push('Voce tem um ritmo noturno - trabalha quando o mundo dorme e dorme quando o mundo trabalha.');
  } else if (chronotype === 'shift_worker') {
    summaryParts.push('Voce trabalha em turnos - sua rotina muda e voce precisa se adaptar constantemente.');
  } else if (chronotype === 'insomniac') {
    summaryParts.push('Voce lida com insonia ou sono irregular - o cansaco e um companheiro frequente.');
  } else if (chronotype === 'irregular') {
    summaryParts.push('Seu ritmo e caotico - cada dia e diferente e previsibilidade nao e seu forte.');
  }

  // Wake energy addition
  if (wakeEnergy === 'low' || wakeEnergy === 'depends_time') {
    summaryParts.push('Acordar no seu horario natural faz toda diferenca na sua energia.');
  } else if (wakeEnergy === 'poor_sleep') {
    summaryParts.push('Sono de qualidade e uma luta constante - cuidar disso e prioridade.');
  } else if (wakeEnergy === 'anxious') {
    summaryParts.push('A mente ja acorda acelerada - tecnicas de calma matinal podem ajudar.');
  }

  if (focusDuration <= 20) {
    summaryParts.push('Sessoes curtas de foco funcionam melhor para voce.');
  } else if (focusDuration >= 120) {
    summaryParts.push('Voce tem capacidade de hiperfoco - consegue manter concentracao por horas.');
  } else if (focusDuration >= 40) {
    summaryParts.push('Voce consegue manter blocos de foco mais longos.');
  }

  if (executionStyle === 'sequential') {
    summaryParts.push('Uma tarefa por vez e seu estilo ideal.');
  } else if (executionStyle === 'burst') {
    summaryParts.push('Voce funciona bem em rajadas de produtividade.');
  } else if (executionStyle === 'mood') {
    summaryParts.push('Seu estilo de trabalho depende do seu humor e energia do momento.');
  }

  // Generate insight based on chronotype
  let insight = '';

  // Chronotype-specific insights
  if (chronotype === 'nocturnal') {
    insight = 'Trabalhar de noite tem suas vantagens: menos distracao, silencio. Mas cuide para ter luz adequada e nao pular refeicoes. ';
  } else if (chronotype === 'shift_worker') {
    insight = 'Turnos variaveis exigem flexibilidade. Tente manter rituais de inicio/fim de trabalho independente do horario. ';
  } else if (chronotype === 'insomniac') {
    insight = 'Com sono irregular, foque em aproveitar os momentos de clareza mental quando eles vierem. Nao se cobre por horarios "normais". ';
  } else if (chronotype === 'irregular') {
    insight = 'Seu ritmo caotico pode ser uma forca: voce se adapta. Mas ter algumas ancoras fixas (como refeicoes) pode ajudar. ';
  } else if (accountability === 'yes') {
    insight = 'Seu cerebro responde bem a estimulos externos como cobrancas e prazos. ';
  } else {
    insight = 'Voce funciona melhor com autonomia e auto-gestao. ';
  }

  if (distractions.includes('anxiety')) {
    insight += 'Tecnicas de respiracao e grounding podem ajudar quando a ansiedade surgir. ';
  }

  if (distractions.includes('notifications') || distractions.includes('social_media')) {
    insight += 'Desligar notificacoes durante o foco pode fazer muita diferenca.';
  } else if (distractions.includes('thoughts')) {
    insight += 'Ter um bloco de notas por perto para capturar pensamentos pode ajudar.';
  } else if (distractions.includes('people')) {
    insight += 'Comunicar seus horarios de foco pode reduzir interrupcoes.';
  }

  // Generate suggestion based on chronotype and focus
  let suggestion = '';

  // Chronotype-specific suggestions
  if (chronotype === 'nocturnal') {
    suggestion = 'Configure o app para seu horario noturno. Suas "manhas" sao as noites dos outros. ';
  } else if (chronotype === 'shift_worker') {
    suggestion = 'Use o check-in de energia sempre que mudar de turno para reajustar suas expectativas. ';
  } else if (chronotype === 'insomniac') {
    suggestion = 'Nao se force a produzir quando esta exausto. Priorize tarefas para momentos de maior clareza. ';
  } else if (chronotype === 'irregular') {
    suggestion = 'Defina 1-2 tarefas prioritarias por dia. Com ritmo imprevisivel, menos metas = mais chances de cumprir. ';
  } else if (focusDuration <= 25) {
    suggestion = 'Experimente a tecnica Pomodoro (25 min foco + 5 min pausa) nos seus horarios de pico de energia.';
  } else if (focusDuration >= 120) {
    suggestion = 'Com seu hiperfoco, blocos de 90-120 min sao ideais. Mas lembre-se de pausar para agua e alongamento!';
  } else {
    suggestion = 'Experimente blocos de Deep Work de 50 minutos seguidos de pausas de 10 minutos.';
  }

  if (copingStrategies.includes('music')) {
    suggestion += ' Musica instrumental pode ajudar a manter o foco.';
  }

  if (copingStrategies.includes('movement') || copingStrategies.includes('breaks')) {
    suggestion += ' Pequenas pausas com movimento sao essenciais para voce.';
  }

  if (pressureResponse === 'procrastinate') {
    suggestion += ' Dividir tarefas em passos menores pode evitar a procrastinacao.';
  }

  return {
    id: `profile_${Date.now()}`,
    summary: summaryParts.join(' ') || 'Voce tem um perfil unico que combina diferentes padroes de energia e foco ao longo do dia.',
    insight,
    suggestion,
    chronotype,
    energy_pattern: energyPattern,
    execution_style: executionStyle,
    distraction_triggers: distractions,
    coping_strengths: copingStrategies,
    focus_duration_minutes: focusDuration,
    best_focus_time: productiveTime,
    needs_external_accountability: accountability === 'yes',
    response_to_pressure: pressureResponse,
  };
}

const TIME_LABELS: Record<string, string> = {
  early_morning: 'Bem cedo',
  morning: 'Manha',
  afternoon: 'Tarde',
  evening: 'Noite',
  late_night: 'Noite alta',
  dawn: 'Madrugada',
  night: 'Noite',
  varies: 'Varia',
  no_pattern: 'Sem padrao',
};

const CHRONOTYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  early_bird: { label: 'Cotovia', emoji: '🐦' },
  normal: { label: 'Normal', emoji: '😴' },
  night_owl: { label: 'Coruja', emoji: '🦉' },
  nocturnal: { label: 'Noturno', emoji: '🌙' },
  shift_worker: { label: 'Turnista', emoji: '🔄' },
  insomniac: { label: 'Insone', emoji: '👁️' },
  irregular: { label: 'Caotico', emoji: '🎲' },
};

const ENERGY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
};

const ENERGY_COLORS: Record<string, string> = {
  low: 'bg-red-400',
  medium: 'bg-yellow-400',
  high: 'bg-green-400',
};

const EXECUTION_LABELS: Record<string, string> = {
  sequential: 'Uma tarefa por vez',
  parallel: 'Varias ao mesmo tempo',
  burst: 'Em rajadas',
  mood: 'Depende do humor',
};

const COPING_LABELS: Record<string, string> = {
  lists: 'Listas',
  timers: 'Timers',
  music: 'Musica',
  movement: 'Movimento',
  caffeine: 'Cafe',
  body_doubling: 'Companhia',
  rewards: 'Recompensas',
  deadlines: 'Prazos',
  environment: 'Mudar ambiente',
  breaks: 'Pausas frequentes',
};

const DISTRACTION_LABELS: Record<string, string> = {
  notifications: 'Notificacoes',
  noise: 'Barulho',
  visual_clutter: 'Bagunca visual',
  thoughts: 'Pensamentos',
  social_media: 'Redes sociais',
  hunger: 'Fome',
  fatigue: 'Cansaco',
  anxiety: 'Ansiedade',
  people: 'Interrupcoes',
  boredom: 'Tedio',
};

// Helper to get label, handling "other:" prefix for custom values
function getLabel(value: string, labels: Record<string, string>): string {
  if (value.startsWith('other:')) {
    return value.replace('other:', '');
  }
  return labels[value] || value;
}

export default function DiscoveryResultPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get answers from localStorage
    const answersStr = localStorage.getItem(getStorageKey('nciaflux_discovery_answers'));
    if (!answersStr) {
      router.push('/dashboard/discovery');
      return;
    }

    const answers = JSON.parse(answersStr);

    // Simulate analysis delay
    const timer = setTimeout(() => {
      const generatedProfile = generateProfile(answers);
      setProfile(generatedProfile);

      // Save profile to localStorage
      localStorage.setItem(getStorageKey('nciaflux_cognitive_profile'), JSON.stringify(generatedProfile));

      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  function handleContinue() {
    router.push('/dashboard');
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-primary-main/5 to-secondary-main/5 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-main border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-neutral-textPrimary mb-2">
            Analisando seu perfil...
          </h2>
          <p className="text-neutral-textMuted">Isso leva so alguns segundos</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-primary-main/5 to-secondary-main/5 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-6xl block mb-4">🎉</span>
          <h1 className="text-3xl font-bold text-neutral-textPrimary">
            Seu Perfil Cognitivo
          </h1>
          <p className="text-neutral-textSecondary mt-2">
            Baseado nas suas respostas
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-primary-main/10 rounded-2xl p-6 mb-8 border-l-4 border-primary-main">
          <p className="text-lg text-neutral-textPrimary leading-relaxed">
            {profile.summary}
          </p>
        </div>

        {/* Energy Pattern */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4">
            Padrao de Energia
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(profile.energy_pattern).map(([time, level]) => (
              <div key={time} className="text-center">
                <p className="text-sm text-neutral-textSecondary mb-2">
                  {TIME_LABELS[time]}
                </p>
                <div className={`w-12 h-12 ${ENERGY_COLORS[level]} rounded-full mx-auto mb-2`} />
                <p className="text-xs text-neutral-textMuted">
                  {ENERGY_LABELS[level]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4">
            Principais Insights
          </h2>
          <div className="flex gap-4 items-start bg-neutral-background/50 rounded-xl p-4">
            <span className="text-2xl">💡</span>
            <p className="text-neutral-textPrimary leading-relaxed">
              {profile.insight}
            </p>
          </div>
        </div>

        {/* Characteristics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4">
            Suas Caracteristicas
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-neutral-border">
              <div className="flex items-center gap-2">
                <span className="text-xl">{CHRONOTYPE_LABELS[profile.chronotype]?.emoji || '🕐'}</span>
                <span className="text-neutral-textSecondary">Cronotipo</span>
              </div>
              <span className="font-semibold text-neutral-textPrimary">
                {CHRONOTYPE_LABELS[profile.chronotype]?.label || profile.chronotype}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-neutral-border">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                <span className="text-neutral-textSecondary">Foco ideal</span>
              </div>
              <span className="font-semibold text-neutral-textPrimary">
                {profile.focus_duration_minutes >= 60
                  ? `${Math.floor(profile.focus_duration_minutes / 60)}h${profile.focus_duration_minutes % 60 > 0 ? ` ${profile.focus_duration_minutes % 60}min` : ''}`
                  : `${profile.focus_duration_minutes} minutos`}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-neutral-border">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <span className="text-neutral-textSecondary">Estilo de execucao</span>
              </div>
              <span className="font-semibold text-neutral-textPrimary">
                {EXECUTION_LABELS[profile.execution_style]}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <span className="text-neutral-textSecondary">Melhor horario</span>
              </div>
              <span className="font-semibold text-neutral-textPrimary">
                {TIME_LABELS[profile.best_focus_time] || profile.best_focus_time}
              </span>
            </div>
          </div>
        </div>

        {/* What Helps */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4">
            O que te ajuda
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.coping_strengths.map((strength) => (
              <span
                key={strength}
                className="px-4 py-2 rounded-full bg-accent-success/20 text-accent-success font-medium text-sm"
              >
                {getLabel(strength, COPING_LABELS)}
              </span>
            ))}
          </div>
        </div>

        {/* What Distracts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4">
            O que te distrai
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.distraction_triggers.map((trigger) => (
              <span
                key={trigger}
                className="px-4 py-2 rounded-full bg-secondary-main/20 text-secondary-dark font-medium text-sm"
              >
                {getLabel(trigger, DISTRACTION_LABELS)}
              </span>
            ))}
          </div>
        </div>

        {/* Suggestion */}
        <div className="bg-secondary-light/40 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-secondary-dark mb-3">
            💡 Sugestao para voce
          </h3>
          <p className="text-neutral-textPrimary leading-relaxed">
            {profile.suggestion}
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-neutral-textSecondary mb-6">
            Pronto para comecar a usar suas novas insights?
          </p>
          <button
            onClick={handleContinue}
            className="w-full sm:w-auto px-12 py-4 rounded-xl bg-primary-main text-white font-semibold text-lg hover:bg-primary-dark transition-colors"
          >
            Ir para o Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
