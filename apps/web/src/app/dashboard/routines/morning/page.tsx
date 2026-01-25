'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStorageKey } from '@/lib/storage';

interface RoutineStep {
  id: string;
  type: 'action' | 'condition';
  content: string;
  emoji: string;
  duration?: number; // minutes
  conditionYes?: string; // next step id if yes
  conditionNo?: string; // next step id if no
  nextStep?: string; // next step id for actions
  isStart?: boolean;
}

const PRESET_ACTIONS = [
  { content: 'Beber agua', emoji: '💧', duration: 1 },
  { content: 'Alongamento leve', emoji: '🧘', duration: 5 },
  { content: 'Exercicio', emoji: '🏃', duration: 20 },
  { content: 'Meditacao', emoji: '🧠', duration: 10 },
  { content: 'Banho', emoji: '🚿', duration: 15 },
  { content: 'Cafe da manha', emoji: '🍳', duration: 20 },
  { content: 'Revisar agenda', emoji: '📅', duration: 5 },
  { content: 'Brain dump', emoji: '📝', duration: 10 },
  { content: 'Definir Top 1', emoji: '⭐', duration: 5 },
  { content: 'Organizar espaco', emoji: '🧹', duration: 10 },
  { content: 'Luz solar', emoji: '☀️', duration: 5 },
  { content: 'Higiene pessoal', emoji: '🪥', duration: 10 },
];

const PRESET_CONDITIONS = [
  { content: 'Dormiu bem?', emoji: '😴' },
  { content: 'Tem tempo extra?', emoji: '⏰' },
  { content: 'Esta com energia?', emoji: '⚡' },
  { content: 'Dia de trabalho?', emoji: '💼' },
  { content: 'Espaco esta organizado?', emoji: '🏠' },
];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export default function MorningRoutinePage() {
  const router = useRouter();
  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExecutionStep, setCurrentExecutionStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showAddStep, setShowAddStep] = useState(false);
  const [addStepType, setAddStepType] = useState<'action' | 'condition'>('action');

  // Load routine from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey('nciaflux_morning_routine'));
    if (saved) {
      setSteps(JSON.parse(saved));
    } else {
      // Default routine
      setSteps([
        { id: '1', type: 'action', content: 'Beber agua', emoji: '💧', duration: 1, nextStep: '2', isStart: true },
        { id: '2', type: 'condition', content: 'Dormiu bem?', emoji: '😴', conditionYes: '3', conditionNo: '4' },
        { id: '3', type: 'action', content: 'Exercicio', emoji: '🏃', duration: 20, nextStep: '5' },
        { id: '4', type: 'action', content: 'Alongamento leve', emoji: '🧘', duration: 5, nextStep: '5' },
        { id: '5', type: 'action', content: 'Banho', emoji: '🚿', duration: 15, nextStep: '6' },
        { id: '6', type: 'action', content: 'Cafe da manha', emoji: '🍳', duration: 20, nextStep: '7' },
        { id: '7', type: 'action', content: 'Definir Top 1', emoji: '⭐', duration: 5 },
      ]);
    }
  }, []);

  // Save routine
  useEffect(() => {
    if (steps.length > 0) {
      localStorage.setItem(getStorageKey('nciaflux_morning_routine'), JSON.stringify(steps));
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

    // If no next step, routine is complete
    if ((step.type === 'action' && !step.nextStep) ||
        (step.type === 'condition' && !step.conditionYes && !step.conditionNo)) {
      // Mark routine as completed in today's planner
      const today = getToday();
      const planData = localStorage.getItem(getStorageKey(`nciaflux_planner_${today}`));
      if (planData) {
        const plan = JSON.parse(planData);
        plan.morningRoutineCompleted = true;
        localStorage.setItem(getStorageKey(`nciaflux_planner_${today}`), JSON.stringify(plan));
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

    // Add to end of routine
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
    // Remove step and update references
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

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary flex items-center gap-2">
            <span>🌅</span> Rotina Matinal
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
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6">
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
          <span className="text-6xl block mb-4">🎉</span>
          <h2 className="text-2xl font-bold text-accent-success mb-2">
            Rotina Completa!
          </h2>
          <p className="text-neutral-textSecondary mb-4">
            Parabens! Voce completou sua rotina matinal.
          </p>
          <button
            onClick={() => router.push('/dashboard/planner')}
            className="px-6 py-3 rounded-xl bg-accent-success text-white font-semibold"
          >
            Ir para o Planner
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

      {/* Routine Flow Visualization */}
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
                {/* Connection Line */}
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

                {/* Condition Branches */}
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

        {/* Add Step Button */}
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

            {/* Type Toggle */}
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

            {/* Presets */}
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
