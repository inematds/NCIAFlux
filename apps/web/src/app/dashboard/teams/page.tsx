'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  teamsStorage,
  globalTeamsStorage,
  userStorage,
  invitationsStorage,
  invitationLogsStorage,
  StoredTeam,
  StoredTeamMember,
  StoredInvitation,
  InvitationLogEntry,
} from '@/lib/storage';
import { userStatsService } from '@/lib/hybrid-storage';
import HelpButton from '@/components/HelpButton';
import { getHelpContent } from '@/lib/help-content';
import {
  ALL_FEATURES,
  FeatureDefinition,
  getUserFeatureSettings,
  setUserFeatures,
  initializeTeamFeatures,
  setTeamFeatures,
  getEnabledFeaturesCount,
  resetUserFeaturesToDefaults,
  resetTeamFeaturesToDefaults,
} from '@/lib/feature-management-service';
import { getManagerDashboard, TeamDashboardData, DashboardAlert } from '@/lib/manager-dashboard-service';

const STATUS_CONFIG = {
  active: { label: 'Ativo', color: 'bg-accent-success', textColor: 'text-accent-success' },
  away: { label: 'Ausente', color: 'bg-secondary-main', textColor: 'text-secondary-dark' },
  offline: { label: 'Offline', color: 'bg-neutral-textMuted', textColor: 'text-neutral-textMuted' },
};

const CATEGORY_INFO: Record<string, { name: string; emoji: string }> = {
  productivity: { name: 'Produtividade', emoji: '⚡' },
  wellbeing: { name: 'Bem-estar', emoji: '💚' },
  social: { name: 'Social', emoji: '👥' },
  advanced: { name: 'Avancado', emoji: '✨' },
};

type TabType = 'teams' | 'my-features';
type DetailTab = 'members' | 'invitations' | 'features';

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<StoredTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<StoredTeam | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamInvitations, setTeamInvitations] = useState<StoredInvitation[]>([]);
  const [teamLogs, setTeamLogs] = useState<InvitationLogEntry[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('teams');
  const [detailTab, setDetailTab] = useState<DetailTab>('members');

  // Feature management state
  const [userFeatures, setUserFeaturesState] = useState<Record<string, boolean>>({});
  const [teamFeatures, setTeamFeaturesState] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Manager dashboard data
  const [teamDashboard, setTeamDashboard] = useState<TeamDashboardData | null>(null);
  const [teamAlerts, setTeamAlerts] = useState<DashboardAlert[]>([]);

  const user = userStorage.get();

  useEffect(() => {
    // Load teams from both global (admin-created) and personal storage
    const globalTeams = globalTeamsStorage.getAll();
    const personalTeams = teamsStorage.getAll();
    const allTeams = [...globalTeams, ...personalTeams];

    // Filter teams where user is owner or manager
    const userTeams = allTeams.filter(t =>
      t.ownerId === user?.id ||
      t.members.some(m => m.email?.toLowerCase() === user?.email?.toLowerCase() && m.role === 'manager')
    );

    setTeams(userTeams);
    loadUserFeatures();
  }, [user?.id, user?.email]);

  const isManager = user?.role === 'manager' || user?.role === 'admin' || teams.length > 0;

  useEffect(() => {
    if (selectedTeam) {
      loadTeamFeatures(selectedTeam.id, selectedTeam.name);
      loadTeamInvitations(selectedTeam.id);
      // Load dashboard data for this team
      const dashboard = getManagerDashboard(selectedTeam.id);
      setTeamDashboard(dashboard);
      setTeamAlerts(dashboard?.alerts || []);
    } else {
      setTeamDashboard(null);
      setTeamAlerts([]);
    }
  }, [selectedTeam]);

  function loadTeamInvitations(teamId: string) {
    const invitations = invitationsStorage.getByTeam(teamId);
    const logs = invitationLogsStorage.getByTeam(teamId);
    setTeamInvitations(invitations);
    setTeamLogs(logs);
  }

  function loadUserFeatures() {
    const settings = getUserFeatureSettings();
    setUserFeaturesState(settings.features);
  }

  function loadTeamFeatures(teamId: string, teamName: string) {
    const settings = initializeTeamFeatures(teamId, teamName);
    setTeamFeaturesState(settings.features);
  }

  const allMembers = teams.flatMap(t => t.members);
  const activeCount = allMembers.filter(m => m.status === 'active').length;

  function handleCreateTeam(name: string, description: string) {
    if (!user) return;
    teamsStorage.add({
      name,
      description,
      ownerId: user.id,
      members: [{
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'Lider',
        status: 'active',
        productivity: 85,
        lastCheckIn: 'Agora',
      }],
    });
    setTeams(teamsStorage.getAll());
    setShowAddModal(false);
    userStatsService.incrementTeamStats(user.email, 1);
  }

  function handleDeleteTeam(id: string) {
    teamsStorage.delete(id);
    setTeams(teamsStorage.getAll());
    setDeleteConfirm(null);
    setSelectedTeam(null);
  }

  function handleAddMember(teamId: string, member: Omit<StoredTeamMember, 'id'>) {
    const newMember: StoredTeamMember = {
      ...member,
      id: `member_${Date.now()}`,
    };
    teamsStorage.addMember(teamId, newMember);
    setTeams(teamsStorage.getAll());
    const updated = teamsStorage.getAll().find(t => t.id === teamId);
    if (updated) setSelectedTeam(updated);
    setShowAddMemberModal(false);
  }

  function handleRemoveMember(teamId: string, memberId: string) {
    // Find the member to log the removal
    const team = selectedTeam || teams.find(t => t.id === teamId);
    const member = team?.members.find(m => m.id === memberId);

    // Check if it's a global team or personal team
    const globalTeams = globalTeamsStorage.getAll();
    const globalTeam = globalTeams.find(t => t.id === teamId);

    if (globalTeam) {
      // Update global team
      const updatedMembers = globalTeam.members.filter(m => m.id !== memberId);
      globalTeamsStorage.update(teamId, { members: updatedMembers });

      // Log member removal
      if (member) {
        invitationLogsStorage.logMemberLeft(teamId, globalTeam.name, member.email, member.name);
      }

      // Reload teams
      const allGlobalTeams = globalTeamsStorage.getAll();
      const personalTeams = teamsStorage.getAll();
      const allTeams = [...allGlobalTeams, ...personalTeams];
      const userTeams = allTeams.filter(t =>
        t.ownerId === user?.id ||
        t.members.some(m => m.email?.toLowerCase() === user?.email?.toLowerCase() && m.role === 'manager')
      );
      setTeams(userTeams);
      const updated = allGlobalTeams.find(t => t.id === teamId);
      if (updated) setSelectedTeam(updated);
    } else {
      // Personal team
      teamsStorage.removeMember(teamId, memberId);
      setTeams(teamsStorage.getAll());
      const updated = teamsStorage.getAll().find(t => t.id === teamId);
      if (updated) setSelectedTeam(updated);
    }

    // Reload invitations
    loadTeamInvitations(teamId);
  }

  function handleSendInvitation(email: string, role: 'member' | 'manager') {
    if (!selectedTeam || !user) return;

    invitationsStorage.create({
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      email: email.toLowerCase(),
      invitedBy: user.name,
      invitedByEmail: user.email,
      status: 'pending',
      role,
    });

    loadTeamInvitations(selectedTeam.id);
    setShowInviteModal(false);
  }

  function handleCancelInvitation(invitationId: string) {
    if (!user) return;
    invitationsStorage.cancel(invitationId, user.name, user.email);
    if (selectedTeam) {
      loadTeamInvitations(selectedTeam.id);
    }
  }

  // Feature toggle handlers
  function handleUserFeatureToggle(featureId: string, enabled: boolean) {
    setUserFeaturesState(prev => ({ ...prev, [featureId]: enabled }));
    setHasChanges(true);
  }

  function handleTeamFeatureToggle(featureId: string, enabled: boolean) {
    setTeamFeaturesState(prev => ({ ...prev, [featureId]: enabled }));
    setHasChanges(true);
  }

  function handleToggleAllUserFeatures(enabled: boolean) {
    const newFeatures: Record<string, boolean> = {};
    ALL_FEATURES.forEach(f => { newFeatures[f.id] = enabled; });
    setUserFeaturesState(newFeatures);
    setHasChanges(true);
  }

  function handleToggleAllTeamFeatures(enabled: boolean) {
    const newFeatures: Record<string, boolean> = {};
    ALL_FEATURES.forEach(f => { newFeatures[f.id] = enabled; });
    setTeamFeaturesState(newFeatures);
    setHasChanges(true);
  }

  function handleResetUserFeatures() {
    resetUserFeaturesToDefaults();
    loadUserFeatures();
    setHasChanges(false);
  }

  function handleResetTeamFeatures() {
    if (!selectedTeam) return;
    resetTeamFeaturesToDefaults(selectedTeam.id);
    loadTeamFeatures(selectedTeam.id, selectedTeam.name);
    setHasChanges(false);
  }

  async function handleSaveUserFeatures() {
    setSaving(true);
    try {
      setUserFeatures(userFeatures);
      setHasChanges(false);
      // Redirect to dashboard with refresh
      router.push('/dashboard?refresh=' + Date.now());
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTeamFeatures() {
    if (!selectedTeam) return;
    setSaving(true);
    try {
      setTeamFeatures(selectedTeam.id, teamFeatures);
      setHasChanges(false);
      // Redirect to dashboard with refresh
      router.push('/dashboard?refresh=' + Date.now());
    } finally {
      setSaving(false);
    }
  }

  // Group features by category
  const groupedFeatures = ALL_FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, FeatureDefinition[]>);

  // For regular users, show a different view
  if (!isManager) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-primary-main/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">👥</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-textPrimary mb-2">
            Gestao de Equipes
          </h1>
          <p className="text-neutral-textSecondary mb-6 max-w-md mx-auto">
            Esta funcionalidade esta disponivel apenas para gestores e administradores.
          </p>
          <a
            href="/dashboard/tasks"
            className="inline-block bg-primary-main text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Ir para Minhas Tarefas
          </a>
        </div>
      </div>
    );
  }

  const userFeaturesCount = getEnabledFeaturesCount(userFeatures);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
            Painel de Gestao
          </h1>
          <p className="text-neutral-textSecondary mt-1">
            Gerencie equipes e configure recursos
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="flex border-b border-neutral-border">
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'teams'
                ? 'text-primary-main border-b-2 border-primary-main bg-primary-main/5'
                : 'text-neutral-textSecondary hover:text-neutral-textPrimary hover:bg-neutral-background/50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span>👥</span>
              Minhas Equipes
            </span>
          </button>
          <button
            onClick={() => setActiveTab('my-features')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'my-features'
                ? 'text-primary-main border-b-2 border-primary-main bg-primary-main/5'
                : 'text-neutral-textSecondary hover:text-neutral-textPrimary hover:bg-neutral-background/50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span>⚙️</span>
              Meus Recursos ({userFeaturesCount.enabled}/{userFeaturesCount.total})
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'teams' ? (
        <>
          {/* Teams Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-primary-main text-white' : 'text-neutral-textSecondary'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-primary-main text-white' : 'text-neutral-textSecondary'
                }`}
              >
                Lista
              </button>
            </div>
            {/* Info text for managers - only admin can create teams */}
            <div className="text-sm text-neutral-textMuted">
              Equipes gerenciadas por voce
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-sm text-neutral-textSecondary">Total de Equipes</p>
              <p className="text-3xl font-bold text-neutral-textPrimary mt-1">{teams.length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-sm text-neutral-textSecondary">Total de Membros</p>
              <p className="text-3xl font-bold text-neutral-textPrimary mt-1">{allMembers.length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-sm text-neutral-textSecondary">Membros Ativos</p>
              <p className="text-3xl font-bold text-accent-success mt-1">{activeCount}</p>
              <p className="text-xs text-neutral-textMuted mt-1">
                {allMembers.length > 0 ? Math.round((activeCount / allMembers.length) * 100) : 0}% engajamento
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-sm text-neutral-textSecondary">Alertas</p>
              <p className={`text-3xl font-bold mt-1 ${teamAlerts.length > 0 ? 'text-accent-error' : 'text-accent-success'}`}>
                {teamAlerts.length}
              </p>
              {teamAlerts.filter(a => a.severity === 'critical').length > 0 && (
                <p className="text-xs text-accent-error mt-1">
                  {teamAlerts.filter(a => a.severity === 'critical').length} critico(s)
                </p>
              )}
            </div>
          </div>

          {/* Alerts Section */}
          {teamAlerts.length > 0 && (
            <div className="bg-accent-error/5 border border-accent-error/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⚠️</span>
                <h3 className="font-medium text-neutral-textPrimary">Alertas da Equipe</h3>
              </div>
              <div className="space-y-2">
                {teamAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      alert.severity === 'critical' ? 'bg-accent-error/10' : 'bg-secondary-main/10'
                    }`}
                  >
                    <span className="text-lg">
                      {alert.type === 'inactive_member' ? '😴' :
                       alert.type === 'overdue_task' ? '⏰' :
                       alert.type === 'low_productivity' ? '📉' :
                       alert.type === 'low_mood' ? '😔' : '⚠️'}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-textPrimary text-sm">{alert.title}</p>
                      <p className="text-xs text-neutral-textMuted">{alert.description}</p>
                    </div>
                  </div>
                ))}
                {teamAlerts.length > 3 && (
                  <p className="text-sm text-neutral-textMuted text-center">
                    +{teamAlerts.length - 3} alerta(s) adicional(is)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Teams Grid/List */}
          {teams.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-primary-main/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-textPrimary mb-2">
                Nenhuma equipe atribuida
              </h3>
              <p className="text-neutral-textSecondary mb-6">
                Voce ainda nao foi designado como gestor de nenhuma equipe.
                <br />
                <span className="text-sm">Entre em contato com o administrador da organizacao.</span>
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => { setSelectedTeam(team); setDetailTab('members'); }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-textPrimary">{team.name}</h3>
                        <p className="text-sm text-neutral-textMuted">{team.description}</p>
                      </div>
                    </div>
                    <div className="flex -space-x-2 mb-4">
                      {team.members.slice(0, 4).map((member) => (
                        <div
                          key={member.id}
                          className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center font-medium text-primary-main border-2 border-white"
                          title={member.name}
                        >
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      ))}
                      {team.members.length > 4 && (
                        <div className="w-10 h-10 bg-neutral-background rounded-full flex items-center justify-center text-sm font-medium text-neutral-textSecondary border-2 border-white">
                          +{team.members.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-textSecondary">
                        {team.members.length} membro{team.members.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-accent-success font-medium">
                        {team.members.filter(m => m.status === 'active').length} ativo{team.members.filter(m => m.status === 'active').length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-3 bg-neutral-background border-t border-neutral-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-textSecondary">Produtividade</span>
                      <span className="font-medium text-primary-main">
                        {team.members.length > 0
                          ? Math.round(team.members.reduce((a, m) => a + m.productivity, 0) / team.members.length)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-background">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-medium text-neutral-textSecondary">Membro</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-neutral-textSecondary">Equipe</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-neutral-textSecondary">Funcao</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Status</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Produtividade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.flatMap(team =>
                      team.members.map(member => (
                        <tr key={`${team.id}-${member.id}`} className="border-b border-neutral-border last:border-0 hover:bg-neutral-background/50">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center font-medium text-primary-main">
                                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 ${STATUS_CONFIG[member.status].color} rounded-full border-2 border-white`} />
                              </div>
                              <div>
                                <p className="font-medium text-neutral-textPrimary">{member.name}</p>
                                <p className="text-sm text-neutral-textMuted">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-neutral-textSecondary">{team.name}</td>
                          <td className="py-4 px-6 text-neutral-textSecondary">{member.role}</td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[member.status].textColor}`}>
                              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[member.status].color}`} />
                              {STATUS_CONFIG[member.status].label}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-neutral-background rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    member.productivity >= 80 ? 'bg-accent-success' : member.productivity >= 60 ? 'bg-secondary-main' : 'bg-accent-error'
                                  }`}
                                  style={{ width: `${member.productivity}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{member.productivity}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* My Features Tab */
        <div className="space-y-4">
          {/* Actions Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-neutral-textPrimary">Recursos do Meu Perfil</p>
              <p className="text-sm text-neutral-textMuted">
                {userFeaturesCount.enabled} de {userFeaturesCount.total} recursos ativos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleAllUserFeatures(true)}
                className="px-3 py-2 text-sm bg-accent-success/10 text-accent-success rounded-lg hover:bg-accent-success/20 transition-colors"
              >
                Ativar Todos
              </button>
              <button
                onClick={() => handleToggleAllUserFeatures(false)}
                className="px-3 py-2 text-sm bg-accent-error/10 text-accent-error rounded-lg hover:bg-accent-error/20 transition-colors"
              >
                Desativar Todos
              </button>
              <button
                onClick={handleResetUserFeatures}
                className="px-3 py-2 text-sm bg-neutral-background text-neutral-textSecondary rounded-lg hover:bg-neutral-border transition-colors"
              >
                Restaurar Padrao
              </button>
            </div>
          </div>

          {/* Features by Category */}
          {Object.entries(groupedFeatures).map(([category, features]) => {
            const catInfo = CATEGORY_INFO[category];
            const enabledInCat = features.filter(f => userFeatures[f.id]).length;

            return (
              <div key={category} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 bg-neutral-background/50 border-b border-neutral-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{catInfo.emoji}</span>
                    <span className="font-medium text-neutral-textPrimary">{catInfo.name}</span>
                    <span className="text-sm text-neutral-textMuted">({enabledInCat}/{features.length})</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature) => {
                    const isEnabled = userFeatures[feature.id] ?? true;
                    return (
                      <div key={feature.id} className="p-4 border-b border-r border-neutral-border last:border-b-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{feature.icon}</span>
                            <div>
                              <p className="font-medium text-neutral-textPrimary">{feature.name}</p>
                              <p className="text-xs text-neutral-textMuted">{feature.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUserFeatureToggle(feature.id, !isEnabled)}
                            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                              isEnabled ? 'bg-accent-success' : 'bg-neutral-border'
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              isEnabled ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Save Bar for User Features */}
          {hasChanges && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-border shadow-lg p-4 z-40">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2 text-accent-warning">
                  <span>⚠️</span>
                  <span className="font-medium">Alteracoes nao salvas</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { loadUserFeatures(); setHasChanges(false); }}
                    className="px-4 py-2 text-neutral-textSecondary hover:text-neutral-textPrimary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveUserFeatures}
                    disabled={saving}
                    className="px-6 py-2 bg-primary-main text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : 'Salvar e Aplicar'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {hasChanges && <div className="h-20" />}
        </div>
      )}

      {/* Team Detail Modal with Tabs */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-neutral-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-textPrimary">{selectedTeam.name}</h2>
                <p className="text-sm text-neutral-textMuted">{selectedTeam.description}</p>
              </div>
              <button
                onClick={() => { setSelectedTeam(null); setHasChanges(false); }}
                className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary"
              >
                ×
              </button>
            </div>

            {/* Detail Tabs */}
            <div className="flex border-b border-neutral-border bg-neutral-background/50">
              <button
                onClick={() => setDetailTab('members')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  detailTab === 'members'
                    ? 'text-primary-main border-b-2 border-primary-main bg-white'
                    : 'text-neutral-textSecondary hover:text-neutral-textPrimary'
                }`}
              >
                👥 Membros ({selectedTeam.members.length})
              </button>
              <button
                onClick={() => setDetailTab('invitations')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  detailTab === 'invitations'
                    ? 'text-primary-main border-b-2 border-primary-main bg-white'
                    : 'text-neutral-textSecondary hover:text-neutral-textPrimary'
                }`}
              >
                📧 Convites {teamInvitations.filter(i => i.status === 'pending').length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-accent-warning text-white rounded-full">
                    {teamInvitations.filter(i => i.status === 'pending').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setDetailTab('features')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  detailTab === 'features'
                    ? 'text-primary-main border-b-2 border-primary-main bg-white'
                    : 'text-neutral-textSecondary hover:text-neutral-textPrimary'
                }`}
              >
                ⚙️ Recursos
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {detailTab === 'members' ? (
                <>
                  {/* Dashboard Overview */}
                  {teamDashboard && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                      <div className="bg-neutral-background rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-neutral-textPrimary">{teamDashboard.totalTasks}</p>
                        <p className="text-xs text-neutral-textMuted">Tarefas</p>
                      </div>
                      <div className="bg-accent-success/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-accent-success">{teamDashboard.completedTasks}</p>
                        <p className="text-xs text-neutral-textMuted">Concluidas</p>
                      </div>
                      <div className="bg-accent-error/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-accent-error">{teamDashboard.overdueTasks}</p>
                        <p className="text-xs text-neutral-textMuted">Atrasadas</p>
                      </div>
                      <div className="bg-primary-main/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-primary-main">{teamDashboard.avgProductivity}%</p>
                        <p className="text-xs text-neutral-textMuted">Produtividade</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {selectedTeam.members.map((member) => {
                      // Get enhanced stats from dashboard if available
                      const memberStats = teamDashboard?.members.find(
                        m => m.memberId === member.id || m.email === member.email
                      );
                      const displayProductivity = memberStats?.productivity ?? member.productivity;
                      const displayStatus = memberStats?.status ?? member.status;
                      return (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-neutral-background rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center font-medium text-primary-main">
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 ${STATUS_CONFIG[displayStatus].color} rounded-full border-2 border-white`} />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-textPrimary">{member.name}</p>
                            <p className="text-sm text-neutral-textMuted">{member.role}</p>
                            {memberStats && (
                              <p className="text-xs text-neutral-textMuted mt-0.5">
                                {memberStats.completedTasks}/{memberStats.totalTasks} tarefas • {memberStats.focusSessionsWeek} sessoes foco
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-primary-main">{displayProductivity}%</p>
                            <p className="text-xs text-neutral-textMuted">produtividade</p>
                          </div>
                          {member.id !== user?.id && (
                            <button
                              onClick={() => handleRemoveMember(selectedTeam.id, member.id)}
                              className="text-neutral-textMuted hover:text-accent-error p-1"
                              title="Remover membro"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="w-full mt-4 py-2 text-primary-main font-medium border-2 border-dashed border-neutral-border rounded-xl hover:bg-neutral-background transition-colors"
                  >
                    + Convidar por Email
                  </button>
                </>
              ) : detailTab === 'invitations' ? (
                /* Invitations Tab */
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-neutral-textMuted">
                      Gerencie convites e veja o historico
                    </p>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="px-3 py-1.5 text-sm bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      + Novo Convite
                    </button>
                  </div>

                  {/* Pending Invitations */}
                  {teamInvitations.filter(i => i.status === 'pending').length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-neutral-textPrimary mb-3">Convites Pendentes</h4>
                      <div className="space-y-2">
                        {teamInvitations
                          .filter(i => i.status === 'pending')
                          .map((invitation) => (
                            <div key={invitation.id} className="flex items-center justify-between p-3 bg-accent-warning/10 rounded-lg border border-accent-warning/20">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-accent-warning/20 rounded-full flex items-center justify-center">
                                  <span className="text-lg">📧</span>
                                </div>
                                <div>
                                  <p className="font-medium text-neutral-textPrimary">{invitation.email}</p>
                                  <p className="text-xs text-neutral-textMuted">
                                    Convidado em {new Date(invitation.createdAt).toLocaleDateString('pt-BR')} | Expira em {new Date(invitation.expiresAt).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs rounded ${
                                  invitation.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {invitation.role === 'manager' ? 'Gestor' : 'Membro'}
                                </span>
                                <button
                                  onClick={() => handleCancelInvitation(invitation.id)}
                                  className="p-1 text-neutral-textMuted hover:text-accent-error"
                                  title="Cancelar convite"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Invitation Log */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-textPrimary mb-3">Historico de Convites</h4>
                    {teamLogs.length === 0 ? (
                      <p className="text-sm text-neutral-textMuted text-center py-4">Nenhum registro ainda</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {teamLogs.map((log) => {
                          const actionConfig: Record<string, { icon: string; color: string; text: string }> = {
                            sent: { icon: '📤', color: 'text-blue-600', text: 'Convite enviado' },
                            accepted: { icon: '✅', color: 'text-accent-success', text: 'Convite aceito' },
                            declined: { icon: '❌', color: 'text-accent-error', text: 'Convite recusado' },
                            expired: { icon: '⏰', color: 'text-neutral-textMuted', text: 'Convite expirado' },
                            canceled: { icon: '🚫', color: 'text-accent-warning', text: 'Convite cancelado' },
                            member_left: { icon: '👋', color: 'text-neutral-textMuted', text: 'Membro saiu' },
                          };
                          const config = actionConfig[log.action] || { icon: '📋', color: 'text-neutral-textSecondary', text: log.action };

                          return (
                            <div key={log.id} className="flex items-start gap-3 p-3 bg-neutral-background/50 rounded-lg text-sm">
                              <span className="text-lg">{config.icon}</span>
                              <div className="flex-1">
                                <p className={`font-medium ${config.color}`}>
                                  {config.text}
                                </p>
                                <p className="text-neutral-textMuted">
                                  {log.email}
                                  {log.notes && <span className="ml-1">- {log.notes}</span>}
                                </p>
                                <p className="text-xs text-neutral-textMuted mt-1">
                                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                                  {log.performedBy && ` por ${log.performedBy}`}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {teamInvitations.filter(i => i.status === 'pending').length === 0 && teamLogs.length === 0 && (
                    <div className="text-center py-8">
                      <span className="text-4xl block mb-2">📧</span>
                      <p className="text-neutral-textSecondary">Nenhum convite enviado ainda</p>
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="mt-3 px-4 py-2 bg-primary-main text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                      >
                        Enviar Primeiro Convite
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Team Features Tab */
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-neutral-textMuted">
                      Configure quais recursos estao disponiveis para este time
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAllTeamFeatures(true)}
                        className="px-2 py-1 text-xs bg-accent-success/10 text-accent-success rounded hover:bg-accent-success/20"
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => handleToggleAllTeamFeatures(false)}
                        className="px-2 py-1 text-xs bg-accent-error/10 text-accent-error rounded hover:bg-accent-error/20"
                      >
                        Nenhum
                      </button>
                      <button
                        onClick={handleResetTeamFeatures}
                        className="px-2 py-1 text-xs bg-neutral-background text-neutral-textSecondary rounded hover:bg-neutral-border"
                      >
                        Padrao
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(groupedFeatures).map(([category, features]) => {
                      const catInfo = CATEGORY_INFO[category];
                      const enabledInCat = features.filter(f => teamFeatures[f.id]).length;

                      return (
                        <div key={category} className="border border-neutral-border rounded-xl overflow-hidden">
                          <div className="p-3 bg-neutral-background/50 flex items-center gap-2">
                            <span>{catInfo.emoji}</span>
                            <span className="font-medium text-sm text-neutral-textPrimary">{catInfo.name}</span>
                            <span className="text-xs text-neutral-textMuted">({enabledInCat}/{features.length})</span>
                          </div>
                          <div className="divide-y divide-neutral-border">
                            {features.map((feature) => {
                              const isEnabled = teamFeatures[feature.id] ?? true;
                              return (
                                <div key={feature.id} className="p-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{feature.icon}</span>
                                    <span className="text-sm text-neutral-textPrimary">{feature.name}</span>
                                  </div>
                                  <button
                                    onClick={() => handleTeamFeatureToggle(feature.id, !isEnabled)}
                                    className={`relative w-10 h-5 rounded-full transition-colors ${
                                      isEnabled ? 'bg-accent-success' : 'bg-neutral-border'
                                    }`}
                                  >
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                      isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                                    }`} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Save Button for Team Features */}
                  {hasChanges && (
                    <div className="mt-6 flex items-center justify-between p-4 bg-accent-warning/10 rounded-xl">
                      <span className="text-sm text-accent-warning font-medium">Alteracoes nao salvas</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { loadTeamFeatures(selectedTeam.id, selectedTeam.name); setHasChanges(false); }}
                          className="px-3 py-1.5 text-sm text-neutral-textSecondary hover:text-neutral-textPrimary"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveTeamFeatures}
                          disabled={saving}
                          className="px-4 py-1.5 text-sm bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
                        >
                          {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {showAddModal && (
        <AddTeamModal
          onClose={() => setShowAddModal(false)}
          onCreate={handleCreateTeam}
        />
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedTeam && (
        <AddMemberModal
          onClose={() => setShowAddMemberModal(false)}
          onAdd={(member) => handleAddMember(selectedTeam.id, member)}
        />
      )}

      {/* Invite Member Modal */}
      {showInviteModal && selectedTeam && (
        <InviteMemberModal
          teamName={selectedTeam.name}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleSendInvitation}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-neutral-textPrimary mb-2">
              Confirmar exclusao
            </h3>
            <p className="text-neutral-textSecondary mb-6">
              Tem certeza que deseja excluir esta equipe? Esta acao nao pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteTeam(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-accent-error text-white rounded-lg font-medium hover:bg-accent-error/90 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <HelpButton content={getHelpContent('teams')} />
    </div>
  );
}

function AddTeamModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, description: string) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim());
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-neutral-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-textPrimary">Nova Equipe</h2>
          <button onClick={onClose} className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">Nome da Equipe</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Ex: Marketing"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">Descricao</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main min-h-[80px]"
              placeholder="Descreva o objetivo da equipe..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Criar Equipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ onClose, onAdd }: { onClose: () => void; onAdd: (member: Omit<StoredTeamMember, 'id'>) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onAdd({
        name: name.trim(),
        email: email.trim(),
        role: role.trim() || 'Membro',
        status: 'active',
        productivity: 75,
        lastCheckIn: 'Agora',
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-neutral-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-textPrimary">Adicionar Membro</h2>
          <button onClick={onClose} className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Nome completo"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="email@empresa.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">Funcao</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Ex: Desenvolvedor"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InviteMemberModal({
  teamName,
  onClose,
  onInvite,
}: {
  teamName: string;
  onClose: () => void;
  onInvite: (email: string, role: 'member' | 'manager') => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'manager'>('member');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      onInvite(email.trim(), role);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-neutral-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-textPrimary">Convidar Membro</h2>
            <p className="text-sm text-neutral-textMuted">Equipe: {teamName}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="email@empresa.com"
              required
            />
            <p className="text-xs text-neutral-textMuted mt-1">
              Um convite sera enviado para este email. O usuario tem 7 dias para aceitar.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">Funcao na Equipe</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('member')}
                className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                  role === 'member'
                    ? 'border-primary-main bg-primary-main/5'
                    : 'border-neutral-border hover:border-neutral-textMuted'
                }`}
              >
                <p className="font-medium text-neutral-textPrimary">Membro</p>
                <p className="text-xs text-neutral-textMuted">Acesso padrao</p>
              </button>
              <button
                type="button"
                onClick={() => setRole('manager')}
                className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                  role === 'manager'
                    ? 'border-primary-main bg-primary-main/5'
                    : 'border-neutral-border hover:border-neutral-textMuted'
                }`}
              >
                <p className="font-medium text-neutral-textPrimary">Gestor</p>
                <p className="text-xs text-neutral-textMuted">Pode gerenciar equipe</p>
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Enviar Convite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
