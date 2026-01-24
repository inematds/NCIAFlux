'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const menuItems = [
  { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
  { icon: '📋', label: 'Tarefas', href: '/dashboard/tasks' },
  { icon: '📊', label: 'Relatórios', href: '/dashboard/reports' },
  { icon: '👥', label: 'Equipes', href: '/dashboard/teams' },
  { icon: '⚙️', label: 'Configurações', href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check for demo user
    const storedUser = localStorage.getItem('nciaflux_demo_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Set demo user for development
      const demoUser = {
        id: 'demo-user',
        email: 'demo@nciaflux.com',
        name: 'Usuário Demo',
        role: 'manager',
      };
      localStorage.setItem('nciaflux_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('nciaflux_demo_user');
    router.push('/');
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
              N
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold text-neutral-textPrimary">
                NCIAFlux
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary-main text-white'
                        : 'text-neutral-textSecondary hover:bg-neutral-background'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

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
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
