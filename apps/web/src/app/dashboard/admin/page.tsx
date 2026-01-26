'use client';

import { useState, useEffect } from 'react';
import { userStorage, teamsStorage, getStorageKey } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import HelpButton from '@/components/HelpButton';
import { getHelpContent } from '@/lib/help-content';

// Types
interface Company {
  id: string;
  name: string;
  plan: 'free' | 'team' | 'enterprise';
  users: number;
  teams: number;
  createdAt: string;
  status: 'active' | 'suspended' | 'trial';
}

interface AdminTeam {
  id: string;
  name: string;
  description: string;
  companyId: string;
  managerEmail: string;
  members: number;
  createdAt: string;
}

const STORAGE_KEYS = {
  COMPANIES: 'nciaflux_admin_companies',
  ADMIN_TEAMS: 'nciaflux_admin_teams',
};

const PLAN_COLORS = {
  free: 'bg-gray-100 text-gray-700',
  team: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
  trial: 'bg-yellow-100 text-yellow-700',
};

type TabType = 'overview' | 'companies' | 'teams';

// Storage functions
function getCompanies(): Company[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(getStorageKey(STORAGE_KEYS.COMPANIES));
  return data ? JSON.parse(data) : [];
}

function saveCompanies(companies: Company[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(STORAGE_KEYS.COMPANIES), JSON.stringify(companies));
}

function getAdminTeams(): AdminTeam[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(getStorageKey(STORAGE_KEYS.ADMIN_TEAMS));
  return data ? JSON.parse(data) : [];
}

function saveAdminTeams(teams: AdminTeam[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(STORAGE_KEYS.ADMIN_TEAMS), JSON.stringify(teams));
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [adminTeams, setAdminTeams] = useState<AdminTeam[]>([]);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingTeam, setEditingTeam] = useState<AdminTeam | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const user = userStorage.get();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    setCompanies(getCompanies());
    setAdminTeams(getAdminTeams());
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="text-6xl block mb-4">🔒</span>
          <h1 className="text-2xl font-bold text-neutral-textPrimary mb-2">Acesso Restrito</h1>
          <p className="text-neutral-textSecondary">Apenas administradores podem acessar esta area.</p>
        </div>
      </div>
    );
  }

  // Stats
  const totalTeams = adminTeams.length;

  function handleSaveCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'users' | 'teams'>) {
    let updatedCompanies: Company[];
    if (editingCompany) {
      updatedCompanies = companies.map(c =>
        c.id === editingCompany.id
          ? { ...c, ...companyData }
          : c
      );
    } else {
      const newCompany: Company = {
        ...companyData,
        id: `company_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        users: 0,
        teams: 0,
      };
      updatedCompanies = [...companies, newCompany];
    }
    setCompanies(updatedCompanies);
    saveCompanies(updatedCompanies);
    setShowCompanyModal(false);
    setEditingCompany(null);
  }

  function handleDeleteCompany(id: string) {
    const updatedCompanies = companies.filter(c => c.id !== id);
    setCompanies(updatedCompanies);
    saveCompanies(updatedCompanies);
    // Also delete teams associated with this company
    const updatedTeams = adminTeams.filter(t => t.companyId !== id);
    setAdminTeams(updatedTeams);
    saveAdminTeams(updatedTeams);
  }

  function handleSaveTeam(teamData: Omit<AdminTeam, 'id' | 'createdAt' | 'members'>) {
    let updatedTeams: AdminTeam[];
    if (editingTeam) {
      updatedTeams = adminTeams.map(t =>
        t.id === editingTeam.id
          ? { ...t, ...teamData }
          : t
      );
    } else {
      const newTeam: AdminTeam = {
        ...teamData,
        id: `admin_team_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        members: 0,
      };
      updatedTeams = [...adminTeams, newTeam];

      // Update company teams count
      const updatedCompanies = companies.map(c =>
        c.id === teamData.companyId
          ? { ...c, teams: c.teams + 1 }
          : c
      );
      setCompanies(updatedCompanies);
      saveCompanies(updatedCompanies);

      // Also add to teamsStorage so manager can see it
      teamsStorage.add({
        name: teamData.name,
        description: teamData.description,
        ownerId: 'admin',
        members: [{
          id: `manager_${Date.now()}`,
          name: 'Gestor',
          email: teamData.managerEmail,
          role: 'manager',
          status: 'active',
          productivity: 80,
          lastCheckIn: 'Aguardando',
        }],
      });
    }
    setAdminTeams(updatedTeams);
    saveAdminTeams(updatedTeams);
    setShowTeamModal(false);
    setEditingTeam(null);
  }

  function handleDeleteTeam(id: string) {
    const team = adminTeams.find(t => t.id === id);
    const updatedTeams = adminTeams.filter(t => t.id !== id);
    setAdminTeams(updatedTeams);
    saveAdminTeams(updatedTeams);

    // Update company teams count
    if (team) {
      const updatedCompanies = companies.map(c =>
        c.id === team.companyId
          ? { ...c, teams: Math.max(0, c.teams - 1) }
          : c
      );
      setCompanies(updatedCompanies);
      saveCompanies(updatedCompanies);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏢</span>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
            Painel Administrativo
          </h1>
        </div>
        <p className="text-neutral-textSecondary">
          Gerencie empresas e equipes da organizacao
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Visao Geral', icon: '📊' },
          { id: 'companies', label: 'Empresas', icon: '🏢' },
          { id: 'teams', label: 'Equipes', icon: '👔' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-main text-white'
                : 'bg-white text-neutral-textSecondary hover:bg-neutral-background'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏢</span>
                <span className="text-sm text-neutral-textSecondary">Empresas</span>
              </div>
              <p className="text-3xl font-bold text-neutral-textPrimary">{companies.length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">👔</span>
                <span className="text-sm text-neutral-textSecondary">Equipes</span>
              </div>
              <p className="text-3xl font-bold text-neutral-textPrimary">{totalTeams}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💎</span>
                <span className="text-sm text-neutral-textSecondary">Enterprise</span>
              </div>
              <p className="text-3xl font-bold text-primary-main">
                {companies.filter(c => c.plan === 'enterprise').length}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-neutral-textPrimary mb-4">Acoes Rapidas</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { setEditingCompany(null); setShowCompanyModal(true); }}
                className="px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                + Nova Empresa
              </button>
              <button
                onClick={() => { setEditingTeam(null); setShowTeamModal(true); }}
                className="px-4 py-2 bg-secondary-main text-white rounded-lg font-medium hover:bg-secondary-dark transition-colors"
              >
                + Nova Equipe
              </button>
            </div>
          </div>

          {/* Recent Companies */}
          {companies.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-neutral-textPrimary mb-4">Empresas Recentes</h3>
              <div className="space-y-3">
                {companies.slice(0, 5).map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-3 bg-neutral-background rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-main/10 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🏢</span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-textPrimary">{company.name}</p>
                        <p className="text-sm text-neutral-textMuted">{company.teams} equipes</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${PLAN_COLORS[company.plan]}`}>
                      {company.plan.charAt(0).toUpperCase() + company.plan.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-neutral-textSecondary">{companies.length} empresas cadastradas</p>
            <button
              onClick={() => { setEditingCompany(null); setShowCompanyModal(true); }}
              className="bg-primary-main text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              + Nova Empresa
            </button>
          </div>

          {companies.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <span className="text-5xl block mb-4">🏢</span>
              <h3 className="text-lg font-semibold text-neutral-textPrimary mb-2">Nenhuma empresa cadastrada</h3>
              <p className="text-neutral-textSecondary mb-6">Crie sua primeira empresa para comecar.</p>
              <button
                onClick={() => { setEditingCompany(null); setShowCompanyModal(true); }}
                className="bg-primary-main text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                + Criar Empresa
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-background">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-medium text-neutral-textSecondary">Empresa</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Plano</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Equipes</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Status</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Criada em</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id} className="border-b border-neutral-border last:border-0 hover:bg-neutral-background/50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-main/10 rounded-lg flex items-center justify-center">
                              <span className="text-lg">🏢</span>
                            </div>
                            <span className="font-medium text-neutral-textPrimary">{company.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${PLAN_COLORS[company.plan]}`}>
                            {company.plan.charAt(0).toUpperCase() + company.plan.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-medium">{company.teams}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[company.status]}`}>
                            {company.status === 'active' ? 'Ativo' : company.status === 'trial' ? 'Trial' : 'Suspenso'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center text-neutral-textSecondary">{company.createdAt}</td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setEditingCompany(company); setShowCompanyModal(true); }}
                              className="p-2 hover:bg-neutral-background rounded-lg"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setSelectedCompany(company)}
                              className="p-2 hover:bg-neutral-background rounded-lg"
                              title="Ver detalhes"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Tem certeza que deseja excluir esta empresa?')) {
                                  handleDeleteCompany(company.id);
                                }
                              }}
                              className="p-2 hover:bg-neutral-background rounded-lg text-accent-error"
                              title="Excluir"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-neutral-textSecondary">{adminTeams.length} equipes cadastradas</p>
            <button
              onClick={() => { setEditingTeam(null); setShowTeamModal(true); }}
              className="bg-primary-main text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              disabled={companies.length === 0}
            >
              + Nova Equipe
            </button>
          </div>

          {companies.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <span className="text-5xl block mb-4">🏢</span>
              <h3 className="text-lg font-semibold text-neutral-textPrimary mb-2">Crie uma empresa primeiro</h3>
              <p className="text-neutral-textSecondary mb-6">Voce precisa criar uma empresa antes de criar equipes.</p>
              <button
                onClick={() => setActiveTab('companies')}
                className="bg-primary-main text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Ir para Empresas
              </button>
            </div>
          ) : adminTeams.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <span className="text-5xl block mb-4">👔</span>
              <h3 className="text-lg font-semibold text-neutral-textPrimary mb-2">Nenhuma equipe cadastrada</h3>
              <p className="text-neutral-textSecondary mb-6">Crie sua primeira equipe e defina um gestor.</p>
              <button
                onClick={() => { setEditingTeam(null); setShowTeamModal(true); }}
                className="bg-primary-main text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                + Criar Equipe
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {adminTeams.map((team) => {
                const company = companies.find(c => c.id === team.companyId);
                return (
                  <div key={team.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-neutral-textPrimary">{team.name}</h3>
                        <p className="text-sm text-neutral-textMuted">{company?.name || 'Empresa desconhecida'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingTeam(team); setShowTeamModal(true); }}
                          className="p-2 hover:bg-neutral-background rounded-lg"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir esta equipe?')) {
                              handleDeleteTeam(team.id);
                            }
                          }}
                          className="p-2 hover:bg-neutral-background rounded-lg text-accent-error"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-neutral-textSecondary mb-4">{team.description}</p>

                    <div className="p-3 bg-neutral-background rounded-lg">
                      <p className="text-xs text-neutral-textMuted mb-1">Gestor</p>
                      <p className="font-medium text-neutral-textPrimary">{team.managerEmail}</p>
                    </div>

                    <p className="text-xs text-neutral-textMuted mt-3">Criada em {team.createdAt}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Company Modal */}
      {showCompanyModal && (
        <CompanyModal
          company={editingCompany}
          onClose={() => { setShowCompanyModal(false); setEditingCompany(null); }}
          onSave={handleSaveCompany}
        />
      )}

      {/* Team Modal */}
      {showTeamModal && (
        <TeamModal
          team={editingTeam}
          companies={companies}
          onClose={() => { setShowTeamModal(false); setEditingTeam(null); }}
          onSave={handleSaveTeam}
        />
      )}

      {/* Company Details Modal */}
      {selectedCompany && (
        <CompanyDetailsModal
          company={selectedCompany}
          teams={adminTeams.filter(t => t.companyId === selectedCompany.id)}
          onClose={() => setSelectedCompany(null)}
        />
      )}

      <HelpButton content={getHelpContent('admin')} />
    </div>
  );
}

function CompanyModal({
  company,
  onClose,
  onSave,
}: {
  company: Company | null;
  onClose: () => void;
  onSave: (data: Omit<Company, 'id' | 'createdAt' | 'users' | 'teams'>) => void;
}) {
  const [name, setName] = useState(company?.name || '');
  const [plan, setPlan] = useState<'free' | 'team' | 'enterprise'>(company?.plan || 'team');
  const [status, setStatus] = useState<'active' | 'suspended' | 'trial'>(company?.status || 'active');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name: name.trim(), plan, status });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-neutral-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-textPrimary">
            {company ? 'Editar Empresa' : 'Nova Empresa'}
          </h2>
          <button onClick={onClose} className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Ex: Empresa ABC"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Plano
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['free', 'team', 'enterprise'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                    plan === p
                      ? 'border-primary-main bg-primary-main/5'
                      : 'border-neutral-border hover:border-neutral-textMuted'
                  }`}
                >
                  <p className="font-medium text-neutral-textPrimary capitalize">{p}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'suspended' | 'trial')}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="active">Ativo</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspenso</option>
            </select>
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
              {company ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeamModal({
  team,
  companies,
  onClose,
  onSave,
}: {
  team: AdminTeam | null;
  companies: Company[];
  onClose: () => void;
  onSave: (data: Omit<AdminTeam, 'id' | 'createdAt' | 'members'>) => void;
}) {
  const [name, setName] = useState(team?.name || '');
  const [description, setDescription] = useState(team?.description || '');
  const [companyId, setCompanyId] = useState(team?.companyId || companies[0]?.id || '');
  const [managerEmail, setManagerEmail] = useState(team?.managerEmail || '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim() && managerEmail.trim() && companyId) {
      onSave({
        name: name.trim(),
        description: description.trim(),
        companyId,
        managerEmail: managerEmail.trim(),
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-neutral-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-textPrimary">
            {team ? 'Editar Equipe' : 'Nova Equipe'}
          </h2>
          <button onClick={onClose} className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Empresa
            </label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              required
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Nome da Equipe
            </label>
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
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Descricao
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main min-h-[80px]"
              placeholder="Descreva a equipe..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Email do Gestor
            </label>
            <input
              type="email"
              value={managerEmail}
              onChange={(e) => setManagerEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="gestor@empresa.com"
              required
            />
            <p className="text-xs text-neutral-textMuted mt-1">
              Quando o gestor fizer login, esta equipe aparecera na lista de gestao dele.
            </p>
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
              {team ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CompanyDetailsModal({
  company,
  teams,
  onClose,
}: {
  company: Company;
  teams: AdminTeam[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-auto">
        <div className="p-6 border-b border-neutral-border flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-neutral-textPrimary">{company.name}</h2>
          <button onClick={onClose} className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary">
            ×
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Company Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-background rounded-lg">
              <p className="text-sm text-neutral-textMuted">Plano</p>
              <p className="font-semibold text-neutral-textPrimary capitalize">{company.plan}</p>
            </div>
            <div className="p-4 bg-neutral-background rounded-lg">
              <p className="text-sm text-neutral-textMuted">Status</p>
              <p className="font-semibold text-neutral-textPrimary">
                {company.status === 'active' ? 'Ativo' : company.status === 'trial' ? 'Trial' : 'Suspenso'}
              </p>
            </div>
            <div className="p-4 bg-neutral-background rounded-lg">
              <p className="text-sm text-neutral-textMuted">Equipes</p>
              <p className="font-semibold text-neutral-textPrimary">{company.teams}</p>
            </div>
            <div className="p-4 bg-neutral-background rounded-lg">
              <p className="text-sm text-neutral-textMuted">Criada em</p>
              <p className="font-semibold text-neutral-textPrimary">{company.createdAt}</p>
            </div>
          </div>

          {/* Teams */}
          <div>
            <h3 className="font-semibold text-neutral-textPrimary mb-3">Equipes ({teams.length})</h3>
            {teams.length === 0 ? (
              <p className="text-neutral-textMuted text-sm">Nenhuma equipe cadastrada para esta empresa.</p>
            ) : (
              <div className="space-y-2">
                {teams.map((team) => (
                  <div key={team.id} className="p-3 bg-neutral-background rounded-lg">
                    <p className="font-medium text-neutral-textPrimary">{team.name}</p>
                    <p className="text-sm text-neutral-textMuted">Gestor: {team.managerEmail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
