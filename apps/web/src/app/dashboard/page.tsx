'use client';

import { useEffect, useState } from 'react';
import { userStorage, tasksStorage, StoredUser, StoredTask, getStorageKey } from '@/lib/storage';
import HelpButton from '@/components/HelpButton';
import { getHelpContent } from '@/lib/help-content';

// Mock data for managers
const MOCK_TEAM_MEMBERS = [
  { id: '1', name: 'Ana Silva', role: 'Desenvolvedor', tasksCompleted: 12, productivity: 85, mood: 'good' },
  { id: '2', name: 'Carlos Santos', role: 'Designer', tasksCompleted: 8, productivity: 72, mood: 'neutral' },
  { id: '3', name: 'Maria Oliveira', role: 'Analista', tasksCompleted: 15, productivity: 92, mood: 'good' },
  { id: '4', name: 'João Pereira', role: 'Desenvolvedor', tasksCompleted: 10, productivity: 68, mood: 'low' },
  { id: '5', name: 'Fernanda Costa', role: 'PM', tasksCompleted: 6, productivity: 80, mood: 'good' },
];

const MOCK_RECENT_ACTIVITIES = [
  { id: '1', user: 'Ana Silva', action: 'completou tarefa', target: 'Revisar código do módulo X', time: '5 min' },
  { id: '2', user: 'Carlos Santos', action: 'iniciou bloco de foco', target: '45 min', time: '12 min' },
  { id: '3', user: 'Maria Oliveira', action: 'fez check-in', target: 'Energia: 4/5', time: '20 min' },
  { id: '4', user: 'João Pereira', action: 'solicitou ajuda', target: 'Bloqueio em tarefa', time: '35 min' },
  { id: '5', user: 'Fernanda Costa', action: 'completou tarefa', target: 'Reunião de planejamento', time: '1h' },
];

const MOCK_WEEKLY_DATA = [
  { day: 'Seg', completed: 45, total: 52 },
  { day: 'Ter', completed: 38, total: 48 },
  { day: 'Qua', completed: 52, total: 55 },
  { day: 'Qui', completed: 41, total: 50 },
  { day: 'Sex', completed: 38, total: 45 },
  { day: 'Sáb', completed: 12, total: 15 },
  { day: 'Dom', completed: 8, total: 10 },
];

export default function DashboardPage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [tasks, setTasks] = useState<StoredTask[]>([]);
  const [hasProfile, setHasProfile] = useState(true);

  useEffect(() => {
    function loadData() {
      const storedUser = userStorage.get();
      setUser(storedUser);
      setTasks(tasksStorage.getAll());

      // Check if user has completed discovery
      const profile = localStorage.getItem(getStorageKey('nciaflux_cognitive_profile'));
      setHasProfile(!!profile);
    }

    loadData();

    // Listen for refresh events from chat
    const handleRefresh = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.type === 'tasks' || detail.type === 'all') {
        loadData();
      }
    };
    window.addEventListener('nciaflux-data-refresh', handleRefresh);
    return () => window.removeEventListener('nciaflux-data-refresh', handleRefresh);
  }, []);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isManagerOrAdmin = isManager || isAdmin;

  // Calculate user's personal stats from their tasks
  const personalStats = {
    totalTasks: tasks.length,
    pendingTasks: tasks.filter((t) => t.status === 'pending').length,
    inProgressTasks: tasks.filter((t) => t.status === 'in_progress').length,
    completedTasks: tasks.filter((t) => t.status === 'completed').length,
  };

  // Calculate productivity
  const productivity = personalStats.totalTasks > 0
    ? Math.round((personalStats.completedTasks / personalStats.totalTasks) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
          {isAdmin ? 'Painel de Administracao' : isManager ? 'Dashboard' : `Olá, ${user?.name?.split(' ')[0] || 'Usuário'}!`}
        </h1>
        <p className="text-neutral-textSecondary mt-1 capitalize">{today}</p>
      </div>

      {/* Discovery Prompt - For users who haven't completed it (not for admin) */}
      {!isManagerOrAdmin && !hasProfile && (
        <div className="mb-8 bg-gradient-to-r from-primary-main/10 to-secondary-main/10 rounded-2xl p-6 border border-primary-main/20">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🧠</span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-neutral-textPrimary mb-1">
                Descubra seu perfil cognitivo
              </h2>
              <p className="text-neutral-textSecondary mb-4">
                Responda algumas perguntas para entender melhor como seu cerebro funciona
                e receba sugestoes personalizadas.
              </p>
              <a
                href="/dashboard/discovery"
                className="inline-block px-6 py-2 rounded-xl bg-primary-main text-white font-medium hover:bg-primary-dark transition-colors"
              >
                Comecar descoberta
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - Different for admin vs manager vs user */}
      {isAdmin ? (
        // Admin Stats - Visao organizacional
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatCard
            icon="🏢"
            label="Organizacoes"
            value={1}
            trend=""
            trendUp
          />
          <StatCard
            icon="👥"
            label="Total de Usuarios"
            value={24}
            trend="+2 esta semana"
            trendUp
          />
          <StatCard
            icon="👔"
            label="Gestores"
            value={5}
            trend=""
            trendUp
          />
          <StatCard
            icon="📊"
            label="Engajamento"
            value="72%"
            trend="+3% esta semana"
            trendUp
          />
        </div>
      ) : isManager ? (
        // Manager Stats - Visao de gestao de equipes
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatCard
            icon="👥"
            label="Total de Usuarios"
            value={24}
            trend="+2 esta semana"
            trendUp
          />
          <StatCard
            icon="📋"
            label="Tarefas Ativas"
            value={156}
            trend="-12 vs ontem"
            trendUp={false}
          />
          <StatCard
            icon="✅"
            label="Concluídas Hoje"
            value={38}
            trend="+8 vs ontem"
            trendUp
          />
          <StatCard
            icon="📈"
            label="Produtividade Média"
            value="78%"
            trend="+5% esta semana"
            trendUp
          />
        </div>
      ) : (
        // User Stats - Personal
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatCard
            icon="📋"
            label="Total de Tarefas"
            value={personalStats.totalTasks}
            trend={personalStats.totalTasks === 0 ? 'Crie sua primeira tarefa!' : ''}
            trendUp
          />
          <StatCard
            icon="⏳"
            label="Pendentes"
            value={personalStats.pendingTasks}
            trend=""
            trendUp
          />
          <StatCard
            icon="🔄"
            label="Em Progresso"
            value={personalStats.inProgressTasks}
            trend=""
            trendUp
          />
          <StatCard
            icon="✅"
            label="Concluídas"
            value={personalStats.completedTasks}
            trend={productivity > 0 ? `${productivity}% de conclusão` : ''}
            trendUp
          />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4">
            {isAdmin ? 'Visao Geral da Organizacao' : isManager ? 'Progresso Semanal da Equipe' : 'Seu Progresso'}
          </h2>
          {isAdmin ? (
            // Admin - Organization overview
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">🏢</span>
                <p className="text-neutral-textSecondary mb-2">Administracao da Organizacao</p>
                <p className="text-sm text-neutral-textMuted mb-4">
                  Gerencie usuarios, permissoes e configuracoes da organizacao.
                </p>
                <a
                  href="/dashboard/admin"
                  className="inline-block px-6 py-2 rounded-xl bg-primary-main text-white font-medium hover:bg-primary-dark transition-colors"
                >
                  Ir para Administracao
                </a>
              </div>
            </div>
          ) : isManager ? (
            <div className="h-64 flex items-end justify-between gap-2">
              {MOCK_WEEKLY_DATA.map((day) => {
                const percentage = (day.completed / day.total) * 100;
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-neutral-background rounded-lg overflow-hidden h-48 flex flex-col-reverse">
                      <div
                        className="bg-primary-main rounded-lg transition-all duration-500"
                        style={{ height: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-neutral-textSecondary">{day.day}</span>
                    <span className="text-xs text-neutral-textMuted">
                      {day.completed}/{day.total}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            // User personal progress - show task breakdown
            <div className="h-64 flex items-center justify-center">
              {personalStats.totalTasks === 0 ? (
                <div className="text-center">
                  <span className="text-6xl mb-4 block">📝</span>
                  <p className="text-neutral-textSecondary">Você ainda não tem tarefas.</p>
                  <a
                    href="/dashboard/tasks"
                    className="inline-block mt-4 text-primary-main font-medium hover:underline"
                  >
                    Criar primeira tarefa →
                  </a>
                </div>
              ) : (
                <div className="w-full">
                  <div className="space-y-4">
                    <ProgressBar
                      label="Concluídas"
                      value={personalStats.completedTasks}
                      total={personalStats.totalTasks}
                      color="bg-accent-success"
                    />
                    <ProgressBar
                      label="Em Progresso"
                      value={personalStats.inProgressTasks}
                      total={personalStats.totalTasks}
                      color="bg-secondary-main"
                    />
                    <ProgressBar
                      label="Pendentes"
                      value={personalStats.pendingTasks}
                      total={personalStats.totalTasks}
                      color="bg-neutral-border"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity / Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4">
            {isAdmin ? 'Acoes de Admin' : isManager ? 'Atividade Recente' : 'Ações Rápidas'}
          </h2>
          {isAdmin ? (
            // Admin quick actions
            <div className="space-y-3">
              <QuickActionButton href="/dashboard/admin" icon="👥" label="Gerenciar Usuarios" />
              <QuickActionButton href="/dashboard/admin/reports" icon="📊" label="Relatorios Org" />
              <QuickActionButton href="/dashboard/settings" icon="⚙️" label="Configuracoes" />
            </div>
          ) : isManager ? (
            <div className="space-y-4">
              {MOCK_RECENT_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-light/20 rounded-full flex items-center justify-center text-sm">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-textPrimary">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-neutral-textSecondary">{activity.action}</span>
                    </p>
                    <p className="text-sm text-neutral-textMuted truncate">
                      {activity.target}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-textMuted whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            // User quick actions
            <div className="space-y-3">
              <QuickActionButton href="/dashboard/checkin" icon="😊" label="Fazer Check-in" />
              <QuickActionButton href="/dashboard/focus" icon="🎯" label="Timer de Foco" />
              <QuickActionButton href="/dashboard/tasks" icon="➕" label="Nova Tarefa" />
              <QuickActionButton href="/dashboard/crisis" icon="🆘" label="Preciso de Ajuda" highlight />
            </div>
          )}
        </div>
      </div>

      {/* Team Overview - Only for managers (not admin, they have separate admin page) */}
      {isManager && !isAdmin && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-textPrimary">
              Visão da Equipe
            </h2>
            <a href="/dashboard/teams" className="text-primary-main text-sm font-medium hover:underline">
              Ver todos
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-textSecondary">
                    Membro
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-textSecondary">
                    Função
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-neutral-textSecondary">
                    Tarefas Hoje
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-neutral-textSecondary">
                    Produtividade
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-neutral-textSecondary">
                    Humor
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TEAM_MEMBERS.map((member) => (
                  <tr key={member.id} className="border-b border-neutral-border last:border-0 hover:bg-neutral-background/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center font-medium text-primary-main">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-neutral-textPrimary">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-neutral-textSecondary">
                      {member.role}
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-neutral-textPrimary">
                      {member.tasksCompleted}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-2 bg-neutral-background rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              member.productivity >= 80
                                ? 'bg-accent-success'
                                : member.productivity >= 60
                                ? 'bg-secondary-main'
                                : 'bg-accent-error'
                            }`}
                            style={{ width: `${member.productivity}%` }}
                          />
                        </div>
                        <span className="text-sm text-neutral-textSecondary">
                          {member.productivity}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-2xl">
                        {member.mood === 'good' ? '😊' : member.mood === 'neutral' ? '😐' : '😔'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* My Tasks - Only for regular users (not admin or manager) */}
      {!isManagerOrAdmin && tasks.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-textPrimary">
              Minhas Tarefas Recentes
            </h2>
            <a href="/dashboard/tasks" className="text-primary-main text-sm font-medium hover:underline">
              Ver todas
            </a>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-xl bg-neutral-background/50"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${
                    task.status === 'completed'
                      ? 'bg-accent-success'
                      : task.status === 'in_progress'
                      ? 'bg-secondary-main'
                      : 'bg-neutral-border'
                  }`} />
                  <div>
                    <p className="font-medium text-neutral-textPrimary">{task.title}</p>
                    <p className="text-sm text-neutral-textSecondary">
                      Vence: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  task.priority === 'high'
                    ? 'bg-accent-error/10 text-accent-error'
                    : task.priority === 'medium'
                    ? 'bg-secondary-main/20 text-secondary-main'
                    : 'bg-neutral-background text-neutral-textSecondary'
                }`}>
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Button */}
      <HelpButton content={getHelpContent('dashboard')} />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
  trendUp,
}: {
  icon: string;
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trendUp
                ? 'bg-accent-success/10 text-accent-success'
                : 'bg-accent-error/10 text-accent-error'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary mt-3">
        {value}
      </p>
      <p className="text-sm text-neutral-textSecondary mt-1">{label}</p>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-neutral-textSecondary">{label}</span>
        <span className="font-medium text-neutral-textPrimary">{value}</span>
      </div>
      <div className="w-full h-3 bg-neutral-background rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function QuickActionButton({
  href,
  icon,
  label,
  highlight,
}: {
  href: string;
  icon: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${
        highlight
          ? 'bg-accent-error/10 hover:bg-accent-error/20 border border-accent-error/30'
          : 'bg-neutral-background/50 hover:bg-neutral-background'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className={`font-medium ${highlight ? 'text-accent-error' : 'text-neutral-textPrimary'}`}>
        {label}
      </span>
    </a>
  );
}
