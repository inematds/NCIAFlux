'use client';

import { useState, useEffect } from 'react';
import { userStorage, tasksStorage, StoredUser, StoredTask } from '@/lib/storage';
import HelpButton from '@/components/HelpButton';
import { getHelpContent } from '@/lib/help-content';
import {
  getAggregatedManagerStats,
  getAllManagedTeamsDashboard,
  TeamDashboardData,
  MemberStats,
} from '@/lib/manager-dashboard-service';

export default function ReportsPage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [tasks, setTasks] = useState<StoredTask[]>([]);
  const [period, setPeriod] = useState('month');
  const [reportType, setReportType] = useState<'team' | 'individual'>('team');
  const [teamDashboards, setTeamDashboards] = useState<TeamDashboardData[]>([]);
  const [managerStats, setManagerStats] = useState({
    totalTeams: 0,
    totalMembers: 0,
    activeMembers: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    avgProductivity: 0,
    avgEngagement: 0,
    avgMood: 0,
    avgEnergy: 0,
    totalFocusSessions: 0,
    criticalAlerts: 0,
    warningAlerts: 0,
  });

  useEffect(() => {
    const storedUser = userStorage.get();
    setUser(storedUser);
    setTasks(tasksStorage.getAll());

    // Load manager data if user is manager
    if (storedUser && (storedUser.role === 'manager' || storedUser.role === 'admin')) {
      const dashboards = getAllManagedTeamsDashboard(storedUser.email);
      setTeamDashboards(dashboards);

      const aggregatedStats = getAggregatedManagerStats(storedUser.email);
      setManagerStats({
        totalTeams: aggregatedStats.totalTeams,
        totalMembers: aggregatedStats.totalMembers,
        activeMembers: aggregatedStats.activeMembers,
        totalTasks: aggregatedStats.totalTasks,
        completedTasks: aggregatedStats.completedTasks,
        overdueTasks: aggregatedStats.overdueTasks,
        avgProductivity: aggregatedStats.avgProductivity,
        avgEngagement: aggregatedStats.avgEngagement,
        avgMood: 0,
        avgEnergy: 0,
        totalFocusSessions: 0,
        criticalAlerts: aggregatedStats.criticalAlerts,
        warningAlerts: aggregatedStats.warningAlerts,
      });
    }
  }, []);

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  // Aggregate all members from all team dashboards
  const allMembers: MemberStats[] = teamDashboards.flatMap(d => d.members);

  // Calculate mood distribution from real check-in data
  const moodDistribution = [
    { mood: 'Otimo', count: allMembers.filter(m => m.lastCheckIn.mood === 5).length, color: 'bg-accent-success' },
    { mood: 'Bom', count: allMembers.filter(m => m.lastCheckIn.mood === 4).length, color: 'bg-primary-main' },
    { mood: 'Neutro', count: allMembers.filter(m => m.lastCheckIn.mood === 3).length, color: 'bg-secondary-main' },
    { mood: 'Baixo', count: allMembers.filter(m => m.lastCheckIn.mood && m.lastCheckIn.mood <= 2).length, color: 'bg-accent-error' },
  ];
  const totalMoods = moodDistribution.reduce((acc, m) => acc + m.count, 0) || 1; // Avoid division by zero

  // Calculate personal stats
  const personalStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === 'completed').length,
    pendingTasks: tasks.filter((t) => t.status === 'pending').length,
    inProgressTasks: tasks.filter((t) => t.status === 'in_progress').length,
    highPriority: tasks.filter((t) => t.priority === 'high').length,
    mediumPriority: tasks.filter((t) => t.priority === 'medium').length,
    lowPriority: tasks.filter((t) => t.priority === 'low').length,
  };

  const productivity = personalStats.totalTasks > 0
    ? Math.round((personalStats.completedTasks / personalStats.totalTasks) * 100)
    : 0;

  // Group tasks by category for personal view
  const tasksByCategory = tasks.reduce((acc, task) => {
    const cat = task.category || 'Sem Categoria';
    if (!acc[cat]) {
      acc[cat] = { completed: 0, total: 0 };
    }
    acc[cat].total++;
    if (task.status === 'completed') {
      acc[cat].completed++;
    }
    return acc;
  }, {} as Record<string, { completed: number; total: number }>);

  // For regular users, show personal report
  if (!isManager) {
    return (
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
              Meus Relatorios
            </h1>
            <p className="text-neutral-textSecondary mt-1">
              Analise detalhada do seu desempenho pessoal
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Ano</option>
            </select>
          </div>
        </div>

        {/* Personal Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-neutral-textSecondary mb-1">Sua Produtividade</p>
            <p className="text-3xl font-bold text-primary-main">{productivity}%</p>
            <p className="text-sm text-neutral-textMuted mt-1">
              {personalStats.completedTasks} de {personalStats.totalTasks} tarefas
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-neutral-textSecondary mb-1">Tarefas Concluidas</p>
            <p className="text-3xl font-bold text-accent-success">{personalStats.completedTasks}</p>
            <p className="text-sm text-neutral-textMuted mt-1">tarefas finalizadas</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-neutral-textSecondary mb-1">Em Progresso</p>
            <p className="text-3xl font-bold text-secondary-main">{personalStats.inProgressTasks}</p>
            <p className="text-sm text-neutral-textMuted mt-1">tarefas em andamento</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-neutral-textSecondary mb-1">Pendentes</p>
            <p className="text-3xl font-bold text-neutral-textPrimary">{personalStats.pendingTasks}</p>
            <p className="text-sm text-neutral-textMuted mt-1">aguardando inicio</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Task Status Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-textPrimary mb-6">
              Distribuicao por Status
            </h3>
            {personalStats.totalTasks === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl block mb-2">📊</span>
                  <p className="text-neutral-textSecondary">Sem tarefas para exibir</p>
                  <a
                    href="/dashboard/tasks"
                    className="inline-block mt-2 text-primary-main text-sm font-medium hover:underline"
                  >
                    Criar primeira tarefa
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ProgressItem
                  label="Concluidas"
                  value={personalStats.completedTasks}
                  total={personalStats.totalTasks}
                  color="bg-accent-success"
                />
                <ProgressItem
                  label="Em Progresso"
                  value={personalStats.inProgressTasks}
                  total={personalStats.totalTasks}
                  color="bg-secondary-main"
                />
                <ProgressItem
                  label="Pendentes"
                  value={personalStats.pendingTasks}
                  total={personalStats.totalTasks}
                  color="bg-neutral-border"
                />
              </div>
            )}
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-textPrimary mb-6">
              Distribuicao por Prioridade
            </h3>
            {personalStats.totalTasks === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl block mb-2">🎯</span>
                  <p className="text-neutral-textSecondary">Sem tarefas para exibir</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ProgressItem
                  label="Alta Prioridade"
                  value={personalStats.highPriority}
                  total={personalStats.totalTasks}
                  color="bg-accent-error"
                />
                <ProgressItem
                  label="Media Prioridade"
                  value={personalStats.mediumPriority}
                  total={personalStats.totalTasks}
                  color="bg-secondary-main"
                />
                <ProgressItem
                  label="Baixa Prioridade"
                  value={personalStats.lowPriority}
                  total={personalStats.totalTasks}
                  color="bg-accent-success"
                />
              </div>
            )}
          </div>

          {/* Tasks by Category */}
          <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-neutral-textPrimary mb-6">
              Conclusao por Categoria
            </h3>
            {Object.keys(tasksByCategory).length === 0 ? (
              <div className="h-32 flex items-center justify-center">
                <p className="text-neutral-textSecondary">Sem categorias para exibir</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(tasksByCategory).map(([category, data]) => {
                  const percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                  return (
                    <div key={category} className="p-4 bg-neutral-background/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-textPrimary">{category}</span>
                        <span className="text-sm text-neutral-textSecondary">
                          {data.completed}/{data.total}
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-background rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage >= 80 ? 'bg-accent-success' : percentage >= 50 ? 'bg-secondary-main' : 'bg-accent-error'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-neutral-textMuted mt-1">{percentage}% concluido</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Personal Insights */}
        <div className="bg-gradient-to-r from-primary-main to-primary-dark rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Resumo Pessoal</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm opacity-80 mb-2">Total de Tarefas</p>
              <p className="font-semibold text-2xl">{personalStats.totalTasks}</p>
              <p className="text-xs opacity-70 mt-1">tarefas criadas</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm opacity-80 mb-2">Taxa de Conclusao</p>
              <p className="font-semibold text-2xl">{productivity}%</p>
              <p className="text-xs opacity-70 mt-1">de produtividade</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm opacity-80 mb-2">Prioridades Altas</p>
              <p className="font-semibold text-2xl">{personalStats.highPriority}</p>
              <p className="text-xs opacity-70 mt-1">tarefas urgentes</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Manager view - team reports
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
            Relatorios
          </h1>
          <p className="text-neutral-textSecondary mt-1">
            Analise detalhada do desempenho da equipe
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
          <button className="bg-primary-main text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors">
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setReportType('team')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            reportType === 'team'
              ? 'bg-primary-main text-white'
              : 'bg-white text-neutral-textSecondary hover:bg-neutral-background'
          }`}
        >
          Relatorio da Equipe
        </button>
        <button
          onClick={() => setReportType('individual')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            reportType === 'individual'
              ? 'bg-primary-main text-white'
              : 'bg-white text-neutral-textSecondary hover:bg-neutral-background'
          }`}
        >
          Relatorios Individuais
        </button>
      </div>

      {reportType === 'team' ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-sm text-neutral-textSecondary mb-1">Produtividade Media</p>
              <p className="text-3xl font-bold text-primary-main">{managerStats.avgProductivity}%</p>
              <p className="text-sm text-neutral-textMuted mt-1">
                {managerStats.totalMembers} membro{managerStats.totalMembers !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-sm text-neutral-textSecondary mb-1">Tarefas Concluidas</p>
              <p className="text-3xl font-bold text-neutral-textPrimary">{managerStats.completedTasks}</p>
              <p className="text-sm text-neutral-textMuted mt-1">de {managerStats.totalTasks} total</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-sm text-neutral-textSecondary mb-1">Membros Ativos</p>
              <p className="text-3xl font-bold text-accent-success">{managerStats.activeMembers}</p>
              <p className="text-sm text-neutral-textMuted mt-1">{managerStats.avgEngagement}% engajamento</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-sm text-neutral-textSecondary mb-1">Alertas</p>
              <p className={`text-3xl font-bold ${managerStats.criticalAlerts > 0 ? 'text-accent-error' : 'text-accent-success'}`}>
                {managerStats.criticalAlerts + managerStats.warningAlerts}
              </p>
              <p className="text-sm text-neutral-textMuted mt-1">
                {managerStats.criticalAlerts > 0 ? `${managerStats.criticalAlerts} critico(s)` : 'Tudo em ordem'}
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Team Productivity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-textPrimary mb-6">
                Produtividade por Equipe
              </h3>
              {teamDashboards.length === 0 ? (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-neutral-textSecondary">Nenhuma equipe gerenciada</p>
                </div>
              ) : (
                <div className="h-48 flex items-end justify-between gap-4">
                  {teamDashboards.map((team) => (
                    <div key={team.teamId} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-sm font-medium text-neutral-textPrimary">{team.avgProductivity}%</span>
                      <div className="w-full bg-neutral-background rounded-lg overflow-hidden h-32 flex flex-col-reverse">
                        <div
                          className={`rounded-lg transition-all duration-500 ${
                            team.avgProductivity >= 80 ? 'bg-accent-success' : team.avgProductivity >= 60 ? 'bg-primary-main' : 'bg-accent-error'
                          }`}
                          style={{ height: `${team.avgProductivity}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-textMuted truncate max-w-full" title={team.teamName}>
                        {team.teamName.length > 10 ? team.teamName.slice(0, 10) + '...' : team.teamName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mood Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-textPrimary mb-6">
                Distribuicao de Humor
              </h3>
              <div className="space-y-4">
                {moodDistribution.map((mood) => (
                  <div key={mood.mood}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-textPrimary">{mood.mood}</span>
                      <span className="text-sm text-neutral-textSecondary">
                        {mood.count} ({Math.round((mood.count / totalMoods) * 100)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-neutral-background rounded-full overflow-hidden">
                      <div
                        className={`h-full ${mood.color} rounded-full transition-all duration-500`}
                        style={{ width: `${(mood.count / totalMoods) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Completion by Team */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-textPrimary mb-6">
                Conclusao por Equipe
              </h3>
              <div className="space-y-4">
                {teamDashboards.length === 0 ? (
                  <p className="text-neutral-textSecondary text-center py-4">Nenhuma equipe gerenciada</p>
                ) : (
                  teamDashboards.map((team) => {
                    const percentage = team.totalTasks > 0 ? Math.round((team.completedTasks / team.totalTasks) * 100) : 0;
                    return (
                      <div key={team.teamId}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-neutral-textPrimary">{team.teamName}</span>
                          <span className="text-sm text-neutral-textSecondary">
                            {team.completedTasks}/{team.totalTasks} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-3 bg-neutral-background rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentage >= 80 ? 'bg-accent-success' : percentage >= 60 ? 'bg-secondary-main' : 'bg-accent-error'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Top Members by Productivity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-textPrimary mb-6">
                Top Membros por Produtividade
              </h3>
              <div className="space-y-4">
                {allMembers.length === 0 ? (
                  <p className="text-neutral-textSecondary text-center py-4">Nenhum membro nas equipes</p>
                ) : (
                  [...allMembers]
                    .sort((a, b) => b.productivity - a.productivity)
                    .slice(0, 5)
                    .map((member) => (
                      <div key={member.memberId} className="flex items-center justify-between p-3 bg-neutral-background rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center font-medium text-primary-main text-sm">
                            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-textPrimary">{member.name}</p>
                            <p className="text-sm text-neutral-textMuted">
                              {member.completedTasks} tarefas • {member.focusSessionsWeek} sessoes
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            member.productivity >= 80 ? 'text-accent-success' : member.productivity >= 60 ? 'text-primary-main' : 'text-accent-error'
                          }`}>{member.productivity}%</p>
                          <p className="text-xs text-neutral-textMuted">produtividade</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Individual Reports */
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-background">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-neutral-textSecondary">
                    Membro
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">
                    Produtividade
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">
                    Tarefas Concluidas
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">
                    Sessoes de Foco
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">
                    Tendencia
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody>
                {allMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-textSecondary">
                      Nenhum membro nas equipes gerenciadas
                    </td>
                  </tr>
                ) : (
                  allMembers.map((member) => {
                    // Determine trend based on productivity level
                    const trend = member.productivity >= 80 ? 'up' : member.productivity >= 60 ? 'stable' : 'down';
                    return (
                      <tr
                        key={member.memberId}
                        className="border-b border-neutral-border last:border-0 hover:bg-neutral-background/50"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center font-medium text-primary-main">
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <span className="font-medium text-neutral-textPrimary block">{member.name}</span>
                              <span className="text-xs text-neutral-textMuted">{member.role}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 h-2 bg-neutral-background rounded-full overflow-hidden">
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
                            <span className="text-sm font-medium">{member.productivity}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center font-medium text-neutral-textPrimary">
                          {member.completedTasks}
                        </td>
                        <td className="py-4 px-6 text-center font-medium text-neutral-textPrimary">
                          {member.focusSessionsWeek}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`text-lg ${
                            trend === 'up'
                              ? 'text-accent-success'
                              : trend === 'down'
                              ? 'text-accent-error'
                              : 'text-neutral-textMuted'
                          }`}>
                            {trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="text-sm text-neutral-textMuted">
                            {member.status === 'active' ? '🟢' : member.status === 'away' ? '🟡' : '⚫'} {member.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="mt-8 bg-gradient-to-r from-primary-main to-primary-dark rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Insights das Equipes</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-sm opacity-80 mb-2">Total de Equipes</p>
            <p className="font-semibold">{managerStats.totalTeams}</p>
            <p className="text-xs opacity-70 mt-1">{managerStats.totalMembers} membros no total</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-sm opacity-80 mb-2">Membros Ativos</p>
            <p className="font-semibold">{managerStats.activeMembers}</p>
            <p className="text-xs opacity-70 mt-1">{managerStats.avgEngagement}% de engajamento</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-sm opacity-80 mb-2">Destaque</p>
            <p className="font-semibold">
              {allMembers.length > 0
                ? [...allMembers].sort((a, b) => b.productivity - a.productivity)[0]?.name || '-'
                : '-'}
            </p>
            <p className="text-xs opacity-70 mt-1">
              Maior produtividade: {allMembers.length > 0
                ? [...allMembers].sort((a, b) => b.productivity - a.productivity)[0]?.productivity || 0
                : 0}%
            </p>
          </div>
        </div>
      </div>

      <HelpButton content={getHelpContent('reports')} />
    </div>
  );
}

function ProgressItem({
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
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-neutral-textPrimary">{label}</span>
        <span className="text-sm text-neutral-textSecondary">
          {value} ({percentage}%)
        </span>
      </div>
      <div className="h-3 bg-neutral-background rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
