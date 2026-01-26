'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { userStorage, StoredUser } from '@/lib/storage';
import { userStatsService, storageModeService } from '@/lib/hybrid-storage';

type DemoRole = 'user' | 'manager' | 'admin';

// Usuarios padrao de demonstracao - mesmos da pagina demo
const DEMO_USERS: Record<DemoRole, { email: string; name: string }> = {
  user: { email: 'UserNF@gmail.com', name: 'Usuario Demo NF' },
  manager: { email: 'gestorNF@gmail.com', name: 'Gestor Demo NF' },
  admin: { email: 'adminNF@gmail.com', name: 'Admin Demo NF' },
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoRole, setDemoRole] = useState<DemoRole | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (userStorage.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  // Check for demo parameter and pre-fill email
  useEffect(() => {
    const demo = searchParams.get('demo') as DemoRole | null;
    if (demo && DEMO_USERS[demo]) {
      setDemoRole(demo);
      setEmail(DEMO_USERS[demo].email);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate inputs
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('Senha deve ter pelo menos 4 caracteres.');
      setIsLoading(false);
      return;
    }

    // Simulate network delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if this is a demo user login (by query param OR by email)
    const emailLower = email.toLowerCase();
    let detectedDemoRole: DemoRole | null = demoRole;

    // Also detect demo by email even without query param
    if (!detectedDemoRole) {
      for (const [role, config] of Object.entries(DEMO_USERS)) {
        if (config.email.toLowerCase() === emailLower) {
          detectedDemoRole = role as DemoRole;
          break;
        }
      }
    }

    const isDemoUser = detectedDemoRole !== null;

    // Create user with appropriate role
    const user: StoredUser = {
      id: isDemoUser ? `demo_${detectedDemoRole}` : `user_${Date.now()}`,
      email: email,
      name: isDemoUser
        ? DEMO_USERS[detectedDemoRole!].name
        : email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: isDemoUser ? detectedDemoRole! : 'user',
    };

    userStorage.set(user);

    // Demo users get sample data, regular users start clean
    if (isDemoUser) {
      loadDemoSampleData();
    } else {
      // Clear any existing demo data for new regular users
      clearExistingData();
    }

    // Update user stats in Supabase (async, don't block login)
    userStatsService.upsertUserStats(user).catch((err) => {
      console.error('Failed to update user stats:', err);
    });

    router.push('/dashboard');
  }

  // Clear existing data for new regular users (not demo)
  function clearExistingData() {
    const keysToKeep = ['nciaflux_user'];
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('nciaflux_') && !keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    // Make sure demo mode is off
    localStorage.removeItem('nciaflux_demo_mode');
  }

  // Load sample data for demo users (same as demo page)
  function loadDemoSampleData() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Sample tasks
    const tasks = [
      { id: 'task_1', title: 'Revisar relatorio mensal', content: 'Revisar relatorio mensal', status: 'completed', completed: true, projectId: 'proj_1', priority: 'high', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), dueDate: todayStr, period: 'morning' },
      { id: 'task_2', title: 'Preparar apresentacao para cliente', content: 'Preparar apresentacao para cliente', status: 'in_progress', completed: false, projectId: 'proj_1', priority: 'high', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), dueDate: todayStr, period: 'morning', isTop1: true },
      { id: 'task_3', title: 'Responder emails pendentes', content: 'Responder emails pendentes', status: 'completed', completed: true, priority: 'medium', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), dueDate: todayStr, period: 'morning' },
      { id: 'task_4', title: 'Agendar reuniao com equipe', content: 'Agendar reuniao com equipe', status: 'pending', completed: false, projectId: 'proj_2', priority: 'medium', createdAt: new Date().toISOString(), dueDate: todayStr, period: 'afternoon' },
      { id: 'task_5', title: 'Atualizar documentacao do projeto', content: 'Atualizar documentacao do projeto', status: 'pending', completed: false, projectId: 'proj_1', priority: 'low', createdAt: new Date().toISOString(), dueDate: todayStr, period: 'evening' },
      { id: 'task_9', title: 'Reuniao de kickoff projeto Beta', content: 'Reuniao de kickoff projeto Beta', status: 'pending', completed: false, projectId: 'proj_1', priority: 'high', createdAt: new Date().toISOString(), dueDate: tomorrow, period: 'morning' },
      { id: 'task_12', title: 'Apresentacao para diretoria', content: 'Apresentacao para diretoria', status: 'pending', completed: false, projectId: 'proj_2', priority: 'high', createdAt: new Date().toISOString(), dueDate: dayAfter, period: 'morning' },
      { id: 'task_14', title: 'Deadline Projeto Alpha', content: 'Deadline Projeto Alpha', status: 'pending', completed: false, projectId: 'proj_1', priority: 'high', createdAt: new Date().toISOString(), dueDate: nextWeek },
    ];

    const projects = [
      { id: 'proj_1', name: 'Projeto Alpha', color: 'blue', emoji: '🚀', status: 'active', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
      { id: 'proj_2', name: 'Financeiro Q1', color: 'green', emoji: '💰', status: 'active', createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
      { id: 'proj_3', name: 'Marketing Digital', color: 'purple', emoji: '📱', status: 'active', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
    ];

    const brainDump = {
      items: [
        { id: 'bd_1', text: 'Ideia para novo produto', category: 'planejar', createdAt: new Date().toISOString() },
        { id: 'bd_2', text: 'Ligar para Maria sobre parceria', category: 'ligar', createdAt: new Date().toISOString() },
        { id: 'bd_3', text: 'Enviar proposta para cliente X', category: 'email', createdAt: new Date().toISOString() },
      ],
      triaged: { hoje: ['bd_2'], estaSemana: ['bd_1'], delegar: [], algumDia: ['bd_3'] },
      top1: 'bd_2',
      bigGoal: 'Aumentar vendas em 20% este trimestre',
    };

    const calendarEvents = [
      { id: 'event_1', title: 'Reuniao de Equipe', date: todayStr, startTime: '09:00', endTime: '10:00', color: 'blue', isAllDay: false, repeat: 'weekly' },
      { id: 'event_2', title: 'Call com Cliente XYZ', date: todayStr, startTime: '14:00', endTime: '15:00', color: 'green', isAllDay: false, repeat: 'none' },
      { id: 'event_4', title: 'Kickoff Projeto Beta', date: tomorrow, startTime: '10:00', endTime: '11:30', color: 'blue', isAllDay: false, repeat: 'none' },
    ];

    const teams = [
      {
        id: 'team_1',
        name: 'Desenvolvimento',
        description: 'Equipe de desenvolvimento de software',
        ownerId: 'demo_manager',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        members: [
          { id: 'demo_manager', name: 'Gestor Demo NF', email: 'gestorNF@gmail.com', role: 'Líder', status: 'active', productivity: 85, lastCheckIn: 'Agora' },
          { id: 'member_1', name: 'Ana Silva', email: 'ana@email.com', role: 'Desenvolvedor', status: 'active', productivity: 92, lastCheckIn: '10 min' },
        ],
      },
    ];

    // Clear and load sample data
    const keysToKeep = ['nciaflux_user'];
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('nciaflux_') && !keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    localStorage.setItem('nciaflux_tasks', JSON.stringify(tasks));
    localStorage.setItem('nciaflux_projects', JSON.stringify(projects));
    localStorage.setItem('nciaflux_brain_dump', JSON.stringify(brainDump));
    localStorage.setItem('nciaflux_calendar_events', JSON.stringify(calendarEvents));
    localStorage.setItem('nciaflux_teams', JSON.stringify(teams));
    localStorage.setItem('nciaflux_chronotype', 'bear');
    localStorage.setItem('nciaflux_demo_mode', 'true');
  }

  return (
    <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 justify-center">
            <div className="w-12 h-12 bg-primary-main rounded-xl flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <span className="text-3xl font-bold text-primary-main">MentesBrilhantes</span>
          </Link>
          <p className="text-neutral-textSecondary mt-2">
            {demoRole ? 'Modo Demonstracao' : 'Entre na sua conta'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Demo Role Badge */}
          {demoRole && (
            <div className="mb-6 flex items-center justify-center gap-2 bg-primary-main/10 text-primary-main px-4 py-2 rounded-lg">
              <span className="text-lg">
                {demoRole === 'user' ? '👤' : demoRole === 'manager' ? '👥' : '🏢'}
              </span>
              <span className="font-medium">
                {demoRole === 'user' ? 'Usuario Demo' : demoRole === 'manager' ? 'Gestor Demo' : 'Admin Demo'}
              </span>
              <Link href="/demo" className="ml-2 text-sm underline hover:no-underline">
                Trocar
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-accent-error/10 text-accent-error px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!!demoRole}
                className={`w-full px-4 py-3 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all ${demoRole ? 'bg-neutral-background cursor-not-allowed' : ''}`}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-textSecondary mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-textMuted hover:text-neutral-textSecondary"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-neutral-border text-primary-main focus:ring-primary-main" />
                <span className="ml-2 text-sm text-neutral-textSecondary">Lembrar de mim</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary-main hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-main text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-textSecondary">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-primary-main font-medium hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        {/* Storage Mode Notice */}
        <div className="mt-6 bg-secondary-main/20 rounded-xl p-4 text-center">
          <p className="text-sm text-neutral-textSecondary">
            {demoRole ? (
              <>
                <strong>Modo Demo:</strong> Dados de exemplo serao carregados.
                <span className="block mt-1 text-xs">Use qualquer senha para entrar.</span>
              </>
            ) : (
              <>
                <strong>Plano Gratuito:</strong> Use qualquer email e senha para testar.
                {storageModeService.isStatsTrackingEnabled() && (
                  <span className="block mt-1 text-xs text-green-600">
                    Estatisticas de uso sincronizadas com o servidor.
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
