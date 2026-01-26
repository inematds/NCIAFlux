'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Flame, TrendingUp, Gift, Sparkles, Lock, CheckCircle } from 'lucide-react';
import HelpButton from '@/components/HelpButton';
import { getHelpContent } from '@/lib/help-content';
import {
  getGamificationData,
  getAllAchievementsWithStatus,
  getUncelebratedAchievements,
  UserGamification,
  Achievement,
} from '@/lib/gamification-service';

type AchievementWithStatus = Achievement & { unlocked: boolean; unlockedAt?: string };

export default function GamificationPage() {
  const [data, setData] = useState<UserGamification | null>(null);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    const gamificationData = getGamificationData();
    setData(gamificationData);

    const achievementsData = getAllAchievementsWithStatus();
    setAchievements(achievementsData);

    // Check for new unlocked achievements that haven't been celebrated
    const uncelebrated = getUncelebratedAchievements();
    if (uncelebrated.length > 0) {
      setShowCelebration(true);
    }
  }

  const categories = [
    { id: 'all', label: 'Todas', icon: '🏆' },
    { id: 'start', label: 'Início', icon: '🌱' },
    { id: 'consistency', label: 'Consistência', icon: '🔥' },
    { id: 'wellbeing', label: 'Bem-estar', icon: '💚' },
    { id: 'social', label: 'Social', icon: '🤝' },
    { id: 'mastery', label: 'Maestria', icon: '⭐' },
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Calculate level progress
  const levelProgress = data?.xpProgress || 0;
  const xpInCurrentLevel = data ? Math.round((data.xpProgress / 100) * data.xpToNextLevel) : 0;
  const xpNeededForLevel = data?.xpToNextLevel || 100;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-secondary-main" />
          Gamificação
        </h1>
        <p className="text-neutral-textSecondary mt-1">
          Acompanhe seu progresso, conquistas e sequências
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Level Card */}
        <div className="bg-gradient-to-br from-primary-main to-primary-dark rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <Star className="w-8 h-8 opacity-80" />
            <span className="text-4xl font-bold">{data?.currentLevel || 1}</span>
          </div>
          <p className="text-white/80 text-sm">Nível Atual</p>
          <div className="mt-2">
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <p className="text-xs text-white/60 mt-1">
              {xpInCurrentLevel} / {xpNeededForLevel} XP para o próximo nível
            </p>
          </div>
        </div>

        {/* Total XP Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-accent-success" />
            <span className="text-3xl font-bold text-neutral-textPrimary">{data?.totalXP || 0}</span>
          </div>
          <p className="text-neutral-textSecondary text-sm">XP Total</p>
          <p className="text-xs text-neutral-textMuted mt-1">
            Nível {data?.currentLevel || 1}
          </p>
        </div>

        {/* Streak Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Flame className="w-8 h-8 text-accent-error" />
            <span className="text-3xl font-bold text-neutral-textPrimary">{data?.currentStreak || 0}</span>
          </div>
          <p className="text-neutral-textSecondary text-sm">Sequência Atual</p>
          <p className="text-xs text-neutral-textMuted mt-1">
            Recorde: {data?.longestStreak || 0} dias
          </p>
        </div>

        {/* Achievements Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Trophy className="w-8 h-8 text-secondary-main" />
            <span className="text-3xl font-bold text-neutral-textPrimary">{unlockedCount}/{totalCount}</span>
          </div>
          <p className="text-neutral-textSecondary text-sm">Conquistas</p>
          <div className="mt-2">
            <div className="w-full h-2 bg-neutral-background rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary-main rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Streak Info */}
      {data && data.pausedDays > 0 && (
        <div className="bg-accent-info/10 rounded-xl p-4 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-info/20 rounded-full flex items-center justify-center">
            <Gift className="w-5 h-5 text-accent-info" />
          </div>
          <div>
            <p className="font-medium text-neutral-textPrimary">Sequência Pausada</p>
            <p className="text-sm text-neutral-textSecondary">
              Sua sequência está pausada há {data.pausedDays} dia(s).
              Não se preocupe - ela não será zerada! Volte quando estiver pronto.
            </p>
          </div>
        </div>
      )}

      {/* Achievements Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-border">
          <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4">Conquistas</h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-primary-main text-white'
                    : 'bg-neutral-background text-neutral-textSecondary hover:bg-neutral-border'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  achievement.unlocked
                    ? 'border-secondary-main bg-secondary-main/5'
                    : 'border-neutral-border bg-neutral-background/50 opacity-60'
                }`}
              >
                {/* Icon */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`text-4xl ${!achievement.unlocked && 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  {achievement.unlocked ? (
                    <CheckCircle className="w-6 h-6 text-accent-success" />
                  ) : (
                    <Lock className="w-5 h-5 text-neutral-textMuted" />
                  )}
                </div>

                {/* Content */}
                <h3 className="font-semibold text-neutral-textPrimary mb-1">
                  {achievement.name}
                </h3>
                <p className="text-sm text-neutral-textSecondary mb-2">
                  {achievement.description}
                </p>

                {/* XP Reward */}
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-primary-main/10 text-primary-main rounded-full">
                    +{achievement.xpReward} XP
                  </span>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <span className="text-xs text-neutral-textMuted">
                      {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-neutral-textMuted mx-auto mb-4" />
              <p className="text-neutral-textSecondary">
                Nenhuma conquista nesta categoria ainda.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* How XP Works */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4">Como Ganhar XP</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { action: 'Completar tarefa', xp: '10-30', icon: '✅' },
            { action: 'Fazer check-in', xp: '5', icon: '📝' },
            { action: 'Sessão de foco', xp: '15-50', icon: '🎯' },
            { action: 'Manter sequência', xp: '10/dia', icon: '🔥' },
            { action: 'Completar rotina', xp: '20', icon: '🌅' },
            { action: 'Desbloquear conquista', xp: '50-200', icon: '🏆' },
            { action: 'Revisão semanal', xp: '25', icon: '📊' },
            { action: 'Ajudar parceiro', xp: '10', icon: '🤝' },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-neutral-background rounded-xl">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-neutral-textPrimary">{item.action}</p>
                <p className="text-xs text-primary-main font-semibold">+{item.xp} XP</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-neutral-textPrimary mb-2">
              Nova Conquista!
            </h2>
            <p className="text-neutral-textSecondary mb-6">
              Parabéns! Você desbloqueou uma nova conquista!
            </p>
            <button
              onClick={() => setShowCelebration(false)}
              className="w-full py-3 bg-primary-main text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
            >
              Incrível! 🚀
            </button>
          </div>
        </div>
      )}

      {/* Help Button */}
      <HelpButton content={getHelpContent('gamification')} />
    </div>
  );
}
