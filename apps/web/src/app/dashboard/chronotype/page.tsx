'use client';

import { useState, useEffect } from 'react';
import { getStorageKey } from '@/lib/storage';

type Chronotype = 'bear' | 'dolphin' | 'owl' | 'lion' | null;

interface ChronotypeInfo {
  id: Chronotype;
  name: string;
  emoji: string;
  description: string;
  strengths: string[];
  challenges: string[];
  bestFocusTime: string;
  routine: {
    morning: string[];
    afternoon: string[];
    evening: string[];
  };
}

const CHRONOTYPES: Record<string, ChronotypeInfo> = {
  bear: {
    id: 'bear',
    name: 'Urso',
    emoji: '🐻',
    description: 'Segue o ritmo solar. Produtivo no meio da manha, energia estavel ao longo do dia.',
    strengths: ['Rotina consistente', 'Bom em trabalho colaborativo', 'Energia estavel'],
    challenges: ['Dificuldade com mudancas de horario', 'Sonolencia pos-almoco'],
    bestFocusTime: '10h - 14h',
    routine: {
      morning: ['7h - Acordar naturalmente', '7h30 - Exercicio leve ou alongamento', '8h - Cafe da manha nutritivo', '8h30 - Meditacao 10min', '9h - Revisar metas do dia'],
      afternoon: ['10h-14h - Trabalho profundo (pico de energia)', '12h30 - Almoco', '14h - Pausa para caminhar', '15h-17h - Tarefas mais leves'],
      evening: ['18h - Encerrar trabalho', '19h - Exercicio ou hobby', '20h - Jantar', '21h - Tempo de qualidade', '22h30 - Preparar para dormir', '23h - Dormir'],
    },
  },
  dolphin: {
    id: 'dolphin',
    name: 'Golfinho',
    emoji: '🐬',
    description: 'Sono leve, mente sempre ativa. Precisa de estrutura rigida para funcionar bem.',
    strengths: ['Alta inteligencia', 'Atencao aos detalhes', 'Perfeccionista'],
    challenges: ['Insonia frequente', 'Ansiedade', 'Dificuldade de relaxar'],
    bestFocusTime: '10h - 12h e 16h - 18h',
    routine: {
      morning: ['6h30 - Acordar (mesmo sem vontade)', '7h - Exercicio intenso (queimar energia)', '7h45 - Banho frio', '8h - Cafe da manha leve', '8h30 - Lista de tarefas RIGOROSA'],
      afternoon: ['10h-12h - Trabalho profundo #1', '12h - Almoco leve', '13h - Caminhada ou descanso ativo', '14h-15h30 - Tarefas administrativas', '16h-18h - Trabalho profundo #2'],
      evening: ['18h30 - Exercicio leve (yoga)', '19h30 - Jantar', '20h - Atividade relaxante (sem telas)', '21h - Preparar amanha', '22h - Ritual de sono (obrigatorio)', '23h - Dormir (mesmo sem sono)'],
    },
  },
  owl: {
    id: 'owl',
    name: 'Coruja',
    emoji: '🦉',
    description: 'Noturno por natureza. Criatividade a noite, manha dificil.',
    strengths: ['Alta criatividade', 'Pensamento profundo', 'Foco intenso a noite'],
    challenges: ['Manha muito dificil', 'Conflito com horarios sociais', 'Energia irregular'],
    bestFocusTime: '17h - 21h e 22h - 2h',
    routine: {
      morning: ['9h - Acordar (sem culpa)', '9h30 - Luz solar + agua', '10h - Cafe da manha', '10h30 - Brain dump (despejar ideias)', '11h - Check-in: como estou?'],
      afternoon: ['11h30-13h - Tarefas administrativas', '13h - Almoco', '14h - Descanso/cochilo permitido', '15h - Tarefas leves', '16h - Preparar para pico criativo'],
      evening: ['17h-21h - TRABALHO PROFUNDO (seu melhor horario)', '21h - Jantar', '22h - Trabalho criativo ou estudo', '24h - Definir top 1 de amanha', '1h - Ritual de sono', '2h - Dormir'],
    },
  },
  lion: {
    id: 'lion',
    name: 'Leao',
    emoji: '🦁',
    description: 'Madrugador natural. Maximo de energia bem cedo, cansa a noite.',
    strengths: ['Alta produtividade matinal', 'Disciplina natural', 'Otimismo'],
    challenges: ['Cansa cedo', 'Dificuldade com eventos noturnos', 'Pode ser impaciente'],
    bestFocusTime: '5h - 9h e 10h - 12h',
    routine: {
      morning: ['5h - Acordar energizado', '5h15 - Hidratacao + movimento', '5h30 - Exercicio intenso', '6h30 - Banho + cafe da manha', '7h - TRABALHO MAIS DIFICIL DO DIA', '7h-9h - Foco total (seu pico)'],
      afternoon: ['9h-12h - Continuar trabalho profundo', '12h - Almoco', '13h - Tarefas que exigem menos foco', '14h-16h - Reunioes, colaboracao', '17h - Encerrar trabalho'],
      evening: ['17h30 - Exercicio leve', '18h30 - Jantar', '19h - Tempo com familia/amigos', '20h - Atividades relaxantes', '21h - Preparar amanha', '21h30 - Dormir (obrigatorio!)'],
    },
  },
};

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Em que horario voce naturalmente acorda (sem despertador)?',
    options: [
      { value: 'lion', label: 'Antes das 6h', emoji: '🌅' },
      { value: 'bear', label: 'Entre 6h e 8h', emoji: '☀️' },
      { value: 'owl', label: 'Entre 8h e 10h', emoji: '🌤️' },
      { value: 'dolphin', label: 'Varia muito / tenho insonia', emoji: '🌙' },
    ],
  },
  {
    id: 2,
    question: 'Quando voce se sente mais produtivo e criativo?',
    options: [
      { value: 'lion', label: 'Bem cedo, antes de todos', emoji: '🦁' },
      { value: 'bear', label: 'Meio da manha ate comeco da tarde', emoji: '🐻' },
      { value: 'owl', label: 'Final da tarde e noite', emoji: '🦉' },
      { value: 'dolphin', label: 'Em rajadas curtas, sem padrao', emoji: '🐬' },
    ],
  },
  {
    id: 3,
    question: 'Como e seu sono?',
    options: [
      { value: 'lion', label: 'Durmo cedo e acordo cedo, sono profundo', emoji: '😴' },
      { value: 'bear', label: 'Durmo e acordo em horarios "normais"', emoji: '💤' },
      { value: 'owl', label: 'Durmo tarde e acordo tarde', emoji: '🌃' },
      { value: 'dolphin', label: 'Sono leve, acordo varias vezes', emoji: '😰' },
    ],
  },
  {
    id: 4,
    question: 'Se pudesse escolher, que horario trabalharia?',
    options: [
      { value: 'lion', label: '5h as 13h', emoji: '🌄' },
      { value: 'bear', label: '9h as 17h', emoji: '🏢' },
      { value: 'owl', label: '14h as 22h', emoji: '🌆' },
      { value: 'dolphin', label: 'Horarios flexiveis, em blocos', emoji: '🔄' },
    ],
  },
  {
    id: 5,
    question: 'Como voce se sente as 22h?',
    options: [
      { value: 'lion', label: 'Muito cansado, pronto para dormir', emoji: '😪' },
      { value: 'bear', label: 'Relaxando, pronto para descansar', emoji: '🛋️' },
      { value: 'owl', label: 'Energizado, e quando rendo mais!', emoji: '⚡' },
      { value: 'dolphin', label: 'Ansioso, mente ainda acelerada', emoji: '🧠' },
    ],
  },
];

export default function ChronotypePage() {
  const [currentChronotype, setCurrentChronotype] = useState<Chronotype>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedRoutineTab, setSelectedRoutineTab] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey('nciaflux_chronotype'));
    if (saved) {
      setCurrentChronotype(saved as Chronotype);
    }
  }, []);

  function handleAnswer(value: string) {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate result
      const counts: Record<string, number> = {};
      newAnswers.forEach(a => {
        counts[a] = (counts[a] || 0) + 1;
      });

      const result = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Chronotype;
      setCurrentChronotype(result);
      if (result) {
        localStorage.setItem(getStorageKey('nciaflux_chronotype'), result);
      }
      setShowQuiz(false);
    }
  }

  function resetQuiz() {
    setShowQuiz(true);
    setQuizStep(0);
    setAnswers([]);
  }

  function selectChronotype(type: Chronotype) {
    setCurrentChronotype(type);
    if (type) {
      localStorage.setItem(getStorageKey('nciaflux_chronotype'), type);
    }
  }

  const chronotypeInfo = currentChronotype ? CHRONOTYPES[currentChronotype] : null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
          Cronotipo
        </h1>
        <p className="text-neutral-textSecondary mt-1">
          Descubra seu ritmo biologico e otimize sua rotina
        </p>
      </div>

      {!showQuiz && !currentChronotype && (
        /* Initial State - Choose or Quiz */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-main/10 to-secondary-main/10 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold text-neutral-textPrimary mb-2">
              Qual e o seu cronotipo?
            </h2>
            <p className="text-neutral-textSecondary mb-4">
              Seu cronotipo determina seus horarios de pico de energia e foco.
            </p>
            <button
              onClick={() => setShowQuiz(true)}
              className="px-8 py-3 rounded-xl bg-primary-main text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              Fazer Quiz (5 perguntas)
            </button>
          </div>

          <div className="text-center text-neutral-textMuted">ou escolha diretamente</div>

          <div className="grid sm:grid-cols-2 gap-4">
            {Object.values(CHRONOTYPES).map(type => (
              <button
                key={type.id}
                onClick={() => selectChronotype(type.id)}
                className="p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{type.emoji}</span>
                  <span className="text-xl font-bold text-neutral-textPrimary">{type.name}</span>
                </div>
                <p className="text-sm text-neutral-textSecondary">{type.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {showQuiz && (
        /* Quiz */
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-neutral-textMuted mb-2">
              <span>Pergunta {quizStep + 1} de {QUIZ_QUESTIONS.length}</span>
              <span>{Math.round(((quizStep + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-neutral-background rounded-full">
              <div
                className="h-full bg-primary-main rounded-full transition-all"
                style={{ width: `${((quizStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-neutral-textPrimary mb-6">
            {QUIZ_QUESTIONS[quizStep].question}
          </h2>

          <div className="space-y-3">
            {QUIZ_QUESTIONS[quizStep].options.map(option => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="w-full p-4 rounded-xl bg-neutral-background hover:bg-primary-main/10 transition-colors text-left flex items-center gap-3"
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="text-neutral-textPrimary">{option.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowQuiz(false)}
            className="mt-6 text-neutral-textMuted hover:text-neutral-textSecondary"
          >
            Cancelar
          </button>
        </div>
      )}

      {!showQuiz && chronotypeInfo && (
        /* Result Display */
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-gradient-to-r from-primary-main/10 to-secondary-main/10 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-6xl">{chronotypeInfo.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold text-neutral-textPrimary">
                  Voce e um {chronotypeInfo.name}!
                </h2>
                <p className="text-neutral-textSecondary">{chronotypeInfo.description}</p>
              </div>
            </div>

            <div className="bg-white/50 rounded-xl p-4 mb-4">
              <p className="text-sm text-neutral-textMuted mb-1">Melhor horario de foco</p>
              <p className="text-lg font-bold text-primary-main">{chronotypeInfo.bestFocusTime}</p>
            </div>

            <button
              onClick={resetQuiz}
              className="text-sm text-primary-main hover:underline"
            >
              Refazer quiz ou mudar cronotipo
            </button>
          </div>

          {/* Strengths & Challenges */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-accent-success/10 rounded-2xl p-5">
              <h3 className="font-semibold text-accent-success mb-3 flex items-center gap-2">
                <span>💪</span> Pontos Fortes
              </h3>
              <ul className="space-y-2">
                {chronotypeInfo.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-neutral-textPrimary flex items-center gap-2">
                    <span className="text-accent-success">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-secondary-main/10 rounded-2xl p-5">
              <h3 className="font-semibold text-secondary-dark mb-3 flex items-center gap-2">
                <span>⚠️</span> Desafios
              </h3>
              <ul className="space-y-2">
                {chronotypeInfo.challenges.map((c, i) => (
                  <li key={i} className="text-sm text-neutral-textPrimary flex items-center gap-2">
                    <span className="text-secondary-dark">•</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Routine */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-textPrimary mb-4">
              Rotina Sugerida para {chronotypeInfo.name}
            </h3>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedRoutineTab('morning')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedRoutineTab === 'morning'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-neutral-background text-neutral-textSecondary'
                }`}
              >
                🌅 Manha
              </button>
              <button
                onClick={() => setSelectedRoutineTab('afternoon')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedRoutineTab === 'afternoon'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-neutral-background text-neutral-textSecondary'
                }`}
              >
                ☀️ Tarde
              </button>
              <button
                onClick={() => setSelectedRoutineTab('evening')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedRoutineTab === 'evening'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-neutral-background text-neutral-textSecondary'
                }`}
              >
                🌙 Noite
              </button>
            </div>

            {/* Routine List */}
            <div className="space-y-2">
              {chronotypeInfo.routine[selectedRoutineTab].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-neutral-background/50"
                >
                  <span className="w-6 h-6 rounded-full bg-primary-main/20 text-primary-main text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <p className="text-neutral-textPrimary">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Save routine to planner
                const routine = chronotypeInfo.routine;
                localStorage.setItem(getStorageKey('nciaflux_suggested_routine'), JSON.stringify(routine));
                alert('Rotina salva! Acesse o Planner Diario para ver.');
              }}
              className="flex-1 py-3 rounded-xl bg-primary-main text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              Usar esta rotina
            </button>
            <button
              onClick={resetQuiz}
              className="px-6 py-3 rounded-xl border border-neutral-border text-neutral-textSecondary hover:bg-neutral-background transition-colors"
            >
              Mudar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
