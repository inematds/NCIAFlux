'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { userStorage, clearAllStorage, StoredUser, getStorageKey, profileManager, teamsStorage, globalTeamsStorage } from '@/lib/storage';
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
  isPersonal?: boolean; // true = recursos pessoais (nao aparece para admin)
  isAdminOnly?: boolean; // true = so aparece para admin
  requiresManagedTeams?: boolean; // true = aparece se usuario gerencia equipes
}

const baseMenuItems: MenuItem[] = [
  // Principal
  { icon: '🏠', label: 'Dashboard', href: '/dashboard', section: 'Principal' },
  { icon: '📝', label: 'Brain Dump', href: '/dashboard/brain-dump', isPersonal: true },
  { icon: '📅', label: 'Planner', href: '/dashboard/planner', isPersonal: true },
  { icon: '🔄', label: 'Rotinas', href: '/dashboard/routines', isPersonal: true },

  // Organizacao
  { icon: '📆', label: 'Agenda', href: '/dashboard/calendar', section: 'Organizacao', isPersonal: true },
  { icon: '📁', label: 'Projetos', href: '/dashboard/projects', isPersonal: true },
  { icon: '📋', label: 'Tarefas', href: '/dashboard/tasks', isPersonal: true },
  { icon: '📓', label: 'Notas', href: '/dashboard/notes', isPersonal: true },

  // Produtividade
  { icon: '🎯', label: 'Timer de Foco', href: '/dashboard/focus', section: 'Produtividade', isPersonal: true },
  { icon: '😊', label: 'Check-in', href: '/dashboard/checkin', isPersonal: true },
  { icon: '🆘', label: 'Modo Crise', href: '/dashboard/crisis', isPersonal: true },
  { icon: '🎮', label: 'Gamificacao', href: '/dashboard/gamification', isPersonal: true },

  // Social
  { icon: '🤝', label: 'Parcerias', href: '/dashboard/partnerships', section: 'Social', isPersonal: true },
  { icon: '👪', label: 'Comunidades', href: '/dashboard/communities', isPersonal: true },

  // Perfil & Revisao
  { icon: '🧠', label: 'Cronotipo', href: '/dashboard/chronotype', section: 'Perfil', isPersonal: true },
  { icon: '📊', label: 'Revisoes', href: '/dashboard/review', isPersonal: true },
  { icon: '📈', label: 'Relatorios', href: '/dashboard/reports', isPersonal: true },
  { icon: '🔮', label: 'Adaptativo', href: '/dashboard/adaptive', isPersonal: true },

  // Gestao (aparece se usuario gerencia equipes)
  { icon: '👥', label: 'Equipes', href: '/dashboard/teams', section: 'Gestao', requiresManagedTeams: true },

  // Admin (apenas para admins - nao tem recursos pessoais)
  { icon: '🏢', label: 'Organizacao', href: '/dashboard/admin', section: 'Administracao', isAdminOnly: true },

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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [managedTeams, setManagedTeams] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
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
      // Not authenticated - redirect to login (full page to clear state)
      window.location.href = '/login';
      return;
    }
    setUser(storedUser);
    setIsLoading(false);

    // Load managed teams from BOTH global (admin-created) and personal storage
    const globalTeams = globalTeamsStorage.getAll();
    const personalTeams = teamsStorage.getAll();
    const allTeams = [...globalTeams, ...personalTeams];

    // DEBUG: Log what's being loaded
    console.log('[DEBUG] Global teams:', globalTeams);
    console.log('[DEBUG] Personal teams:', personalTeams);
    console.log('[DEBUG] User email:', storedUser.email);

    // Filter teams where user is owner or has manager role in members
    const userTeams = allTeams.filter(t => {
      const isOwner = t.ownerId === storedUser.id;
      const isManager = t.members.some(m =>
        m.email?.toLowerCase() === storedUser.email?.toLowerCase() && m.role === 'manager'
      );
      console.log('[DEBUG] Team:', t.name, '- isOwner:', isOwner, '- isManager:', isManager, '- members:', t.members);
      return isOwner || isManager;
    });

    console.log('[DEBUG] Filtered user teams:', userTeams);
    setManagedTeams(userTeams.map(t => ({ id: t.id, name: t.name })));

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

  function handleSelectTeam(teamId: string | null) {
    setSelectedTeamId(teamId);
    profileManager.setViewMode(teamId ? 'management' : 'personal');
    setShowProfileMenu(false);
  }

  const isAdmin = user?.role === 'admin';
  const canAccessManagement = user?.role === 'manager' || isAdmin || managedTeams.length > 0;

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
                const isAdmin = user?.role === 'admin';
                const isManager = user?.role === 'manager';
                const hasManagedTeams = managedTeams.length > 0;

                // Item que requer equipes gerenciadas - so mostra se usuario gerencia equipes
                if (item.requiresManagedTeams && !hasManagedTeams && !isAdmin) {
                  return false;
                }

                // Admin: NAO ve recursos pessoais, apenas administracao
                if (isAdmin) {
                  // Admin so ve: Dashboard, itens adminOnly, Equipes (se gerencia), e Configuracoes
                  if (item.isPersonal) return false;
                  if (item.requiresRole === 'manager' && !item.isAdminOnly) return false;
                  return true;
                }

                // Manager: Ve recursos pessoais + gestao, mas NAO ve adminOnly
                if (isManager) {
                  if (item.isAdminOnly) return false;
                  return true;
                }

                // Usuario comum: Ve recursos pessoais + Equipes (se gerencia), NAO ve admin
                if (item.requiresRole === 'manager') return false;
                if (item.requiresRole === 'admin') return false;
                if (item.isAdminOnly) return false;
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
                      ? (selectedTeamId
                        ? `Gestao: ${managedTeams.find(t => t.id === selectedTeamId)?.name || ''}`
                        : 'Visao Pessoal')
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
              {/* Context Selection (Pessoal + Teams) */}
              <div className="p-2 border-b border-neutral-border">
                <p className="text-xs text-neutral-textMuted px-2 mb-2">Contexto</p>
                {/* Pessoal option - always shown */}
                <button
                  onClick={() => handleSelectTeam(null)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
                    selectedTeamId === null
                      ? 'bg-primary-main/10 border border-primary-main'
                      : 'hover:bg-neutral-background'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                    selectedTeamId === null ? 'bg-primary-main' : 'bg-neutral-textMuted'
                  }`}>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-neutral-textPrimary">Pessoal</p>
                    <p className="text-xs text-neutral-textMuted">Minha visao pessoal</p>
                  </div>
                  {selectedTeamId === null && <span className="text-primary-main">✓</span>}
                </button>

                {/* Managed Teams - only for managers */}
                {canAccessManagement && managedTeams.length > 0 && (
                  <>
                    <p className="text-xs text-neutral-textMuted px-2 mt-3 mb-2">Equipes que gerencio</p>
                    {managedTeams.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => handleSelectTeam(team.id)}
                        className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
                          selectedTeamId === team.id
                            ? 'bg-secondary-main/10 border border-secondary-main'
                            : 'hover:bg-neutral-background'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                          selectedTeamId === team.id ? 'bg-secondary-main' : 'bg-neutral-textMuted'
                        }`}>
                          👥
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-neutral-textPrimary">{team.name}</p>
                          <p className="text-xs text-neutral-textMuted">Visao de gestao</p>
                        </div>
                        {selectedTeamId === team.id && <span className="text-secondary-main">✓</span>}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="p-2">
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

          {/* Admin: mostra apenas info de admin, nao recursos pessoais */}
          {isAdmin ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary-main/10 rounded-lg">
                <span className="text-xl">🏢</span>
                <span className="text-sm text-neutral-textSecondary">Modo Administrador</span>
              </div>
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-2 px-3 py-1 bg-secondary-main/10 rounded-lg hover:bg-secondary-main/20 transition-colors"
              >
                <span className="text-xl">👥</span>
                <span className="text-sm font-medium text-secondary-dark">Gerenciar</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Mood & Energy - apenas para usuarios e gestores */}
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
              </div>
            </>
          )}

          {/* Chat Button - disponivel para todos */}
          <button
            onClick={openChat}
            className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg hover:from-purple-500/20 hover:to-pink-500/20 transition-colors border border-purple-500/20"
            title="Chat com IA"
          >
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium text-purple-600">Chat</span>
          </button>
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
