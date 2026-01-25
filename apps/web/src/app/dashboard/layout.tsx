'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { userStorage, clearAllStorage, StoredUser, getStorageKey, profileManager, LocalProfile, ViewMode } from '@/lib/storage';
import { storageModeService } from '@/lib/hybrid-storage';
import { ChatWidget } from '@/components/chat';
import { useChatStore } from '@/stores/chatStore';

// Status bar types
interface DayStatus {
  mood: string | null;
  energy: number | null;
  focusMinutes: number;
  focusSessions: number;
  pendingTasks: number;
  completedTasks: number;
}

const MOOD_EMOJI: Record<string, string> = {
  great: '😊',
  good: '🙂',
  okay: '😐',
  low: '😔',
  struggling: '😢',
};

const ENERGY_EMOJI: Record<number, string> = {
  1: '😴',
  2: '🥱',
  3: '😐',
  4: '⚡',
  5: '🔥',
};

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  section?: string;
  requiresRole?: 'manager' | 'admin';
}

const baseMenuItems: MenuItem[] = [
  // Principal
  { icon: '🏠', label: 'Dashboard', href: '/dashboard', section: 'Principal' },
  { icon: '📝', label: 'Brain Dump', href: '/dashboard/brain-dump' },
  { icon: '📅', label: 'Planner', href: '/dashboard/planner' },
  { icon: '🔄', label: 'Rotinas', href: '/dashboard/routines' },

  // Organizacao
  { icon: '📆', label: 'Agenda', href: '/dashboard/calendar', section: 'Organizacao' },
  { icon: '📁', label: 'Projetos', href: '/dashboard/projects' },
  { icon: '📋', label: 'Tarefas', href: '/dashboard/tasks' },
  { icon: '📓', label: 'Notas', href: '/dashboard/notes' },

  // Produtividade
  { icon: '🎯', label: 'Timer de Foco', href: '/dashboard/focus', section: 'Produtividade' },
  { icon: '😊', label: 'Check-in', href: '/dashboard/checkin' },
  { icon: '🆘', label: 'Modo Crise', href: '/dashboard/crisis' },

  // Perfil & Revisao
  { icon: '🧠', label: 'Cronotipo', href: '/dashboard/chronotype', section: 'Perfil' },
  { icon: '📊', label: 'Revisoes', href: '/dashboard/review' },
  { icon: '📈', label: 'Relatorios', href: '/dashboard/reports' },

  // Gestao (apenas para managers/admins)
  { icon: '👥', label: 'Equipes', href: '/dashboard/teams', section: 'Gestao', requiresRole: 'manager' },

  // Sistema
  { icon: '⚙️', label: 'Configuracoes', href: '/dashboard/settings', section: 'Sistema' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dayStatus, setDayStatus] = useState<DayStatus>({
    mood: null,
    energy: null,
    focusMinutes: 0,
    focusSessions: 0,
    pendingTasks: 0,
    completedTasks: 0,
  });
  const [profiles, setProfiles] = useState<LocalProfile[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('personal');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const openChat = useChatStore((state) => state.openChat);

  // Load day status from localStorage (uses user-prefixed keys)
  const loadDayStatus = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];

    // Get planner data for mood/energy (user-prefixed)
    const plannerKey = getStorageKey(`nciaflux_planner_${today}`);
    const plannerData = localStorage.getItem(plannerKey);
    let mood = null;
    let energy = null;
    if (plannerData) {
      const planner = JSON.parse(plannerData);
      mood = planner.mood || null;
      energy = planner.sleepQuality ? Math.min(5, Math.ceil(planner.sleepQuality / 2)) : null;
    }

    // Get check-in data (alternative source, user-prefixed)
    const checkinsKey = getStorageKey('nciaflux_checkins');
    const checkinsData = localStorage.getItem(checkinsKey);
    if (checkinsData && (!mood || !energy)) {
      const checkins = JSON.parse(checkinsData);
      if (checkins[today]) {
        mood = mood || checkins[today].mood;
        energy = energy || checkins[today].energy;
      }
    }

    // Get focus stats (user-prefixed)
    const focusKey = getStorageKey('nciaflux_focus_stats');
    const focusData = localStorage.getItem(focusKey);
    let focusMinutes = 0;
    let focusSessions = 0;
    if (focusData) {
      const focus = JSON.parse(focusData);
      if (focus[today]) {
        focusMinutes = focus[today].totalMinutes || 0;
        focusSessions = focus[today].sessions || 0;
      }
    }

    // Get tasks (user-prefixed)
    const tasksKey = getStorageKey('nciaflux_tasks');
    const tasksData = localStorage.getItem(tasksKey);
    let pendingTasks = 0;
    let completedTasks = 0;
    if (tasksData) {
      const tasks = JSON.parse(tasksData);
      tasks.forEach((t: { status?: string; completed?: boolean; dueDate?: string }) => {
        const isDueToday = t.dueDate === today || !t.dueDate;
        if (isDueToday) {
          if (t.status === 'completed' || t.completed) {
            completedTasks++;
          } else if (t.status === 'pending' || t.status === 'in_progress') {
            pendingTasks++;
          }
        }
      });
    }

    setDayStatus({ mood, energy, focusMinutes, focusSessions, pendingTasks, completedTasks });
  }, []);

  useEffect(() => {
    // Check authentication
    const storedUser = userStorage.get();
    if (!storedUser) {
      // Not authenticated - redirect to login
      router.push('/login');
      return;
    }
    setUser(storedUser);
    setIsLoading(false);

    // Load profiles
    const allProfiles = profileManager.getProfiles();
    setProfiles(allProfiles);

    // Load view mode
    const currentViewMode = profileManager.getViewMode();
    setViewMode(currentViewMode);

    // Check if in demo mode
    const demoMode = localStorage.getItem(getStorageKey('nciaflux_demo_mode'));
    setIsDemoMode(demoMode === 'true');

    // Load day status
    loadDayStatus();

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Refresh status every 30 seconds
    const statusInterval = setInterval(loadDayStatus, 30000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(statusInterval);
    };
  }, [router, loadDayStatus]);

  function handleLogout() {
    clearAllStorage();
    router.push('/');
  }

  function handleSwitchProfile(profileId: string) {
    const profile = profileManager.switchProfile(profileId);
    if (profile) {
      // Update user storage with new profile
      userStorage.set({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        company: profile.company,
        avatar_url: profile.avatar_url,
      });
      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        company: profile.company,
        avatar_url: profile.avatar_url,
      });
      setViewMode('personal');
      setShowProfileMenu(false);
      loadDayStatus(); // Reload data for new profile
    }
  }

  function handleAddProfile() {
    setShowProfileMenu(false);
    router.push('/login?add_profile=true');
  }

  const canAccessManagement = user?.role === 'manager' || user?.role === 'admin';

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-textSecondary">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-neutral-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-neutral-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-main rounded-xl flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold text-neutral-textPrimary">
                MentesBrilhantes
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {baseMenuItems
              .filter((item) => {
                // Filter items based on role
                if (!item.requiresRole) return true;
                if (item.requiresRole === 'manager') {
                  return user?.role === 'manager' || user?.role === 'admin';
                }
                if (item.requiresRole === 'admin') {
                  return user?.role === 'admin';
                }
                return true;
              })
              .map((item, index, filteredItems) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const showSection = item.section && sidebarOpen;
              const prevItem = filteredItems[index - 1];
              const isFirstInSection = item.section && (!prevItem || prevItem.section !== item.section);

              return (
                <li key={item.href}>
                  {isFirstInSection && showSection && (
                    <div className="text-xs font-medium text-neutral-textMuted uppercase tracking-wider px-4 pt-4 pb-2">
                      {item.section}
                    </div>
                  )}
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary-main text-white'
                        : 'text-neutral-textSecondary hover:bg-neutral-background'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Storage Mode Indicator */}
        {sidebarOpen && (
          <div className="px-4 py-2 border-t border-neutral-border">
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${storageModeService.isStatsTrackingEnabled() ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <span className="text-neutral-textMuted">
                {storageModeService.isLocalMode() ? 'Dados locais' : 'Dados na nuvem'}
              </span>
            </div>
            {storageModeService.isStatsTrackingEnabled() && (
              <p className="text-[10px] text-neutral-textMuted mt-1 ml-4">
                Stats sincronizados
              </p>
            )}
          </div>
        )}

        {/* User & Profile Switcher */}
        <div className="p-4 border-t border-neutral-border relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 hover:bg-neutral-background rounded-lg p-1 -m-1 transition-colors"
          >
            <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-neutral-textPrimary truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-neutral-textMuted truncate">
                    {canAccessManagement
                      ? (viewMode === 'management' ? 'Visao Gestao' : 'Visao Pessoal')
                      : user?.email}
                  </p>
                </div>
                <span className="text-neutral-textMuted">
                  {showProfileMenu ? '▲' : '▼'}
                </span>
              </>
            )}
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && sidebarOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-white rounded-xl shadow-lg border border-neutral-border overflow-hidden z-50">
              {/* View Mode Toggle (for managers) */}
              {canAccessManagement && (
                <div className="p-3 border-b border-neutral-border">
                  <p className="text-xs text-neutral-textMuted mb-2">Modo de Visualizacao</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { profileManager.setViewMode('personal'); setViewMode('personal'); }}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === 'personal'
                          ? 'bg-primary-main text-white'
                          : 'bg-neutral-background text-neutral-textSecondary hover:bg-neutral-border'
                      }`}
                    >
                      Pessoal
                    </button>
                    <button
                      onClick={() => { profileManager.setViewMode('management'); setViewMode('management'); }}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === 'management'
                          ? 'bg-secondary-main text-white'
                          : 'bg-neutral-background text-neutral-textSecondary hover:bg-neutral-border'
                      }`}
                    >
                      Gestao
                    </button>
                  </div>
                </div>
              )}

              {/* Profiles List */}
              {profiles.length > 1 && (
                <div className="p-2 border-b border-neutral-border">
                  <p className="text-xs text-neutral-textMuted px-2 mb-1">Trocar Perfil</p>
                  {profiles.filter(p => p.id !== user?.id).map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => handleSwitchProfile(profile.id)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-background transition-colors"
                    >
                      <div className="w-8 h-8 bg-secondary-main rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {profile.name.charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-neutral-textPrimary">{profile.name}</p>
                        <p className="text-xs text-neutral-textMuted">{profile.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={handleAddProfile}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-neutral-textSecondary hover:bg-neutral-background transition-colors"
                >
                  <span>➕</span>
                  <span>Adicionar Perfil</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-accent-error hover:bg-accent-error/10 transition-colors"
                >
                  <span>🚪</span>
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-neutral-border text-neutral-textMuted hover:text-neutral-textPrimary transition-colors"
        >
          {sidebarOpen ? '←' : '→'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-secondary-main to-purple-500 text-white px-4 py-2 text-center text-sm flex items-center justify-center gap-3">
            <span>🎮 Voce esta no modo Demo com dados de exemplo</span>
            <Link
              href="/register"
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              Criar conta gratuita
            </Link>
          </div>
        )}

        {/* Status Bar */}
        <div className="bg-white border-b border-neutral-border px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
          {/* Time */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕐</span>
            <div>
              <p className="text-lg font-bold text-neutral-textPrimary tabular-nums">
                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-neutral-textMuted">
                {currentTime.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          {/* Mood & Energy */}
          <div className="flex items-center gap-4">
            {dayStatus.mood ? (
              <div className="flex items-center gap-1 px-3 py-1 bg-primary-main/10 rounded-lg">
                <span className="text-xl">{MOOD_EMOJI[dayStatus.mood] || '😐'}</span>
                <span className="text-sm text-neutral-textSecondary">Humor</span>
              </div>
            ) : (
              <Link
                href="/dashboard/checkin"
                className="flex items-center gap-1 px-3 py-1 bg-secondary-main/20 rounded-lg hover:bg-secondary-main/30 transition-colors"
              >
                <span className="text-xl">😊</span>
                <span className="text-sm text-secondary-dark">Check-in</span>
              </Link>
            )}
            {dayStatus.energy ? (
              <div className="flex items-center gap-1 px-3 py-1 bg-accent-success/10 rounded-lg">
                <span className="text-xl">{ENERGY_EMOJI[dayStatus.energy] || '😐'}</span>
                <span className="text-sm text-neutral-textSecondary">Energia</span>
              </div>
            ) : null}
          </div>

          {/* Focus Stats */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/focus"
              className="flex items-center gap-2 px-3 py-1 bg-primary-main/10 rounded-lg hover:bg-primary-main/20 transition-colors"
            >
              <span className="text-xl">🎯</span>
              <div className="text-sm">
                <span className="font-semibold text-primary-main">{dayStatus.focusMinutes} min</span>
                <span className="text-neutral-textMuted ml-1">foco</span>
              </div>
            </Link>
            {dayStatus.focusSessions > 0 && (
              <div className="text-sm text-neutral-textSecondary">
                {dayStatus.focusSessions} {dayStatus.focusSessions === 1 ? 'sessao' : 'sessoes'}
              </div>
            )}
          </div>

          {/* Tasks Summary */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/tasks"
              className="flex items-center gap-2 px-3 py-1 bg-secondary-main/10 rounded-lg hover:bg-secondary-main/20 transition-colors"
            >
              <span className="text-xl">📋</span>
              <div className="text-sm">
                <span className="font-semibold text-secondary-dark">{dayStatus.pendingTasks}</span>
                <span className="text-neutral-textMuted ml-1">pendentes</span>
              </div>
            </Link>
            {dayStatus.completedTasks > 0 && (
              <div className="flex items-center gap-1 text-sm text-accent-success">
                <span>✅</span>
                <span>{dayStatus.completedTasks}</span>
              </div>
            )}

            {/* Chat Button */}
            <button
              onClick={openChat}
              className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg hover:from-purple-500/20 hover:to-pink-500/20 transition-colors border border-purple-500/20"
              title="Chat com IA"
            >
              <span className="text-xl">💬</span>
              <span className="text-sm font-medium text-purple-600">Chat</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Version Footer */}
        <div className="bg-neutral-background border-t border-neutral-border px-4 py-2 text-center">
          <p className="text-xs text-neutral-textMuted">
            NeuroFluxo Mentes Brilhantes v1.2
          </p>
        </div>

        {/* AI Chat Widget */}
        <ChatWidget />
      </main>
    </div>
  );
}
