'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStorageKey } from '@/lib/storage';

type QuestionType = 'single_choice' | 'multiple_choice' | 'slider';

interface QuestionOption {
  value: string;
  label: string;
  emoji?: string;
}

interface DiscoveryQuestion {
  id: string;
  order: number;
  category: string;
  question_text: string;
  question_type: QuestionType;
  options?: QuestionOption[];
  min_value?: number;
  max_value?: number;
  step?: number;
  required: boolean;
  allowOther?: boolean;
}

interface DiscoveryAnswer {
  question_id: string;
  value: string | string[] | number;
  otherText?: string;
}

const QUESTIONS: DiscoveryQuestion[] = [
  {
    id: '0',
    order: 0,
    category: 'chronotype',
    question_text: 'Qual seu padrao de sono/trabalho?',
    question_type: 'single_choice',
    options: [
      { value: 'early_bird', label: 'Cotovia - durmo cedo, acordo cedo', emoji: '🐦' },
      { value: 'normal', label: 'Normal - horarios tradicionais (dia)', emoji: '😴' },
      { value: 'night_owl', label: 'Coruja - durmo tarde, acordo tarde', emoji: '🦉' },
      { value: 'nocturnal', label: 'Noturno - trabalho de noite, durmo de dia', emoji: '🌙' },
      { value: 'shift_worker', label: 'Turnista - manha/tarde/noite/madrugada variam', emoji: '🔄' },
      { value: 'insomniac', label: 'Insone - durmo pouco, horarios erraticos', emoji: '👁️' },
      { value: 'irregular', label: 'Caotico - sem padrao definido', emoji: '🎲' },
    ],
    required: true,
  },
  {
    id: '1',
    order: 1,
    category: 'energy',
    question_text: 'Como voce geralmente se sente ao acordar?',
    question_type: 'single_choice',
    options: [
      { value: 'low', label: 'Dificil acordar, pouca energia', emoji: '😴' },
      { value: 'medium', label: 'Normal, demoro a engrenar', emoji: '😐' },
      { value: 'high', label: 'Acordo bem disposto', emoji: '⚡' },
      { value: 'poor_sleep', label: 'Dormi pouco/mal (comum)', emoji: '😫' },
      { value: 'anxious', label: 'Acordo ansioso/preocupado', emoji: '😰' },
      { value: 'varies', label: 'Varia muito de um dia pro outro', emoji: '🎲' },
      { value: 'depends_time', label: 'Depende se acordei no meu horario', emoji: '⏰' },
    ],
    required: true,
  },
  {
    id: '2',
    order: 2,
    category: 'energy',
    question_text: 'Em que periodo voce se sente mais produtivo?',
    question_type: 'single_choice',
    options: [
      { value: 'early_morning', label: 'Bem cedo (5h-9h)', emoji: '🌅' },
      { value: 'morning', label: 'Manha (9h-12h)', emoji: '☀️' },
      { value: 'afternoon', label: 'Tarde (12h-18h)', emoji: '🌤️' },
      { value: 'evening', label: 'Noite (18h-22h)', emoji: '🌙' },
      { value: 'late_night', label: 'Noite alta (22h-2h)', emoji: '🌃' },
      { value: 'dawn', label: 'Madrugada (2h-5h)', emoji: '🌌' },
      { value: 'varies', label: 'Varia muito', emoji: '🔄' },
      { value: 'no_pattern', label: 'Nao tenho padrao', emoji: '❓' },
    ],
    required: true,
  },
  {
    id: '3',
    order: 3,
    category: 'focus',
    question_text: 'Por quanto tempo voce consegue manter o foco em uma tarefa?',
    question_type: 'slider',
    min_value: 5,
    max_value: 360,
    step: 5,
    required: true,
  },
  {
    id: '4',
    order: 4,
    category: 'distraction',
    question_text: 'O que mais te distrai durante o dia?',
    question_type: 'multiple_choice',
    options: [
      { value: 'notifications', label: 'Notificacoes', emoji: '🔔' },
      { value: 'noise', label: 'Barulho', emoji: '🔊' },
      { value: 'thoughts', label: 'Pensamentos/preocupacoes', emoji: '💭' },
      { value: 'social_media', label: 'Redes sociais', emoji: '📱' },
      { value: 'hunger', label: 'Fome', emoji: '🍔' },
      { value: 'fatigue', label: 'Cansaco', emoji: '😩' },
      { value: 'anxiety', label: 'Ansiedade', emoji: '😰' },
      { value: 'people', label: 'Pessoas interrompendo', emoji: '👥' },
      { value: 'boredom', label: 'Tedio/falta de interesse', emoji: '😑' },
    ],
    required: true,
    allowOther: true,
  },
  {
    id: '5',
    order: 5,
    category: 'execution',
    question_text: 'Como voce prefere organizar suas tarefas?',
    question_type: 'single_choice',
    options: [
      { value: 'sequential', label: 'Uma de cada vez, em ordem', emoji: '1️⃣' },
      { value: 'parallel', label: 'Varias ao mesmo tempo', emoji: '🔀' },
      { value: 'burst', label: 'Tudo de uma vez quando da', emoji: '💥' },
      { value: 'mood', label: 'Depende do meu humor/energia', emoji: '🎭' },
    ],
    required: true,
  },
  {
    id: '6',
    order: 6,
    category: 'coping',
    question_text: 'O que ja te ajudou a manter o foco?',
    question_type: 'multiple_choice',
    options: [
      { value: 'lists', label: 'Listas', emoji: '📝' },
      { value: 'timers', label: 'Timers', emoji: '⏱️' },
      { value: 'music', label: 'Musica', emoji: '🎵' },
      { value: 'movement', label: 'Movimento/exercicio', emoji: '🏃' },
      { value: 'caffeine', label: 'Cafe/energetico', emoji: '☕' },
      { value: 'body_doubling', label: 'Trabalhar com alguem', emoji: '👥' },
      { value: 'rewards', label: 'Recompensas', emoji: '🎁' },
      { value: 'deadlines', label: 'Prazos/urgencia', emoji: '⏰' },
      { value: 'environment', label: 'Mudar de ambiente', emoji: '🏠' },
      { value: 'breaks', label: 'Pausas frequentes', emoji: '🧘' },
    ],
    required: true,
    allowOther: true,
  },
  {
    id: '7',
    order: 7,
    category: 'accountability',
    question_text: 'Voce funciona melhor com alguem te cobrando?',
    question_type: 'single_choice',
    options: [
      { value: 'yes', label: 'Sim, preciso de cobranca externa', emoji: '👀' },
      { value: 'no', label: 'Nao, prefiro autonomia', emoji: '🦅' },
      { value: 'sometimes', label: 'Depende da situacao', emoji: '🤔' },
    ],
    required: true,
  },
  {
    id: '8',
    order: 8,
    category: 'pressure',
    question_text: 'Como voce reage sob pressao/prazos apertados?',
    question_type: 'single_choice',
    options: [
      { value: 'thrives', label: 'Me motiva e rendo mais', emoji: '🚀' },
      { value: 'freezes', label: 'Travo e fico ansioso', emoji: '🥶' },
      { value: 'mixed', label: 'As vezes ajuda, as vezes atrapalha', emoji: '🎢' },
      { value: 'procrastinate', label: 'Procrastino ate o ultimo momento', emoji: '⏳' },
    ],
    required: true,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  chronotype: 'Cronotipo',
  energy: 'Energia',
  focus: 'Foco',
  distraction: 'Distracoes',
  execution: 'Execucao',
  coping: 'Estrategias',
  accountability: 'Responsabilidade',
  pressure: 'Pressao',
};

export default function DiscoveryPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, DiscoveryAnswer>>({});
  const [sliderValue, setSliderValue] = useState(25);
  const [isAnimating, setIsAnimating] = useState(false);
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
  const [showOtherInput, setShowOtherInput] = useState<Record<string, boolean>>({});

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const isLastQuestion = currentIndex === QUESTIONS.length - 1;
  const currentAnswer = answers[currentQuestion.id];

  const canProceed =
    currentAnswer !== undefined ||
    (currentQuestion.question_type === 'slider' && sliderValue > 0);

  function handleSelect(value: string) {
    if (currentQuestion.question_type === 'single_choice') {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { question_id: currentQuestion.id, value },
      }));
    } else if (currentQuestion.question_type === 'multiple_choice') {
      const current = (currentAnswer?.value as string[]) || [];
      const newValue = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { question_id: currentQuestion.id, value: newValue },
      }));
    }
  }

  function handleToggleOther() {
    const questionId = currentQuestion.id;
    const isShowing = !showOtherInput[questionId];
    setShowOtherInput((prev) => ({ ...prev, [questionId]: isShowing }));

    if (!isShowing) {
      // If hiding, remove "other" from answers
      if (currentQuestion.question_type === 'multiple_choice') {
        const current = (currentAnswer?.value as string[]) || [];
        const newValue = current.filter((v) => !v.startsWith('other:'));
        setAnswers((prev) => ({
          ...prev,
          [questionId]: { question_id: questionId, value: newValue },
        }));
      }
      setOtherTexts((prev) => ({ ...prev, [questionId]: '' }));
    }
  }

  function handleOtherTextChange(text: string) {
    const questionId = currentQuestion.id;
    setOtherTexts((prev) => ({ ...prev, [questionId]: text }));

    if (currentQuestion.question_type === 'multiple_choice') {
      const current = (currentAnswer?.value as string[]) || [];
      const filtered = current.filter((v) => !v.startsWith('other:'));
      const newValue = text.trim() ? [...filtered, `other:${text}`] : filtered;
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { question_id: questionId, value: newValue, otherText: text },
      }));
    }
  }

  function isSelected(value: string): boolean {
    if (!currentAnswer) return false;

    if (Array.isArray(currentAnswer.value)) {
      return currentAnswer.value.includes(value);
    }

    return currentAnswer.value === value;
  }

  function animateTransition(callback: () => void) {
    setIsAnimating(true);
    setTimeout(() => {
      callback();
      setIsAnimating(false);
    }, 200);
  }

  function handleNext() {
    // Save slider value if needed
    if (currentQuestion.question_type === 'slider') {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { question_id: currentQuestion.id, value: sliderValue },
      }));
    }

    if (isLastQuestion) {
      // Save answers to localStorage
      const finalAnswers = {
        ...answers,
        [currentQuestion.id]: currentQuestion.question_type === 'slider'
          ? { question_id: currentQuestion.id, value: sliderValue }
          : answers[currentQuestion.id],
      };

      localStorage.setItem(getStorageKey('nciaflux_discovery_answers'), JSON.stringify(finalAnswers));

      // Navigate to results
      router.push('/dashboard/discovery/result');
    } else {
      animateTransition(() => setCurrentIndex((prev) => prev + 1));
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      animateTransition(() => setCurrentIndex((prev) => prev - 1));
    } else {
      router.back();
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-primary-main/5 to-secondary-main/5 p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-neutral-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-main rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-neutral-textMuted text-right mt-2">
            {currentIndex + 1} de {QUESTIONS.length}
          </p>
        </div>

        {/* Question Content */}
        <div className={`transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <span className="inline-block px-3 py-1 rounded-full bg-secondary-main/20 text-secondary-dark text-sm font-medium mb-4">
              {CATEGORY_LABELS[currentQuestion.category]}
            </span>

            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary mb-8">
              {currentQuestion.question_text}
            </h2>

            {/* Slider Question */}
            {currentQuestion.question_type === 'slider' && (
              <div className="py-8">
                <input
                  type="range"
                  min={currentQuestion.min_value || 5}
                  max={currentQuestion.max_value || 360}
                  step={currentQuestion.step || 5}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-3 bg-neutral-border rounded-full appearance-none cursor-pointer accent-primary-main"
                />
                <p className="text-5xl font-bold text-primary-main text-center mt-6">
                  {sliderValue >= 60
                    ? `${Math.floor(sliderValue / 60)}h${sliderValue % 60 > 0 ? ` ${sliderValue % 60}min` : ''}`
                    : `${sliderValue} minutos`}
                </p>
                <p className="text-sm text-neutral-textMuted text-center mt-2">
                  {sliderValue >= 120 ? '🔥 Hiperfoco!' : sliderValue <= 15 ? '⚡ Sprints rapidos' : ''}
                </p>
                <div className="flex justify-between mt-4">
                  <span className="text-sm text-neutral-textMuted">5 min</span>
                  <span className="text-sm text-neutral-textMuted">6h</span>
                </div>
              </div>
            )}

            {/* Choice Questions */}
            {(currentQuestion.question_type === 'single_choice' ||
              currentQuestion.question_type === 'multiple_choice') && (
              <div className="space-y-3">
                {currentQuestion.question_type === 'multiple_choice' && (
                  <p className="text-sm text-neutral-textMuted italic mb-4">
                    Selecione todas que se aplicam
                  </p>
                )}
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected(option.value)
                        ? 'border-primary-main bg-primary-main/10'
                        : 'border-neutral-border bg-white hover:border-neutral-textMuted'
                    }`}
                  >
                    {option.emoji && <span className="text-2xl">{option.emoji}</span>}
                    <span className={`flex-1 font-medium ${
                      isSelected(option.value) ? 'text-primary-main' : 'text-neutral-textPrimary'
                    }`}>
                      {option.label}
                    </span>
                    {isSelected(option.value) && (
                      <span className="text-primary-main font-bold">✓</span>
                    )}
                  </button>
                ))}

                {/* Other option */}
                {currentQuestion.allowOther && (
                  <div className="mt-4">
                    <button
                      onClick={handleToggleOther}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        showOtherInput[currentQuestion.id]
                          ? 'border-primary-main bg-primary-main/10'
                          : 'border-neutral-border bg-white hover:border-neutral-textMuted'
                      }`}
                    >
                      <span className="text-2xl">✏️</span>
                      <span className={`flex-1 font-medium ${
                        showOtherInput[currentQuestion.id] ? 'text-primary-main' : 'text-neutral-textPrimary'
                      }`}>
                        Outro...
                      </span>
                      {showOtherInput[currentQuestion.id] && (
                        <span className="text-primary-main font-bold">✓</span>
                      )}
                    </button>

                    {showOtherInput[currentQuestion.id] && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="Digite aqui..."
                          value={otherTexts[currentQuestion.id] || ''}
                          onChange={(e) => handleOtherTextChange(e.target.value)}
                          className="w-full p-4 rounded-xl border-2 border-primary-main/30 bg-white text-neutral-textPrimary placeholder-neutral-textMuted focus:outline-none focus:border-primary-main"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrev}
            className="px-6 py-3 text-neutral-textSecondary hover:text-neutral-textPrimary transition-colors"
          >
            ← Voltar
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              canProceed
                ? 'bg-primary-main text-white hover:bg-primary-dark'
                : 'bg-neutral-border text-neutral-textMuted cursor-not-allowed'
            }`}
          >
            {isLastQuestion ? 'Ver resultado' : 'Proxima'}
          </button>
        </div>
      </div>
    </div>
  );
}
