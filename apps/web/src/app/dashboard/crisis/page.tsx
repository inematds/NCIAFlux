'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CrisisStep = 'initial' | 'breathing' | 'grounding' | 'action' | 'complete';

const BREATHING_STEPS = [
  { phase: 'Inspire', duration: 4, emoji: '🫁' },
  { phase: 'Segure', duration: 4, emoji: '⏸️' },
  { phase: 'Expire', duration: 4, emoji: '💨' },
  { phase: 'Segure', duration: 4, emoji: '⏸️' },
];

const GROUNDING_PROMPTS = [
  { sense: '5 coisas que voce VE', emoji: '👁️', examples: 'uma cadeira, a tela, suas maos...' },
  { sense: '4 coisas que voce TOCA', emoji: '✋', examples: 'o teclado, sua roupa, a mesa...' },
  { sense: '3 coisas que voce OUVE', emoji: '👂', examples: 'o ventilador, carros, passaros...' },
  { sense: '2 coisas que voce CHEIRA', emoji: '👃', examples: 'cafe, ar fresco, comida...' },
  { sense: '1 coisa que voce SABOREIA', emoji: '👅', examples: 'agua, cafe, chiclete...' },
];

const QUICK_ACTIONS = [
  { id: 'water', label: 'Beber agua', emoji: '💧' },
  { id: 'walk', label: 'Dar uma volta', emoji: '🚶' },
  { id: 'music', label: 'Ouvir musica calma', emoji: '🎵' },
  { id: 'rest', label: 'Deitar 5 min', emoji: '🛋️' },
  { id: 'talk', label: 'Falar com alguem', emoji: '💬' },
  { id: 'outside', label: 'Ir la fora', emoji: '🌳' },
];

export default function CrisisPage() {
  const router = useRouter();
  const [step, setStep] = useState<CrisisStep>('initial');
  const [breathingIndex, setBreathingIndex] = useState(0);
  const [breathingCount, setBreathingCount] = useState(0);
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [isBreathing, setIsBreathing] = useState(false);
  const [groundingIndex, setGroundingIndex] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  function startBreathing() {
    setStep('breathing');
    setIsBreathing(true);
    runBreathingCycle();
  }

  function runBreathingCycle() {
    let currentIndex = 0;
    let cycles = 0;
    const maxCycles = 3;

    const interval = setInterval(() => {
      setBreathingTimer((prev) => {
        if (prev <= 1) {
          currentIndex = (currentIndex + 1) % 4;
          setBreathingIndex(currentIndex);

          if (currentIndex === 0) {
            cycles++;
            setBreathingCount(cycles);
            if (cycles >= maxCycles) {
              clearInterval(interval);
              setIsBreathing(false);
              setTimeout(() => setStep('grounding'), 1000);
            }
          }
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }

  function handleGroundingNext() {
    if (groundingIndex < GROUNDING_PROMPTS.length - 1) {
      setGroundingIndex((prev) => prev + 1);
    } else {
      setStep('action');
    }
  }

  function handleActionSelect(actionId: string) {
    setSelectedAction(actionId);
    setTimeout(() => setStep('complete'), 500);
  }

  function handleComplete() {
    // Save crisis event
    const events = JSON.parse(localStorage.getItem('nciaflux_crisis_events') || '[]');
    events.push({
      id: `crisis_${Date.now()}`,
      action: selectedAction,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('nciaflux_crisis_events', JSON.stringify(events));
    router.push('/dashboard');
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-primary-main/5 to-secondary-main/5 p-6 lg:p-8">
      <div className="max-w-lg mx-auto">
        {/* Initial State */}
        {step === 'initial' && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-primary-main/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🫂</span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-textPrimary mb-4">
              Estou aqui com voce
            </h1>
            <p className="text-lg text-neutral-textSecondary mb-8 max-w-md mx-auto">
              Parece que voce esta passando por um momento dificil.
              Vamos fazer isso juntos, um passo de cada vez.
            </p>

            <div className="space-y-4">
              <button
                onClick={startBreathing}
                className="w-full py-4 rounded-xl bg-primary-main text-white font-semibold text-lg hover:bg-primary-dark transition-colors"
              >
                Comecar exercicio de respiracao
              </button>
              <button
                onClick={() => setStep('grounding')}
                className="w-full py-4 rounded-xl bg-white border border-neutral-border text-neutral-textPrimary font-semibold hover:bg-neutral-background transition-colors"
              >
                Ir para ancoragem (grounding)
              </button>
              <button
                onClick={() => setStep('action')}
                className="w-full py-4 rounded-xl text-neutral-textSecondary font-medium hover:text-neutral-textPrimary transition-colors"
              >
                Escolher uma acao rapida
              </button>
            </div>

            <p className="text-sm text-neutral-textMuted mt-8">
              Lembre-se: isso vai passar. Voce ja superou momentos dificeis antes.
            </p>
          </div>
        )}

        {/* Breathing Exercise */}
        {step === 'breathing' && (
          <div className="text-center py-12">
            <p className="text-neutral-textSecondary mb-4">
              Ciclo {breathingCount + 1} de 3
            </p>

            <div className={`w-48 h-48 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-1000 ${
              breathingIndex === 0 ? 'bg-primary-main/30 scale-110' :
              breathingIndex === 2 ? 'bg-primary-main/10 scale-90' :
              'bg-primary-main/20 scale-100'
            }`}>
              <div className="text-center">
                <span className="text-5xl block mb-2">
                  {BREATHING_STEPS[breathingIndex].emoji}
                </span>
                <span className="text-2xl font-bold text-primary-main">
                  {BREATHING_STEPS[breathingIndex].phase}
                </span>
              </div>
            </div>

            <p className="text-6xl font-bold text-neutral-textPrimary mb-8">
              {breathingTimer}
            </p>

            <p className="text-neutral-textSecondary">
              Siga o ritmo... inspire pelo nariz, expire pela boca
            </p>

            {!isBreathing && (
              <button
                onClick={() => setStep('grounding')}
                className="mt-8 px-8 py-3 rounded-xl bg-primary-main text-white font-semibold hover:bg-primary-dark transition-colors"
              >
                Continuar
              </button>
            )}
          </div>
        )}

        {/* Grounding Exercise */}
        {step === 'grounding' && (
          <div className="py-8">
            <div className="text-center mb-8">
              <p className="text-sm text-neutral-textMuted mb-2">
                Passo {groundingIndex + 1} de {GROUNDING_PROMPTS.length}
              </p>
              <div className="h-2 bg-neutral-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-main rounded-full transition-all"
                  style={{ width: `${((groundingIndex + 1) / GROUNDING_PROMPTS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <span className="text-6xl block mb-4">
                {GROUNDING_PROMPTS[groundingIndex].emoji}
              </span>
              <h2 className="text-2xl font-bold text-neutral-textPrimary mb-2">
                {GROUNDING_PROMPTS[groundingIndex].sense}
              </h2>
              <p className="text-neutral-textSecondary mb-8">
                Exemplo: {GROUNDING_PROMPTS[groundingIndex].examples}
              </p>

              <button
                onClick={handleGroundingNext}
                className="w-full py-4 rounded-xl bg-primary-main text-white font-semibold hover:bg-primary-dark transition-colors"
              >
                {groundingIndex < GROUNDING_PROMPTS.length - 1 ? 'Proximo' : 'Continuar'}
              </button>
            </div>

            <p className="text-center text-sm text-neutral-textMuted mt-6">
              Nao precisa listar em voz alta, apenas observe ao seu redor.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        {step === 'action' && (
          <div className="py-8">
            <div className="text-center mb-8">
              <span className="text-5xl block mb-4">💪</span>
              <h2 className="text-2xl font-bold text-neutral-textPrimary mb-2">
                Escolha uma acao
              </h2>
              <p className="text-neutral-textSecondary">
                Algo pequeno que pode ajudar agora
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionSelect(action.id)}
                  className={`p-5 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                    selectedAction === action.id
                      ? 'border-primary-main bg-primary-main/10'
                      : 'border-transparent bg-white shadow-sm'
                  }`}
                >
                  <span className="text-3xl block mb-2">{action.emoji}</span>
                  <span className="font-medium text-neutral-textPrimary">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-accent-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✨</span>
            </div>
            <h2 className="text-3xl font-bold text-neutral-textPrimary mb-4">
              Voce conseguiu!
            </h2>
            <p className="text-lg text-neutral-textSecondary mb-8 max-w-md mx-auto">
              Obrigado por cuidar de voce. Cada pequeno passo conta.
              Estou aqui sempre que precisar.
            </p>

            <button
              onClick={handleComplete}
              className="w-full py-4 rounded-xl bg-primary-main text-white font-semibold text-lg hover:bg-primary-dark transition-colors"
            >
              Voltar ao Dashboard
            </button>

            <div className="mt-8 bg-secondary-main/10 rounded-xl p-6 text-left">
              <h3 className="font-semibold text-neutral-textPrimary mb-3">
                Recursos de apoio:
              </h3>
              <ul className="space-y-2 text-sm text-neutral-textSecondary">
                <li>• CVV (188) - Centro de Valorizacao da Vida</li>
                <li>• CAPS - Centro de Atencao Psicossocial</li>
                <li>• Seu profissional de saude mental</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
