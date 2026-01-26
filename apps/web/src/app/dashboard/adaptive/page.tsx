'use client';

import { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Zap,
  Clock,
  Sun,
  Moon,
  Sunset,
  Lock,
  Unlock,
  Check,
  X,
  Lightbulb,
  Settings,
  RefreshCw,
  Activity,
} from 'lucide-react';
import HelpButton from '@/components/HelpButton';
import { getHelpContent } from '@/lib/help-content';
import {
  calculateStabilityScore,
  getAdaptiveSettings,
  analyzeAndAdapt,
  applyAdaptation,
  getAllFeatureAccess,
  StabilityComponents,
  AdaptiveSettings,
  AdaptationSuggestion,
  FeatureAccess,
} from '@/lib/adaptive-system';

const FEATURE_NAMES: Record<string, string> = {
  brain_dump: 'Brain Dump',
  basic_tasks: 'Tarefas Básicas',
  crisis_mode: 'Modo Crise',
  ai_chat: 'Chat com IA',
  planner: 'Planejador Diário',
  routines: 'Rotinas',
  projects: 'Projetos',
  focus_mode: 'Modo Foco',
  all_tasks: 'Todas as Tarefas',
  reports: 'Relatórios',
  weekly_review: 'Revisão Semanal',
  calendar: 'Calendário',
  multi_device: 'Multi-dispositivo',
  chat_1to1: 'Chat 1:1',
  communities: 'Comunidades',
  team_management: 'Gestão de Equipe',
  advanced_reports: 'Relatórios Avançados',
};

const FEATURE_ICONS: Record<string, string> = {
  brain_dump: '🧠',
  basic_tasks: '✅',
  crisis_mode: '🆘',
  ai_chat: '💬',
  planner: '📅',
  routines: '🔄',
  projects: '📁',
  focus_mode: '🎯',
  all_tasks: '📋',
  reports: '📊',
  weekly_review: '📝',
  calendar: '🗓️',
  multi_device: '📱',
  chat_1to1: '👥',
  communities: '🌐',
  team_management: '👔',
  advanced_reports: '📈',
};

export default function AdaptivePage() {
  const [stability, setStability] = useState<StabilityComponents | null>(null);
  const [settings, setSettings] = useState<AdaptiveSettings | null>(null);
  const [suggestions, setSuggestions] = useState<AdaptationSuggestion[]>([]);
  const [features, setFeatures] = useState<FeatureAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);

    // Calculate stability
    const stabilityData = calculateStabilityScore(7);
    setStability(stabilityData);

    // Get settings
    const settingsData = getAdaptiveSettings();
    setSettings(settingsData);

    // Analyze and get suggestions
    const suggestionsData = analyzeAndAdapt();
    setSuggestions(suggestionsData);

    // Get feature access (default to 'free' plan)
    const featuresData = getAllFeatureAccess(
      settingsData.featureLevel,
      stabilityData.total,
      'free'
    );
    setFeatures(featuresData);

    setLoading(false);
  }

  function handleApplySuggestion(suggestion: AdaptationSuggestion) {
    applyAdaptation(suggestion);
    setAppliedSuggestions(new Set([...appliedSuggestions, suggestion.type]));
    loadData();
  }

  function getChronotypeIcon() {
    switch (settings?.chronotype) {
      case 'morning':
        return <Sun className="w-6 h-6 text-secondary-main" />;
      case 'evening':
        return <Moon className="w-6 h-6 text-primary-main" />;
      default:
        return <Sunset className="w-6 h-6 text-accent-warning" />;
    }
  }

  function getChronotypeLabel() {
    switch (settings?.chronotype) {
      case 'morning':
        return 'Matutino';
      case 'evening':
        return 'Noturno';
      default:
        return 'Neutro';
    }
  }

  function getStabilityColor(score: number) {
    if (score >= 70) return 'text-accent-success';
    if (score >= 50) return 'text-secondary-main';
    if (score >= 30) return 'text-accent-warning';
    return 'text-accent-error';
  }

  function getStabilityBgColor(score: number) {
    if (score >= 70) return 'bg-accent-success';
    if (score >= 50) return 'bg-secondary-main';
    if (score >= 30) return 'bg-accent-warning';
    return 'bg-accent-error';
  }

  const unlockedFeatures = features.filter(f => f.isUnlocked).length;
  const totalFeatures = features.length;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary-main mx-auto mb-4 animate-spin" />
          <p className="text-neutral-textSecondary">Analisando seus padrões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary-main" />
          Dashboard Adaptativo
        </h1>
        <p className="text-neutral-textSecondary mt-1">
          O app se adapta a você - veja como seu uso personaliza sua experiência
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stability Score - Large Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-textPrimary flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-main" />
              Score de Estabilidade
            </h2>
            <button
              onClick={loadData}
              className="p-2 hover:bg-neutral-background rounded-lg transition-colors"
              title="Atualizar"
            >
              <RefreshCw className="w-5 h-5 text-neutral-textMuted" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Big Score Circle */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={stability && stability.total >= 70 ? '#22C55E' : stability && stability.total >= 50 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(stability?.total || 0) * 4.4} 440`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-4xl font-bold ${getStabilityColor(stability?.total || 0)}`}>
                  {Math.round(stability?.total || 0)}
                </span>
                <span className="text-sm text-neutral-textMuted">de 100</span>
              </div>
            </div>

            {/* Components Breakdown */}
            <div className="flex-1 space-y-4 w-full">
              {[
                { key: 'checkInConsistency', label: 'Consistência de Check-in', icon: '📝' },
                { key: 'moodStability', label: 'Estabilidade de Humor', icon: '😊' },
                { key: 'taskCompletion', label: 'Conclusão de Tarefas', icon: '✅' },
                { key: 'crisisFrequency', label: 'Frequência de Crises', icon: '🆘' },
                { key: 'routineAdherence', label: 'Aderência a Rotinas', icon: '🔄' },
              ].map((item) => {
                const value = stability?.[item.key as keyof StabilityComponents] as number || 0;
                return (
                  <div key={item.key} className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-neutral-textSecondary">{item.label}</span>
                        <span className={`text-sm font-medium ${getStabilityColor(value)}`}>
                          {Math.round(value)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-background rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getStabilityBgColor(value)}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detected Patterns Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary-main" />
            Padrões Detectados
          </h2>

          <div className="space-y-4">
            {/* Chronotype */}
            <div className="p-4 bg-neutral-background rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                {getChronotypeIcon()}
                <div>
                  <p className="text-sm text-neutral-textMuted">Cronotipo</p>
                  <p className="font-semibold text-neutral-textPrimary">{getChronotypeLabel()}</p>
                </div>
              </div>
              <p className="text-xs text-neutral-textSecondary">
                Você é mais produtivo no período da {settings?.chronotype === 'morning' ? 'manhã' : settings?.chronotype === 'evening' ? 'noite' : 'tarde'}
              </p>
            </div>

            {/* Peak Hours */}
            <div className="p-4 bg-neutral-background rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-accent-warning" />
                <div>
                  <p className="text-sm text-neutral-textMuted">Horários de Pico</p>
                  <p className="font-semibold text-neutral-textPrimary">
                    {settings?.peakHours.map(h => `${h}h`).join(', ')}
                  </p>
                </div>
              </div>
              <p className="text-xs text-neutral-textSecondary">
                Nesses horários sua produtividade é mais alta
              </p>
            </div>

            {/* Focus Duration */}
            <div className="p-4 bg-neutral-background rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-primary-main" />
                <div>
                  <p className="text-sm text-neutral-textMuted">Foco Ideal</p>
                  <p className="font-semibold text-neutral-textPrimary">
                    {settings?.preferredFocusDuration} minutos
                  </p>
                </div>
              </div>
              <p className="text-xs text-neutral-textSecondary">
                Duração ideal para suas sessões de foco
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Adaptation Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-primary-main/10 to-secondary-main/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-secondary-main" />
            Sugestões de Adaptação
          </h2>
          <p className="text-sm text-neutral-textSecondary mb-4">
            Com base nos seus padrões de uso, identificamos oportunidades de melhoria
          </p>

          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <p className="font-medium text-neutral-textPrimary">{suggestion.reason}</p>
                  <p className="text-sm text-neutral-textMuted mt-1">
                    Confiança: {Math.round(suggestion.confidence * 100)}%
                  </p>
                </div>
                {appliedSuggestions.has(suggestion.type) ? (
                  <div className="flex items-center gap-2 text-accent-success">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">Aplicado</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="px-4 py-2 bg-primary-main text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                    >
                      Aplicar
                    </button>
                    <button className="p-2 hover:bg-neutral-background rounded-lg transition-colors">
                      <X className="w-5 h-5 text-neutral-textMuted" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Unlocking */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-textPrimary flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-main" />
                Desbloqueio de Funcionalidades
              </h2>
              <p className="text-sm text-neutral-textSecondary mt-1">
                Novas funcionalidades são liberadas conforme você progride
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-main">
                {unlockedFeatures}/{totalFeatures}
              </p>
              <p className="text-xs text-neutral-textMuted">desbloqueadas</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full h-3 bg-neutral-background rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-main to-secondary-main rounded-full transition-all duration-500"
                style={{ width: `${(unlockedFeatures / totalFeatures) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Group by level */}
          {[1, 2, 3, 4, 5].map((level) => {
            const levelFeatures = features.filter((f) => f.requiredLevel === level);
            if (levelFeatures.length === 0) return null;

            const levelLabels: Record<number, string> = {
              1: 'Nível 1 - Básico',
              2: 'Nível 2 - Perfil Completo',
              3: 'Nível 3 - Estabilidade 50%+',
              4: 'Nível 4 - Estabilidade 70%+ e Plus',
              5: 'Nível 5 - Acesso Total',
            };

            return (
              <div key={level} className="mb-6 last:mb-0">
                <h3 className="text-sm font-medium text-neutral-textMuted mb-3">
                  {levelLabels[level]}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {levelFeatures.map((feature) => (
                    <div
                      key={feature.featureId}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        feature.isUnlocked
                          ? 'border-accent-success bg-accent-success/5'
                          : 'border-neutral-border bg-neutral-background/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{FEATURE_ICONS[feature.featureId] || '⚙️'}</span>
                        {feature.isUnlocked ? (
                          <Unlock className="w-4 h-4 text-accent-success" />
                        ) : (
                          <Lock className="w-4 h-4 text-neutral-textMuted" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-neutral-textPrimary">
                        {FEATURE_NAMES[feature.featureId] || feature.featureId}
                      </p>
                      {!feature.isUnlocked && (
                        <p className="text-xs text-neutral-textMuted mt-1">
                          {feature.requiredStability
                            ? `Estabilidade: ${feature.requiredStability}%`
                            : feature.requiredPlan
                            ? `Plano: ${feature.requiredPlan}`
                            : `Nível ${feature.requiredLevel}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-accent-info/10 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-accent-info/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-accent-info" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-textPrimary mb-2">
              Como funciona o sistema adaptativo?
            </h3>
            <p className="text-sm text-neutral-textSecondary mb-3">
              O NeuroFluxo aprende com seus padrões de uso para personalizar sua experiência:
            </p>
            <ul className="text-sm text-neutral-textSecondary space-y-1">
              <li>• Detecta seu cronotipo baseado em quando você é mais ativo</li>
              <li>• Identifica seus horários de pico de produtividade</li>
              <li>• Ajusta a duração ideal das sessões de foco</li>
              <li>• Desbloqueia funcionalidades conforme sua estabilidade aumenta</li>
              <li>• Sugere adaptações para melhorar sua experiência</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Help Button */}
      <HelpButton content={getHelpContent('adaptive')} />
    </div>
  );
}
