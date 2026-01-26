'use client';

import { useState, useEffect } from 'react';
import { getStorageKey } from '@/lib/storage';
import HelpButton from '@/components/HelpButton';
import { getHelpContent } from '@/lib/help-content';

interface WeeklyReview {
  id: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string;
  wins: string[];
  challenges: string[];
  lessons: string[];
  gratitude: string[];
  nextWeekFocus: string;
  energyLevel: number; // 1-5
  productivityLevel: number; // 1-5
  overallMood: 'great' | 'good' | 'okay' | 'tough' | 'difficult';
  completedAt: string;
}

interface MonthlyReview {
  id: string;
  month: string; // YYYY-MM
  monthName: string;
  biggestWins: string[];
  areasToImprove: string[];
  habitsFormed: string[];
  goalsProgress: { goal: string; progress: number }[];
  lessonsLearned: string[];
  nextMonthGoals: string[];
  overallRating: number; // 1-10
  completedAt: string;
}

const MOOD_OPTIONS = [
  { value: 'great', emoji: '🤩', label: 'Incrivel' },
  { value: 'good', emoji: '😊', label: 'Bom' },
  { value: 'okay', emoji: '😐', label: 'Ok' },
  { value: 'tough', emoji: '😔', label: 'Dificil' },
  { value: 'difficult', emoji: '😞', label: 'Muito dificil' },
];

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function getWeekRange(date: Date): { start: Date; end: Date } {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const start = new Date(date);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return { start, end };
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateRange(start: Date, end: Date): string {
  return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
}

export default function ReviewPage() {
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>([]);
  const [monthlyReviews, setMonthlyReviews] = useState<MonthlyReview[]>([]);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingWeekly, setEditingWeekly] = useState<WeeklyReview | null>(null);
  const [editingMonthly, setEditingMonthly] = useState<MonthlyReview | null>(null);

  // Weekly form state
  const [wins, setWins] = useState<string[]>(['']);
  const [challenges, setChallenges] = useState<string[]>(['']);
  const [lessons, setLessons] = useState<string[]>(['']);
  const [gratitude, setGratitude] = useState<string[]>(['']);
  const [nextWeekFocus, setNextWeekFocus] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [productivityLevel, setProductivityLevel] = useState(3);
  const [overallMood, setOverallMood] = useState<WeeklyReview['overallMood']>('good');

  // Monthly form state
  const [biggestWins, setBiggestWins] = useState<string[]>(['']);
  const [areasToImprove, setAreasToImprove] = useState<string[]>(['']);
  const [habitsFormed, setHabitsFormed] = useState<string[]>(['']);
  const [goalsProgress, setGoalsProgress] = useState<{ goal: string; progress: number }[]>([{ goal: '', progress: 50 }]);
  const [lessonsLearned, setLessonsLearned] = useState<string[]>(['']);
  const [nextMonthGoals, setNextMonthGoals] = useState<string[]>(['']);
  const [overallRating, setOverallRating] = useState(7);

  // Load data
  useEffect(() => {
    const savedWeekly = localStorage.getItem(getStorageKey('nciaflux_weekly_reviews'));
    if (savedWeekly) {
      setWeeklyReviews(JSON.parse(savedWeekly));
    }

    const savedMonthly = localStorage.getItem(getStorageKey('nciaflux_monthly_reviews'));
    if (savedMonthly) {
      setMonthlyReviews(JSON.parse(savedMonthly));
    }
  }, []);

  function saveWeeklyReviews(reviews: WeeklyReview[]) {
    setWeeklyReviews(reviews);
    localStorage.setItem(getStorageKey('nciaflux_weekly_reviews'), JSON.stringify(reviews));
  }

  function saveMonthlyReviews(reviews: MonthlyReview[]) {
    setMonthlyReviews(reviews);
    localStorage.setItem(getStorageKey('nciaflux_monthly_reviews'), JSON.stringify(reviews));
  }

  // Start new review
  function startWeeklyReview() {
    const { start } = getWeekRange(new Date());
    const existing = weeklyReviews.find(r => r.weekStart === formatDate(start));

    if (existing) {
      openEditWeekly(existing);
    } else {
      setEditingWeekly(null);
      resetWeeklyForm();
      setShowReviewForm(true);
    }
  }

  function startMonthlyReview() {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const existing = monthlyReviews.find(r => r.month === monthKey);

    if (existing) {
      openEditMonthly(existing);
    } else {
      setEditingMonthly(null);
      resetMonthlyForm();
      setShowReviewForm(true);
    }
  }

  function openEditWeekly(review: WeeklyReview) {
    setEditingWeekly(review);
    setWins(review.wins.length > 0 ? review.wins : ['']);
    setChallenges(review.challenges.length > 0 ? review.challenges : ['']);
    setLessons(review.lessons.length > 0 ? review.lessons : ['']);
    setGratitude(review.gratitude.length > 0 ? review.gratitude : ['']);
    setNextWeekFocus(review.nextWeekFocus);
    setEnergyLevel(review.energyLevel);
    setProductivityLevel(review.productivityLevel);
    setOverallMood(review.overallMood);
    setShowReviewForm(true);
  }

  function openEditMonthly(review: MonthlyReview) {
    setEditingMonthly(review);
    setBiggestWins(review.biggestWins.length > 0 ? review.biggestWins : ['']);
    setAreasToImprove(review.areasToImprove.length > 0 ? review.areasToImprove : ['']);
    setHabitsFormed(review.habitsFormed.length > 0 ? review.habitsFormed : ['']);
    setGoalsProgress(review.goalsProgress.length > 0 ? review.goalsProgress : [{ goal: '', progress: 50 }]);
    setLessonsLearned(review.lessonsLearned.length > 0 ? review.lessonsLearned : ['']);
    setNextMonthGoals(review.nextMonthGoals.length > 0 ? review.nextMonthGoals : ['']);
    setOverallRating(review.overallRating);
    setShowReviewForm(true);
  }

  function resetWeeklyForm() {
    setWins(['']);
    setChallenges(['']);
    setLessons(['']);
    setGratitude(['']);
    setNextWeekFocus('');
    setEnergyLevel(3);
    setProductivityLevel(3);
    setOverallMood('good');
  }

  function resetMonthlyForm() {
    setBiggestWins(['']);
    setAreasToImprove(['']);
    setHabitsFormed(['']);
    setGoalsProgress([{ goal: '', progress: 50 }]);
    setLessonsLearned(['']);
    setNextMonthGoals(['']);
    setOverallRating(7);
  }

  // Save reviews
  function saveWeeklyReview() {
    const { start, end } = getWeekRange(new Date());

    const review: WeeklyReview = {
      id: editingWeekly?.id || `weekly_${Date.now()}`,
      weekStart: formatDate(start),
      weekEnd: formatDate(end),
      wins: wins.filter(w => w.trim()),
      challenges: challenges.filter(c => c.trim()),
      lessons: lessons.filter(l => l.trim()),
      gratitude: gratitude.filter(g => g.trim()),
      nextWeekFocus,
      energyLevel,
      productivityLevel,
      overallMood,
      completedAt: new Date().toISOString(),
    };

    if (editingWeekly) {
      saveWeeklyReviews(weeklyReviews.map(r => r.id === editingWeekly.id ? review : r));
    } else {
      saveWeeklyReviews([review, ...weeklyReviews]);
    }

    setShowReviewForm(false);
    setEditingWeekly(null);
  }

  function saveMonthlyReview() {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    const review: MonthlyReview = {
      id: editingMonthly?.id || `monthly_${Date.now()}`,
      month: monthKey,
      monthName: MONTHS[now.getMonth()],
      biggestWins: biggestWins.filter(w => w.trim()),
      areasToImprove: areasToImprove.filter(a => a.trim()),
      habitsFormed: habitsFormed.filter(h => h.trim()),
      goalsProgress: goalsProgress.filter(g => g.goal.trim()),
      lessonsLearned: lessonsLearned.filter(l => l.trim()),
      nextMonthGoals: nextMonthGoals.filter(g => g.trim()),
      overallRating,
      completedAt: new Date().toISOString(),
    };

    if (editingMonthly) {
      saveMonthlyReviews(monthlyReviews.map(r => r.id === editingMonthly.id ? review : r));
    } else {
      saveMonthlyReviews([review, ...monthlyReviews]);
    }

    setShowReviewForm(false);
    setEditingMonthly(null);
  }

  // List helpers
  function updateListItem(list: string[], index: number, value: string, setter: (list: string[]) => void) {
    const newList = [...list];
    newList[index] = value;
    setter(newList);
  }

  function addListItem(list: string[], setter: (list: string[]) => void) {
    setter([...list, '']);
  }

  function removeListItem(list: string[], index: number, setter: (list: string[]) => void) {
    if (list.length === 1) return;
    setter(list.filter((_, i) => i !== index));
  }

  // Calculate stats
  const thisWeek = getWeekRange(new Date());
  const hasThisWeekReview = weeklyReviews.some(r => r.weekStart === formatDate(thisWeek.start));
  const thisMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
  const hasThisMonthReview = monthlyReviews.some(r => r.month === thisMonth);

  const averageEnergy = weeklyReviews.length > 0
    ? (weeklyReviews.slice(0, 4).reduce((sum, r) => sum + r.energyLevel, 0) / Math.min(4, weeklyReviews.length)).toFixed(1)
    : '-';

  const averageProductivity = weeklyReviews.length > 0
    ? (weeklyReviews.slice(0, 4).reduce((sum, r) => sum + r.productivityLevel, 0) / Math.min(4, weeklyReviews.length)).toFixed(1)
    : '-';

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
          Revisoes
        </h1>
        <p className="text-neutral-textSecondary mt-1">
          Reflita sobre seu progresso e planeje o futuro
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-primary-main">{weeklyReviews.length}</p>
          <p className="text-xs text-neutral-textMuted">Revisoes semanais</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-secondary-main">{monthlyReviews.length}</p>
          <p className="text-xs text-neutral-textMuted">Revisoes mensais</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-accent-warning">{averageEnergy}</p>
          <p className="text-xs text-neutral-textMuted">Energia media (4 sem)</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-accent-success">{averageProductivity}</p>
          <p className="text-xs text-neutral-textMuted">Produtividade media</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={startWeeklyReview}
          className={`p-6 rounded-2xl text-left transition-all ${
            hasThisWeekReview
              ? 'bg-accent-success/10 border-2 border-accent-success'
              : 'bg-gradient-to-br from-primary-main/10 to-secondary-main/10 hover:shadow-lg'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{hasThisWeekReview ? '✅' : '📅'}</span>
            <div>
              <h2 className="font-bold text-neutral-textPrimary">Revisao Semanal</h2>
              <p className="text-sm text-neutral-textSecondary">
                {formatDateRange(thisWeek.start, thisWeek.end)}
              </p>
            </div>
          </div>
          <p className="text-sm text-neutral-textMuted">
            {hasThisWeekReview
              ? 'Revisao desta semana completa! Clique para editar.'
              : 'Reflita sobre os ultimos 7 dias'}
          </p>
        </button>

        <button
          onClick={startMonthlyReview}
          className={`p-6 rounded-2xl text-left transition-all ${
            hasThisMonthReview
              ? 'bg-accent-success/10 border-2 border-accent-success'
              : 'bg-gradient-to-br from-secondary-main/10 to-purple-100 hover:shadow-lg'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{hasThisMonthReview ? '✅' : '📊'}</span>
            <div>
              <h2 className="font-bold text-neutral-textPrimary">Revisao Mensal</h2>
              <p className="text-sm text-neutral-textSecondary">
                {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}
              </p>
            </div>
          </div>
          <p className="text-sm text-neutral-textMuted">
            {hasThisMonthReview
              ? 'Revisao deste mes completa! Clique para editar.'
              : 'Analise o mes e defina metas'}
          </p>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'weekly'
              ? 'bg-primary-main text-white'
              : 'bg-neutral-background text-neutral-textSecondary hover:bg-neutral-border'
          }`}
        >
          Semanais ({weeklyReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'monthly'
              ? 'bg-primary-main text-white'
              : 'bg-neutral-background text-neutral-textSecondary hover:bg-neutral-border'
          }`}
        >
          Mensais ({monthlyReviews.length})
        </button>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {activeTab === 'weekly' ? (
          weeklyReviews.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-5xl block mb-3">📅</span>
              <p className="text-neutral-textMuted">Nenhuma revisao semanal ainda</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-border">
              {weeklyReviews.map(review => {
                const moodOption = MOOD_OPTIONS.find(m => m.value === review.overallMood);
                return (
                  <div
                    key={review.id}
                    onClick={() => openEditWeekly(review)}
                    className="p-4 hover:bg-neutral-background/50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{moodOption?.emoji}</span>
                        <div>
                          <p className="font-medium text-neutral-textPrimary">
                            Semana {formatDateRange(new Date(review.weekStart), new Date(review.weekEnd))}
                          </p>
                          <p className="text-xs text-neutral-textMuted">
                            {review.wins.length} vitorias • {review.challenges.length} desafios
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm">
                          <span title="Energia">⚡ {review.energyLevel}/5</span>
                          <span title="Produtividade">📈 {review.productivityLevel}/5</span>
                        </div>
                      </div>
                    </div>
                    {review.nextWeekFocus && (
                      <p className="text-sm text-neutral-textSecondary mt-2">
                        <strong>Foco:</strong> {review.nextWeekFocus}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          monthlyReviews.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-5xl block mb-3">📊</span>
              <p className="text-neutral-textMuted">Nenhuma revisao mensal ainda</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-border">
              {monthlyReviews.map(review => (
                <div
                  key={review.id}
                  onClick={() => openEditMonthly(review)}
                  className="p-4 hover:bg-neutral-background/50 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📊</span>
                      <div>
                        <p className="font-medium text-neutral-textPrimary">
                          {review.monthName} {review.month.split('-')[0]}
                        </p>
                        <p className="text-xs text-neutral-textMuted">
                          {review.biggestWins.length} vitorias • {review.nextMonthGoals.length} metas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-main">
                        {review.overallRating}/10
                      </div>
                      <p className="text-xs text-neutral-textMuted">Avaliacao geral</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-neutral-border">
              <h3 className="text-xl font-bold text-neutral-textPrimary">
                {activeTab === 'weekly' ? 'Revisao Semanal' : 'Revisao Mensal'}
              </h3>
              <p className="text-sm text-neutral-textSecondary">
                {activeTab === 'weekly'
                  ? formatDateRange(thisWeek.start, thisWeek.end)
                  : `${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`}
              </p>
            </div>

            <div className="p-6">
              {activeTab === 'weekly' ? (
                <>
                  {/* Mood */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-textPrimary mb-3">
                      Como foi sua semana?
                    </label>
                    <div className="flex gap-2">
                      {MOOD_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          onClick={() => setOverallMood(option.value as WeeklyReview['overallMood'])}
                          className={`flex-1 py-3 rounded-xl text-center transition-colors ${
                            overallMood === option.value
                              ? 'bg-primary-main text-white'
                              : 'bg-neutral-background hover:bg-neutral-border'
                          }`}
                        >
                          <span className="text-2xl block">{option.emoji}</span>
                          <span className="text-xs">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Energy & Productivity */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                        Nivel de energia ⚡
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(level => (
                          <button
                            key={level}
                            onClick={() => setEnergyLevel(level)}
                            className={`flex-1 py-2 rounded-lg text-center ${
                              energyLevel >= level
                                ? 'bg-yellow-400 text-white'
                                : 'bg-neutral-background text-neutral-textMuted'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                        Produtividade 📈
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(level => (
                          <button
                            key={level}
                            onClick={() => setProductivityLevel(level)}
                            className={`flex-1 py-2 rounded-lg text-center ${
                              productivityLevel >= level
                                ? 'bg-green-500 text-white'
                                : 'bg-neutral-background text-neutral-textMuted'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Wins */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                      🏆 Vitorias da semana
                    </label>
                    {wins.map((win, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={win}
                          onChange={(e) => updateListItem(wins, i, e.target.value, setWins)}
                          placeholder="O que deu certo?"
                          className="flex-1 px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                        />
                        <button
                          onClick={() => removeListItem(wins, i, setWins)}
                          className="px-3 text-neutral-textMuted hover:text-accent-error"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem(wins, setWins)}
                      className="text-sm text-primary-main hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>

                  {/* Challenges */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                      🎯 Desafios enfrentados
                    </label>
                    {challenges.map((challenge, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={challenge}
                          onChange={(e) => updateListItem(challenges, i, e.target.value, setChallenges)}
                          placeholder="O que foi dificil?"
                          className="flex-1 px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                        />
                        <button
                          onClick={() => removeListItem(challenges, i, setChallenges)}
                          className="px-3 text-neutral-textMuted hover:text-accent-error"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem(challenges, setChallenges)}
                      className="text-sm text-primary-main hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>

                  {/* Lessons */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                      💡 Licoes aprendidas
                    </label>
                    {lessons.map((lesson, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={lesson}
                          onChange={(e) => updateListItem(lessons, i, e.target.value, setLessons)}
                          placeholder="O que voce aprendeu?"
                          className="flex-1 px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                        />
                        <button
                          onClick={() => removeListItem(lessons, i, setLessons)}
                          className="px-3 text-neutral-textMuted hover:text-accent-error"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem(lessons, setLessons)}
                      className="text-sm text-primary-main hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>

                  {/* Gratitude */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                      🙏 Gratidao
                    </label>
                    {gratitude.map((item, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateListItem(gratitude, i, e.target.value, setGratitude)}
                          placeholder="Pelo que voce e grato?"
                          className="flex-1 px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                        />
                        <button
                          onClick={() => removeListItem(gratitude, i, setGratitude)}
                          className="px-3 text-neutral-textMuted hover:text-accent-error"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem(gratitude, setGratitude)}
                      className="text-sm text-primary-main hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>

                  {/* Next Week Focus */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                      🎯 Foco da proxima semana
                    </label>
                    <input
                      type="text"
                      value={nextWeekFocus}
                      onChange={(e) => setNextWeekFocus(e.target.value)}
                      placeholder="Qual sera sua prioridade?"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Overall Rating */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-textPrimary mb-3">
                      Avaliacao geral do mes: {overallRating}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={overallRating}
                      onChange={(e) => setOverallRating(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-neutral-textMuted">
                      <span>Muito dificil</span>
                      <span>Incrivel</span>
                    </div>
                  </div>

                  {/* Biggest Wins */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                      🏆 Maiores vitorias do mes
                    </label>
                    {biggestWins.map((win, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={win}
                          onChange={(e) => updateListItem(biggestWins, i, e.target.value, setBiggestWins)}
                          placeholder="Grande conquista"
                          className="flex-1 px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                        />
                        <button
                          onClick={() => removeListItem(biggestWins, i, setBiggestWins)}
                          className="px-3 text-neutral-textMuted hover:text-accent-error"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem(biggestWins, setBiggestWins)}
                      className="text-sm text-primary-main hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>

                  {/* Areas to Improve */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                      📈 Areas para melhorar
                    </label>
                    {areasToImprove.map((area, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={area}
                          onChange={(e) => updateListItem(areasToImprove, i, e.target.value, setAreasToImprove)}
                          placeholder="O que pode melhorar?"
                          className="flex-1 px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                        />
                        <button
                          onClick={() => removeListItem(areasToImprove, i, setAreasToImprove)}
                          className="px-3 text-neutral-textMuted hover:text-accent-error"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem(areasToImprove, setAreasToImprove)}
                      className="text-sm text-primary-main hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>

                  {/* Habits Formed */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                      ✅ Habitos formados/mantidos
                    </label>
                    {habitsFormed.map((habit, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={habit}
                          onChange={(e) => updateListItem(habitsFormed, i, e.target.value, setHabitsFormed)}
                          placeholder="Habito consolidado"
                          className="flex-1 px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                        />
                        <button
                          onClick={() => removeListItem(habitsFormed, i, setHabitsFormed)}
                          className="px-3 text-neutral-textMuted hover:text-accent-error"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem(habitsFormed, setHabitsFormed)}
                      className="text-sm text-primary-main hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>

                  {/* Lessons Learned */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                      💡 Licoes do mes
                    </label>
                    {lessonsLearned.map((lesson, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={lesson}
                          onChange={(e) => updateListItem(lessonsLearned, i, e.target.value, setLessonsLearned)}
                          placeholder="O que aprendeu?"
                          className="flex-1 px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                        />
                        <button
                          onClick={() => removeListItem(lessonsLearned, i, setLessonsLearned)}
                          className="px-3 text-neutral-textMuted hover:text-accent-error"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem(lessonsLearned, setLessonsLearned)}
                      className="text-sm text-primary-main hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>

                  {/* Next Month Goals */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-textPrimary mb-2">
                      🎯 Metas para o proximo mes
                    </label>
                    {nextMonthGoals.map((goal, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={goal}
                          onChange={(e) => updateListItem(nextMonthGoals, i, e.target.value, setNextMonthGoals)}
                          placeholder="Meta para o proximo mes"
                          className="flex-1 px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                        />
                        <button
                          onClick={() => removeListItem(nextMonthGoals, i, setNextMonthGoals)}
                          className="px-3 text-neutral-textMuted hover:text-accent-error"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem(nextMonthGoals, setNextMonthGoals)}
                      className="text-sm text-primary-main hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white p-6 border-t border-neutral-border flex gap-3">
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingWeekly(null);
                  setEditingMonthly(null);
                }}
                className="flex-1 py-3 rounded-xl border border-neutral-border text-neutral-textSecondary"
              >
                Cancelar
              </button>
              <button
                onClick={activeTab === 'weekly' ? saveWeeklyReview : saveMonthlyReview}
                className="flex-1 py-3 rounded-xl bg-primary-main text-white font-semibold"
              >
                Salvar Revisao
              </button>
            </div>
          </div>
        </div>
      )}

      <HelpButton content={getHelpContent('review')} />
    </div>
  );
}
