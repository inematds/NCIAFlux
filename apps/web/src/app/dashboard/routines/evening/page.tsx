'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStorageKey } from '@/lib/storage';

interface RoutineStep {
  id: string;
  type: 'action' | 'condition';
  content: string;
  emoji: string;
  duration?: number;
  conditionYes?: string;
  conditionNo?: string;
  nextStep?: string;
  isStart?: boolean;
}

const PRESET_ACTIONS = [
  { content: 'Revisar o dia', emoji: '📝', duration: 5 },
  { content: 'Definir Top 1 de amanha', emoji: '⭐', duration: 5 },
  { content: 'Preparar roupa/mochila', emoji: '👔', duration: 10 },
  { content: 'Organizar espaco', emoji: '🧹', duration: 10 },
  { content: 'Exercicio leve/Yoga', emoji: '🧘', duration: 15 },
  { content: 'Leitura', emoji: '📚', duration: 20 },
  { content: 'Gratidao', emoji: '🙏', duration: 5 },
  { content: 'Desligar telas', emoji: '📵', duration: 1 },
  { content: 'Skincare/Higiene', emoji: '🧴', duration: 10 },
  { content: 'Cha/Agua', emoji: '🍵', duration: 5 },
  { content: 'Meditacao/Respiracao', emoji: '🧠', duration: 10 },
  { content: 'Ouvir musica calma', emoji: '🎵', duration: 15 },
];

const PRESET_CONDITIONS = [
  { content: 'Dia foi produtivo?', emoji: '✅' },
  { content: 'Tarefas pendentes?', emoji: '📋' },
  { content: 'Esta ansioso?', emoji: '😰' },
  { content: 'Energia para exercicio?', emoji: '⚡' },
  { content: 'Amanha e dia de trabalho?', emoji: '💼' },
];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export default function EveningRoutinePage() {
  const router = useRouter();
  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExecutionStep, setCurrentExecutionStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showAddStep, setShowAddStep] = useState(false);
  const [addStepType, setAddStepType] = useState<'action' | 'condition'>('action');
  const [tomorrowTop1, setTomorrowTop1] = useState('');

  // Load routine
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey('nciaflux_evening_routine'));
    if (saved) {
      setSteps(JSON.parse(saved));
    } else {
      setSteps([
        { id: '1', type: 'action', content: 'Revisar o dia', emoji: '📝', duration: 5, nextStep: '2', isStart: true },
        { id: '2', type: 'condition', content: 'Tarefas pendentes?', emoji: '📋', conditionYes: '3', conditionNo: '4' },
        { id: '3', type: 'action', content: 'Anotar para amanha', emoji: '✏️', duration: 3, nextStep: '4' },
        { id: '4', type: 'action', content: 'Gratidao', emoji: '🙏', duration: 5, nextStep: '5' },
        { id: '5', type: 'action', content: 'Definir Top 1 de amanha', emoji: '⭐', duration: 5, nextStep: '6' },
        { id: '6', type: 'action', content: 'Preparar para amanha', emoji: '👔', duration: 10, nextStep: '7' },
        { id: '7', type: 'action', content: 'Desligar telas', emoji: '📵', duration: 1, nextStep: '8' },
        { id: '8', type: 'action', content: 'Leitura ou musica', emoji: '📚', duration: 15 },
      ]);
    }
  }, []);

  useEffect(() => {
    if (steps.length > 0) {
      localStorage.setItem(getStorageKey('nciaflux_evening_routine'), JSON.stringify(steps));
    }
  }, [steps]);

  function startExecution() {
    const startStep = steps.find(s => s.isStart);
    if (startStep) {
      setCurrentExecutionStep(startStep.id);
      setCompletedSteps([]);
    }
  }

  function completeStep(stepId: string, conditionAnswer?: boolean) {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    setCompletedSteps([...completedSteps, stepId]);

    if (step.type === 'condition') {
      const nextId = conditionAnswer ? step.conditionYes : step.conditionNo;
      setCurrentExecutionStep(nextId || null);
    } else {
      setCurrentExecutionStep(step.nextStep || null);
    }

    if ((step.type === 'action' && !step.nextStep) ||
        (step.type === 'condition' && !step.conditionYes && !step.conditionNo)) {
      const today = getToday();
      const planData = localStorage.getItem(getStorageKey(`nciaflux_planner_${today}`));
      if (planData) {
        const plan = JSON.parse(planData);
        plan.eveningRoutineCompleted = true;
        localStorage.setItem(getStorageKey(`nciaflux_planner_${today}`), JSON.stringify(plan));
      }

      // Save tomorrow's Top 1 if set
      if (tomorrowTop1) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const tomorrowPlan = localStorage.getItem(getStorageKey(`nciaflux_planner_${tomorrowStr}`));

        if (tomorrowPlan) {
          const plan = JSON.parse(tomorrowPlan);
          plan.top1 = tomorrowTop1;
          localStorage.setItem(getStorageKey(`nciaflux_planner_${tomorrowStr}`), JSON.stringify(plan));
        } else {
          localStorage.setItem(getStorageKey(`nciaflux_planner_${tomorrowStr}`), JSON.stringify({
            date: tomorrowStr,
            top1: tomorrowTop1,
            tasks: [{
              id: `task_${Date.now()}`,
              content: tomorrowTop1,
              period: 'morning',
              completed: false,
              isTop1: true,
            }],
            confirmation: '',
            gratitude: '',
            mood: '',
            sleepQuality: 0,
            expectedRating: 0,
            morningRoutineCompleted: false,
            eveningRoutineCompleted: false,
            morningReview: '',
            eveningReview: '',
          }));
        }
      }
    }
  }

  function addStep(preset: { content: string; emoji: string; duration?: number }) {
    const newStep: RoutineStep = {
      id: `step_${Date.now()}`,
      type: addStepType,
      content: preset.content,
      emoji: preset.emoji,
      duration: preset.duration,
    };

    const lastAction = [...steps].reverse().find(s => s.type === 'action' && !s.nextStep);
    if (lastAction) {
      setSteps(steps.map(s =>
        s.id === lastAction.id ? { ...s, nextStep: newStep.id } : s
      ).concat(newStep));
    } else {
      setSteps([...steps, newStep]);
    }

    setShowAddStep(false);
  }

  function removeStep(stepId: string) {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    setSteps(steps
      .filter(s => s.id !== stepId)
      .map(s => ({
        ...s,
        nextStep: s.nextStep === stepId ? step.nextStep : s.nextStep,
        conditionYes: s.conditionYes === stepId ? undefined : s.conditionYes,
        conditionNo: s.conditionNo === stepId ? undefined : s.conditionNo,
      }))
    );
  }

  const currentStep = steps.find(s => s.id === currentExecutionStep);
  const totalDuration = steps
    .filter(s => s.type === 'action')
    .reduce((sum, s) => sum + (s.duration || 0), 0);
  const isCompleted = currentExecutionStep === null && completedSteps.length > 0;

  // Check if current step is "Define Top 1 for tomorrow"
  const isTop1Step = currentStep?.content.toLowerCase().includes('top 1');

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary flex items-center gap-2">
            <span>🌙</span> Rotina Noturna
          </h1>
          <p className="text-neutral-textSecondary mt-1">
            {totalDuration} minutos • {steps.filter(s => s.type === 'action').length} atividades
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-medium ${
            isEditing
              ? 'bg-accent-success text-white'
              : 'bg-neutral-background text-neutral-textSecondary'
          }`}
        >
          {isEditing ? 'Salvar' : 'Editar'}
        </button>
      </div>

      {/* Execution Mode */}
      {!isEditing && currentStep && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
          <div className="text-center mb-6">
            <span className="text-6xl block mb-4">{currentStep.emoji}</span>
            <h2 className="text-2xl font-bold text-neutral-textPrimary mb-2">
              {currentStep.content}
            </h2>
            {currentStep.duration && (
              <p className="text-neutral-textSecondary">
                {currentStep.duration} minutos
              </p>
            )}
          </div>

          {/* Top 1 Input */}
          {isTop1Step && (
            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">
                Qual sera sua prioridade amanha?
              </label>
              <input
                type="text"
                value={tomorrowTop1}
                onChange={(e) => setTomorrowTop1(e.target.value)}
                placeholder="Minha prioridade absoluta de amanha..."
                className="w-full px-4 py-3 rounded-xl border border-neutral-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-main"
              />
            </div>
          )}

          {currentStep.type === 'condition' ? (
            <div className="flex gap-4">
              <button
                onClick={() => completeStep(currentStep.id, true)}
                className="flex-1 py-4 rounded-xl bg-accent-success text-white font-semibold text-lg"
              >
                Sim ✓
              </button>
              <button
                onClick={() => completeStep(currentStep.id, false)}
                className="flex-1 py-4 rounded-xl bg-secondary-main text-white font-semibold text-lg"
              >
                Nao ✗
              </button>
            </div>
          ) : (
            <button
              onClick={() => completeStep(currentStep.id)}
              className="w-full py-4 rounded-xl bg-primary-main text-white font-semibold text-lg"
            >
              Concluir ✓
            </button>
          )}

          <div className="mt-4 text-center">
            <p className="text-sm text-neutral-textMuted">
              {completedSteps.length} de {steps.length} etapas concluidas
            </p>
          </div>
        </div>
      )}

      {/* Completion */}
      {!isEditing && isCompleted && (
        <div className="bg-accent-success/10 rounded-2xl p-6 mb-6 text-center">
          <span className="text-6xl block mb-4">😴</span>
          <h2 className="text-2xl font-bold text-accent-success mb-2">
            Pronto para Descansar!
          </h2>
          <p className="text-neutral-textSecondary mb-4">
            Sua rotina noturna esta completa. Tenha uma boa noite!
          </p>
          {tomorrowTop1 && (
            <div className="bg-white rounded-xl p-4 mb-4 text-left">
              <p className="text-sm text-neutral-textMuted">Top 1 de amanha:</p>
              <p className="font-medium text-neutral-textPrimary">⭐ {tomorrowTop1}</p>
            </div>
          )}
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-xl bg-accent-success text-white font-semibold"
          >
            Voltar ao Inicio
          </button>
        </div>
      )}

      {/* Start Button */}
      {!isEditing && !currentStep && !isCompleted && (
        <button
          onClick={startExecution}
          className="w-full py-4 rounded-xl bg-primary-main text-white font-semibold text-lg mb-6"
        >
          Iniciar Rotina
        </button>
      )}

      {/* Routine Flow */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-neutral-textPrimary mb-4">
          {isEditing ? 'Editar Rotina' : 'Fluxo da Rotina'}
        </h3>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isActive = currentExecutionStep === step.id;
            const isDone = completedSteps.includes(step.id);

            return (
              <div key={step.id} className="relative">
                {index > 0 && (
                  <div className="absolute -top-3 left-6 w-0.5 h-3 bg-neutral-border" />
                )}

                <div
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-primary-main bg-primary-main/5'
                      : isDone
                        ? 'border-accent-success/50 bg-accent-success/5'
                        : 'border-neutral-border'
                  }`}
                >
                  <span className={`text-2xl ${isDone ? 'opacity-50' : ''}`}>{step.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-medium ${isDone ? 'line-through text-neutral-textMuted' : 'text-neutral-textPrimary'}`}>
                      {step.content}
                    </p>
                    {step.type === 'condition' && (
                      <span className="text-xs text-secondary-main">Decisao</span>
                    )}
                    {step.duration && (
                      <span className="text-xs text-neutral-textMuted ml-2">{step.duration} min</span>
                    )}
                  </div>

                  {isEditing && (
                    <button
                      onClick={() => removeStep(step.id)}
                      className="p-2 text-accent-error hover:bg-accent-error/10 rounded-lg"
                    >
                      ✕
                    </button>
                  )}

                  {isDone && !isEditing && (
                    <span className="text-accent-success text-xl">✓</span>
                  )}
                </div>

                {step.type === 'condition' && (
                  <div className="ml-8 mt-2 flex gap-4 text-sm text-neutral-textMuted">
                    <span className="text-accent-success">✓ Sim → {steps.find(s => s.id === step.conditionYes)?.content || 'Fim'}</span>
                    <span className="text-secondary-main">✗ Nao → {steps.find(s => s.id === step.conditionNo)?.content || 'Fim'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isEditing && (
          <button
            onClick={() => setShowAddStep(true)}
            className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-neutral-border text-neutral-textSecondary hover:border-primary-main hover:text-primary-main transition-colors"
          >
            + Adicionar etapa
          </button>
        )}
      </div>

      {/* Add Step Modal */}
      {showAddStep && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-neutral-textPrimary mb-4">
              Adicionar Etapa
            </h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAddStepType('action')}
                className={`flex-1 py-2 rounded-lg font-medium ${
                  addStepType === 'action'
                    ? 'bg-primary-main text-white'
                    : 'bg-neutral-background text-neutral-textSecondary'
                }`}
              >
                Acao
              </button>
              <button
                onClick={() => setAddStepType('condition')}
                className={`flex-1 py-2 rounded-lg font-medium ${
                  addStepType === 'condition'
                    ? 'bg-primary-main text-white'
                    : 'bg-neutral-background text-neutral-textSecondary'
                }`}
              >
                Decisao
              </button>
            </div>

            <div className="space-y-2">
              {(addStepType === 'action' ? PRESET_ACTIONS : PRESET_CONDITIONS).map((preset, i) => (
                <button
                  key={i}
                  onClick={() => addStep(preset)}
                  className="w-full p-3 rounded-xl bg-neutral-background hover:bg-primary-main/10 text-left flex items-center gap-3"
                >
                  <span className="text-2xl">{preset.emoji}</span>
                  <span className="text-neutral-textPrimary">{preset.content}</span>
                  {'duration' in preset && (preset as { duration?: number }).duration ? (
                    <span className="ml-auto text-sm text-neutral-textMuted">{(preset as { duration: number }).duration} min</span>
                  ) : null}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddStep(false)}
              className="w-full mt-4 py-3 rounded-xl border border-neutral-border text-neutral-textSecondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
