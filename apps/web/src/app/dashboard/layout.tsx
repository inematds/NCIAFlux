'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { userStorage, clearAllStorage, StoredUser } from '@/lib/storage';
import { storageModeService } from '@/lib/hybrid-storage';

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  section?: string;
}

const menuItems: MenuItem[] = [
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

    // Check if in demo mode
    const demoMode = localStorage.getItem('nciaflux_demo_mode');
    setIsDemoMode(demoMode === 'true');
  }, [router]);

  function handleLogout() {
    clearAllStorage();
    router.push('/');
  }

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
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const showSection = item.section && sidebarOpen;
              const prevItem = menuItems[index - 1];
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

        {/* User */}
        <div className="p-4 border-t border-neutral-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-textPrimary truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-neutral-textMuted truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full mt-4 text-sm text-neutral-textSecondary hover:text-accent-error transition-colors text-left"
            >
              Sair
            </button>
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
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
