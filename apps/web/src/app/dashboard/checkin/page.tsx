'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userStorage } from '@/lib/storage';

type CheckInStep = 'mood' | 'energy' | 'notes' | 'complete';

const CHECK_IN_MOODS = [
  { value: 'great', emoji: '😊', label: 'Otimo' },
  { value: 'good', emoji: '🙂', label: 'Bem' },
  { value: 'okay', emoji: '😐', label: 'Ok' },
  { value: 'low', emoji: '😔', label: 'Baixo' },
  { value: 'struggling', emoji: '😢', label: 'Dificil' },
];

const ENERGY_LEVELS = [
  { value: 1, emoji: '😴', label: 'Muito baixa' },
  { value: 2, emoji: '🥱', label: 'Baixa' },
  { value: 3, emoji: '😐', label: 'Moderada' },
  { value: 4, emoji: '⚡', label: 'Boa' },
  { value: 5, emoji: '🔥', label: 'Alta' },
];

const CHECK_IN_RESPONSES = {
  high_energy: [
    'Que bom saber que sua energia esta alta! Aproveite para tarefas mais desafiadoras.',
    'Excelente! Esse e um otimo momento para focar em algo importante.',
    'Energia alta detectada! Use esse momento a seu favor.',
  ],
  low_energy: [
    'Tudo bem ter dias assim. Que tal comecar com algo leve?',
    'Esta tudo bem descansar quando precisa. Cuide de voce.',
    'Dias de baixa energia fazem parte. Seja gentil consigo.',
  ],
  struggling: [
    'Obrigado por compartilhar. Estou aqui com voce.',
    'Reconhecer como se sente e um passo importante. Voce nao esta sozinho.',
    'Dias dificeis acontecem. Quer que eu sugira algo para ajudar?',
  ],
};

export default function CheckInPage() {
  const router = useRouter();
  const user = userStorage.get();

  const [step, setStep] = useState<CheckInStep>('mood');
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

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
    let responses: readonly string[];
    if (energy && energy >= 4) {
      responses = CHECK_IN_RESPONSES.high_energy;
    } else if (mood === 'struggling' || mood === 'low') {
      responses = CHECK_IN_RESPONSES.struggling;
    } else {
      responses = CHECK_IN_RESPONSES.low_energy;
    }
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    setResponseMessage(randomResponse);

    // Save check-in to localStorage
    const checkIns = JSON.parse(localStorage.getItem('nciaflux_checkins') || '[]');
    checkIns.push({
      id: `checkin_${Date.now()}`,
      userId: user?.id,
      mood,
      energy,
      notes,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('nciaflux_checkins', JSON.stringify(checkIns));

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

  const selectedMood = CHECK_IN_MOODS.find((m) => m.value === mood);
  const selectedEnergy = ENERGY_LEVELS.find((e) => e.value === energy);

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

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-accent-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✨</span>
            </div>

            <h2 className="text-2xl font-bold text-neutral-textPrimary mb-4">
              Check-in registrado!
            </h2>
            <p className="text-neutral-textSecondary mb-8 max-w-md mx-auto">
              {responseMessage}
            </p>

            <div className="bg-white rounded-xl p-6 shadow-sm mb-8 text-left">
              <p className="text-sm font-semibold text-neutral-textMuted mb-4">Seu check-in:</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-neutral-textSecondary">Humor:</span>
                <span className="font-semibold">
                  {selectedMood?.emoji} {selectedMood?.label}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-neutral-textSecondary">Energia:</span>
                <span className="font-semibold">
                  {selectedEnergy?.emoji} {selectedEnergy?.label}
                </span>
              </div>
              {notes.trim() && (
                <div className="pt-3 border-t border-neutral-border">
                  <span className="text-sm text-neutral-textSecondary">Notas:</span>
                  <p className="text-neutral-textPrimary mt-1">{notes}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 rounded-xl bg-primary-main text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
