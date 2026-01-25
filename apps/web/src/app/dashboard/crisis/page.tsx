'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type CrisisStep = 'initial' | 'breathing' | 'grounding' | 'action' | 'game_bubbles' | 'game_colors' | 'game_clicks' | 'game_breathing' | 'complete';

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

const MINI_GAMES = [
  { id: 'game_breathing', label: 'Respiracao Interativa', emoji: '🫧', description: 'Siga a bolha respirando' },
  { id: 'game_bubbles', label: 'Estourar Bolhas', emoji: '🎈', description: 'Clique nas bolhas coloridas' },
  { id: 'game_colors', label: 'Sequencia de Cores', emoji: '🎨', description: 'Toque nas cores em ordem' },
  { id: 'game_clicks', label: 'Descarga de Energia', emoji: '⚡', description: 'Clique rapido para descarregar' },
];

interface Bubble {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

const BUBBLE_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

export default function CrisisPage() {
  const router = useRouter();
  const [step, setStep] = useState<CrisisStep>('initial');
  const [breathingIndex, setBreathingIndex] = useState(0);
  const [breathingCount, setBreathingCount] = useState(0);
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [isBreathing, setIsBreathing] = useState(false);
  const [groundingIndex, setGroundingIndex] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Game states
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [bubblesPopped, setBubblesPopped] = useState(0);
  const [colorSequence, setColorSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [colorLevel, setColorLevel] = useState(1);
  const [showingSequence, setShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [clickTarget] = useState(50);
  const [breathingBubbleSize, setBreathingBubbleSize] = useState(100);
  const [breathingPhase, setBreathingPhase] = useState<'inspire' | 'hold' | 'expire'>('inspire');

  // Bubble game
  const spawnBubble = useCallback(() => {
    const newBubble: Bubble = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      size: Math.random() * 30 + 40,
    };
    setBubbles(prev => [...prev.slice(-10), newBubble]);
  }, []);

  useEffect(() => {
    if (step === 'game_bubbles') {
      const interval = setInterval(spawnBubble, 800);
      return () => clearInterval(interval);
    }
  }, [step, spawnBubble]);

  function popBubble(id: number) {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setBubblesPopped(prev => prev + 1);
  }

  // Color sequence game
  const GAME_COLORS = ['#FF6B6B', '#4ECDC4', '#FFEAA7', '#45B7D1'];

  function startColorGame() {
    const newSequence = Array.from({ length: colorLevel + 2 }, () =>
      GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)]
    );
    setColorSequence(newSequence);
    setUserSequence([]);
    setShowingSequence(true);

    // Show sequence
    newSequence.forEach((color, index) => {
      setTimeout(() => {
        setActiveColor(color);
        setTimeout(() => setActiveColor(null), 400);
      }, index * 700);
    });

    setTimeout(() => {
      setShowingSequence(false);
    }, newSequence.length * 700 + 500);
  }

  useEffect(() => {
    if (step === 'game_colors') {
      startColorGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function handleColorClick(color: string) {
    if (showingSequence) return;

    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 200);

    // Check if correct
    const currentIndex = newUserSequence.length - 1;
    if (colorSequence[currentIndex] !== color) {
      // Wrong - restart level
      setTimeout(() => startColorGame(), 500);
      return;
    }

    // Check if complete
    if (newUserSequence.length === colorSequence.length) {
      setColorLevel(prev => prev + 1);
      setTimeout(() => startColorGame(), 1000);
    }
  }

  // Click game
  function handleRapidClick() {
    setClickCount(prev => {
      if (prev + 1 >= clickTarget) {
        setTimeout(() => setStep('complete'), 500);
      }
      return prev + 1;
    });
  }

  // Interactive breathing game
  useEffect(() => {
    if (step === 'game_breathing') {
      let phase: 'inspire' | 'hold' | 'expire' = 'inspire';
      let size = 100;

      const interval = setInterval(() => {
        if (phase === 'inspire') {
          size += 2;
          if (size >= 200) {
            phase = 'hold';
            setTimeout(() => {
              phase = 'expire';
              setBreathingPhase('expire');
            }, 2000);
          }
        } else if (phase === 'expire') {
          size -= 2;
          if (size <= 100) {
            phase = 'inspire';
            setBreathingPhase('inspire');
          }
        }
        setBreathingBubbleSize(size);
        setBreathingPhase(phase);
      }, 50);

      return () => clearInterval(interval);
    }
  }, [step]);

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
    const events = JSON.parse(localStorage.getItem('nciaflux_crisis_events') || '[]');
    events.push({
      id: `crisis_${Date.now()}`,
      action: selectedAction,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('nciaflux_crisis_events', JSON.stringify(events));
    router.push('/dashboard');
  }

  function goToGame(gameId: string) {
    setStep(gameId as CrisisStep);
    // Reset game states
    setBubbles([]);
    setBubblesPopped(0);
    setColorLevel(1);
    setUserSequence([]);
    setClickCount(0);
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-primary-main/5 to-secondary-main/5 p-6 lg:p-8">
      <div className="max-w-lg mx-auto">
        {/* Initial State */}
        {step === 'initial' && (
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-primary-main/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🫂</span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-textPrimary mb-4">
              Estou aqui com voce
            </h1>
            <p className="text-lg text-neutral-textSecondary mb-8 max-w-md mx-auto">
              Vamos fazer isso juntos. Escolha o que te ajuda agora.
            </p>

            {/* Exercicios */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-neutral-textMuted uppercase tracking-wider mb-3">
                Exercicios
              </h2>
              <div className="space-y-3">
                <button
                  onClick={startBreathing}
                  className="w-full py-4 rounded-xl bg-primary-main text-white font-semibold text-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-3"
                >
                  <span>🫁</span> Respiracao guiada
                </button>
                <button
                  onClick={() => setStep('grounding')}
                  className="w-full py-4 rounded-xl bg-white border border-neutral-border text-neutral-textPrimary font-semibold hover:bg-neutral-background transition-colors flex items-center justify-center gap-3"
                >
                  <span>👁️</span> Ancoragem (5-4-3-2-1)
                </button>
              </div>
            </div>

            {/* Mini Games */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-neutral-textMuted uppercase tracking-wider mb-3">
                Joguinhos para Acalmar
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {MINI_GAMES.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => goToGame(game.id)}
                    className="p-4 rounded-xl bg-white border border-neutral-border hover:border-primary-main hover:shadow-md transition-all text-center"
                  >
                    <span className="text-3xl block mb-2">{game.emoji}</span>
                    <span className="font-medium text-neutral-textPrimary text-sm block">
                      {game.label}
                    </span>
                    <span className="text-xs text-neutral-textMuted">
                      {game.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => setStep('action')}
              className="w-full py-3 rounded-xl text-neutral-textSecondary font-medium hover:text-neutral-textPrimary transition-colors"
            >
              Escolher uma acao rapida →
            </button>

            <p className="text-sm text-neutral-textMuted mt-6">
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
            <button
              onClick={() => setStep('initial')}
              className="text-neutral-textSecondary hover:text-neutral-textPrimary mb-4 flex items-center gap-1"
            >
              ← Voltar
            </button>

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

        {/* GAME: Interactive Breathing */}
        {step === 'game_breathing' && (
          <div className="py-8">
            <button
              onClick={() => setStep('initial')}
              className="text-neutral-textSecondary hover:text-neutral-textPrimary mb-4 flex items-center gap-1"
            >
              ← Voltar
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-textPrimary mb-2">
                Siga a Bolha
              </h2>
              <p className="text-neutral-textSecondary mb-8">
                {breathingPhase === 'inspire' ? 'Inspire enquanto cresce...' :
                 breathingPhase === 'hold' ? 'Segure...' : 'Expire enquanto diminui...'}
              </p>

              <div className="flex items-center justify-center h-64">
                <div
                  className="rounded-full bg-gradient-to-br from-primary-main/60 to-secondary-main/60 transition-all duration-100 flex items-center justify-center"
                  style={{ width: breathingBubbleSize, height: breathingBubbleSize }}
                >
                  <span className="text-4xl">
                    {breathingPhase === 'inspire' ? '🫁' : breathingPhase === 'hold' ? '⏸️' : '💨'}
                  </span>
                </div>
              </div>

              <p className="text-lg font-semibold text-primary-main mt-4">
                {breathingPhase === 'inspire' ? 'INSPIRE' :
                 breathingPhase === 'hold' ? 'SEGURE' : 'EXPIRE'}
              </p>
            </div>
          </div>
        )}

        {/* GAME: Pop Bubbles */}
        {step === 'game_bubbles' && (
          <div className="py-8">
            <button
              onClick={() => setStep('initial')}
              className="text-neutral-textSecondary hover:text-neutral-textPrimary mb-4 flex items-center gap-1"
            >
              ← Voltar
            </button>

            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-neutral-textPrimary mb-2">
                Estoure as Bolhas!
              </h2>
              <p className="text-3xl font-bold text-primary-main">
                {bubblesPopped} 🎈
              </p>
            </div>

            <div className="relative bg-gradient-to-b from-blue-100 to-purple-100 rounded-2xl h-80 overflow-hidden">
              {bubbles.map((bubble) => (
                <button
                  key={bubble.id}
                  onClick={() => popBubble(bubble.id)}
                  className="absolute rounded-full transition-transform hover:scale-110 active:scale-90 cursor-pointer animate-bounce"
                  style={{
                    left: `${bubble.x}%`,
                    top: `${bubble.y}%`,
                    width: bubble.size,
                    height: bubble.size,
                    backgroundColor: bubble.color,
                    opacity: 0.8,
                  }}
                />
              ))}
              {bubbles.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-textMuted">
                  As bolhas estao aparecendo...
                </div>
              )}
            </div>

            {bubblesPopped >= 20 && (
              <button
                onClick={() => setStep('complete')}
                className="w-full mt-6 py-4 rounded-xl bg-primary-main text-white font-semibold hover:bg-primary-dark transition-colors"
              >
                Continuar ({bubblesPopped} bolhas!)
              </button>
            )}
          </div>
        )}

        {/* GAME: Color Sequence */}
        {step === 'game_colors' && (
          <div className="py-8">
            <button
              onClick={() => setStep('initial')}
              className="text-neutral-textSecondary hover:text-neutral-textPrimary mb-4 flex items-center gap-1"
            >
              ← Voltar
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-textPrimary mb-2">
                Repita a Sequencia
              </h2>
              <p className="text-neutral-textSecondary">
                {showingSequence ? 'Observe...' : 'Sua vez! Toque nas cores'}
              </p>
              <p className="text-lg font-bold text-primary-main mt-2">
                Nivel {colorLevel}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              {GAME_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorClick(color)}
                  disabled={showingSequence}
                  className={`h-24 rounded-2xl transition-all ${
                    activeColor === color ? 'scale-110 ring-4 ring-white' : 'scale-100'
                  } ${showingSequence ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                  style={{ backgroundColor: color, opacity: activeColor === color ? 1 : 0.7 }}
                />
              ))}
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {colorSequence.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < userSequence.length ? 'bg-primary-main' : 'bg-neutral-border'
                  }`}
                />
              ))}
            </div>

            {colorLevel > 3 && (
              <button
                onClick={() => setStep('complete')}
                className="w-full mt-6 py-4 rounded-xl bg-primary-main text-white font-semibold hover:bg-primary-dark transition-colors"
              >
                Parabens! Continuar
              </button>
            )}
          </div>
        )}

        {/* GAME: Rapid Clicks */}
        {step === 'game_clicks' && (
          <div className="py-8">
            <button
              onClick={() => setStep('initial')}
              className="text-neutral-textSecondary hover:text-neutral-textPrimary mb-4 flex items-center gap-1"
            >
              ← Voltar
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-textPrimary mb-2">
                Descarga de Energia
              </h2>
              <p className="text-neutral-textSecondary mb-4">
                Clique rapido para liberar a tensao!
              </p>

              <div className="mb-6">
                <div className="h-4 bg-neutral-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-main to-accent-success rounded-full transition-all"
                    style={{ width: `${(clickCount / clickTarget) * 100}%` }}
                  />
                </div>
                <p className="text-lg font-bold text-primary-main mt-2">
                  {clickCount} / {clickTarget}
                </p>
              </div>

              <button
                onClick={handleRapidClick}
                className="w-48 h-48 rounded-full bg-gradient-to-br from-primary-main to-secondary-main text-white text-6xl font-bold hover:scale-105 active:scale-95 transition-transform shadow-lg mx-auto flex items-center justify-center"
              >
                ⚡
              </button>

              <p className="text-sm text-neutral-textMuted mt-6">
                {clickCount < 20 ? 'Continue clicando!' :
                 clickCount < 40 ? 'Isso! Mais um pouco!' :
                 'Quase la!'}
              </p>
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

            <button
              onClick={() => setStep('initial')}
              className="w-full py-3 mt-3 text-neutral-textSecondary hover:text-neutral-textPrimary transition-colors"
            >
              Fazer mais exercicios
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
