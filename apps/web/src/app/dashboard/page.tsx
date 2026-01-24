'use client';

// Mock data
const MOCK_STATS = {
  totalUsers: 24,
  activeTasks: 156,
  completedToday: 38,
  averageProductivity: 78,
};

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
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
          Dashboard
        </h1>
        <p className="text-neutral-textSecondary mt-1 capitalize">{today}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          icon="👥"
          label="Total de Usuários"
          value={MOCK_STATS.totalUsers}
          trend="+2 esta semana"
          trendUp
        />
        <StatCard
          icon="📋"
          label="Tarefas Ativas"
          value={MOCK_STATS.activeTasks}
          trend="-12 vs ontem"
          trendUp={false}
        />
        <StatCard
          icon="✅"
          label="Concluídas Hoje"
          value={MOCK_STATS.completedToday}
          trend="+8 vs ontem"
          trendUp
        />
        <StatCard
          icon="📈"
          label="Produtividade Média"
          value={`${MOCK_STATS.averageProductivity}%`}
          trend="+5% esta semana"
          trendUp
        />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4">
            Progresso Semanal
          </h2>
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
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4">
            Atividade Recente
          </h2>
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
        </div>
      </div>

      {/* Team Overview */}
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
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            trendUp
              ? 'bg-accent-success/10 text-accent-success'
              : 'bg-accent-error/10 text-accent-error'
          }`}
        >
          {trend}
        </span>
      </div>
      <p className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary mt-3">
        {value}
      </p>
      <p className="text-sm text-neutral-textSecondary mt-1">{label}</p>
    </div>
  );
}
