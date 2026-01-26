'use client';

import { useState, useEffect } from 'react';
import { userStorage } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import HelpButton from '@/components/HelpButton';
import { getHelpContent } from '@/lib/help-content';

// Demo data types
interface Company {
  id: string;
  name: string;
  plan: 'free' | 'team' | 'enterprise';
  users: number;
  teams: number;
  createdAt: string;
  status: 'active' | 'suspended' | 'trial';
}

interface SystemUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: 'user' | 'manager' | 'admin';
  status: 'active' | 'inactive';
  lastLogin: string;
  tasksCompleted: number;
}

interface TeamOverview {
  id: string;
  name: string;
  company: string;
  members: number;
  productivity: number;
  activeNow: number;
}

// Demo data
const DEMO_COMPANIES: Company[] = [
  { id: '1', name: 'TechCorp Brasil', plan: 'enterprise', users: 150, teams: 12, createdAt: '2024-01-15', status: 'active' },
  { id: '2', name: 'Startup Inovacao', plan: 'team', users: 25, teams: 3, createdAt: '2024-06-20', status: 'active' },
  { id: '3', name: 'Consultoria ABC', plan: 'team', users: 45, teams: 5, createdAt: '2024-03-10', status: 'active' },
  { id: '4', name: 'Agencia Digital XYZ', plan: 'free', users: 8, teams: 1, createdAt: '2024-09-01', status: 'trial' },
  { id: '5', name: 'Financeira Segura', plan: 'enterprise', users: 200, teams: 18, createdAt: '2023-11-05', status: 'active' },
  { id: '6', name: 'E-commerce Plus', plan: 'team', users: 35, teams: 4, createdAt: '2024-07-12', status: 'suspended' },
];

const DEMO_USERS: SystemUser[] = [
  { id: '1', name: 'Ana Silva', email: 'ana@techcorp.com', company: 'TechCorp Brasil', role: 'admin', status: 'active', lastLogin: 'Agora', tasksCompleted: 234 },
  { id: '2', name: 'Carlos Santos', email: 'carlos@techcorp.com', company: 'TechCorp Brasil', role: 'manager', status: 'active', lastLogin: '5 min', tasksCompleted: 189 },
  { id: '3', name: 'Maria Oliveira', email: 'maria@startup.com', company: 'Startup Inovacao', role: 'user', status: 'active', lastLogin: '1h', tasksCompleted: 67 },
  { id: '4', name: 'Pedro Costa', email: 'pedro@abc.com', company: 'Consultoria ABC', role: 'manager', status: 'active', lastLogin: '2h', tasksCompleted: 156 },
  { id: '5', name: 'Julia Ferreira', email: 'julia@xyz.com', company: 'Agencia Digital XYZ', role: 'user', status: 'inactive', lastLogin: '3 dias', tasksCompleted: 23 },
  { id: '6', name: 'Lucas Mendes', email: 'lucas@financeira.com', company: 'Financeira Segura', role: 'admin', status: 'active', lastLogin: '30 min', tasksCompleted: 312 },
  { id: '7', name: 'Beatriz Lima', email: 'bia@ecommerce.com', company: 'E-commerce Plus', role: 'manager', status: 'inactive', lastLogin: '1 semana', tasksCompleted: 89 },
  { id: '8', name: 'Rafael Souza', email: 'rafael@techcorp.com', company: 'TechCorp Brasil', role: 'user', status: 'active', lastLogin: '15 min', tasksCompleted: 145 },
];

const DEMO_TEAMS: TeamOverview[] = [
  { id: '1', name: 'Desenvolvimento', company: 'TechCorp Brasil', members: 25, productivity: 87, activeNow: 18 },
  { id: '2', name: 'Marketing', company: 'TechCorp Brasil', members: 12, productivity: 79, activeNow: 8 },
  { id: '3', name: 'Produto', company: 'Startup Inovacao', members: 8, productivity: 92, activeNow: 6 },
  { id: '4', name: 'Vendas', company: 'Consultoria ABC', members: 15, productivity: 84, activeNow: 12 },
  { id: '5', name: 'Suporte', company: 'Financeira Segura', members: 30, productivity: 76, activeNow: 22 },
  { id: '6', name: 'Design', company: 'Agencia Digital XYZ', members: 5, productivity: 88, activeNow: 3 },
];

const PLAN_COLORS = {
  free: 'bg-gray-100 text-gray-700',
  team: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
  trial: 'bg-yellow-100 text-yellow-700',
  inactive: 'bg-gray-100 text-gray-600',
};

const ROLE_COLORS = {
  user: 'bg-gray-100 text-gray-700',
  manager: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700',
};

type TabType = 'overview' | 'companies' | 'users' | 'teams';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [companies, setCompanies] = useState<Company[]>(DEMO_COMPANIES);
  const [users] = useState<SystemUser[]>(DEMO_USERS);
  const [teams] = useState<TeamOverview[]>(DEMO_TEAMS);
  const user = userStorage.get();

  useEffect(() => {
    // Only admins can access this page
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
    }
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
  const totalUsers = companies.reduce((a, c) => a + c.users, 0);
  const totalTeams = companies.reduce((a, c) => a + c.teams, 0);
  const enterpriseCompanies = companies.filter(c => c.plan === 'enterprise').length;

  function handleAddCompany(company: Omit<Company, 'id' | 'createdAt'>) {
    const newCompany: Company = {
      ...company,
      id: `company_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCompanies([...companies, newCompany]);
    setShowAddCompanyModal(false);
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
          Gerencie empresas, usuarios e equipes do sistema
        </p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
          <span>⚠️</span>
          <span>Modo Demo - Dados simulados para demonstracao</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Visao Geral', icon: '📊' },
          { id: 'companies', label: 'Empresas', icon: '🏢' },
          { id: 'users', label: 'Usuarios', icon: '👥' },
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏢</span>
                <span className="text-sm text-neutral-textSecondary">Empresas</span>
              </div>
              <p className="text-3xl font-bold text-neutral-textPrimary">{companies.length}</p>
              <p className="text-sm text-accent-success mt-1">+2 este mes</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">👥</span>
                <span className="text-sm text-neutral-textSecondary">Usuarios</span>
              </div>
              <p className="text-3xl font-bold text-neutral-textPrimary">{totalUsers}</p>
              <p className="text-sm text-accent-success mt-1">+45 este mes</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">👔</span>
                <span className="text-sm text-neutral-textSecondary">Equipes</span>
              </div>
              <p className="text-3xl font-bold text-neutral-textPrimary">{totalTeams}</p>
              <p className="text-sm text-accent-success mt-1">+5 este mes</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💎</span>
                <span className="text-sm text-neutral-textSecondary">Enterprise</span>
              </div>
              <p className="text-3xl font-bold text-primary-main">{enterpriseCompanies}</p>
              <p className="text-sm text-neutral-textMuted mt-1">contratos ativos</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Companies */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-neutral-textPrimary mb-4">Top Empresas por Usuarios</h3>
              <div className="space-y-3">
                {companies
                  .sort((a, b) => b.users - a.users)
                  .slice(0, 5)
                  .map((company, i) => (
                    <div key={company.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary-main/10 flex items-center justify-center text-sm font-medium text-primary-main">
                          {i + 1}
                        </span>
                        <span className="text-neutral-textPrimary">{company.name}</span>
                      </div>
                      <span className="font-medium text-neutral-textSecondary">{company.users} usuarios</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-neutral-textPrimary mb-4">Usuarios Recentes Online</h3>
              <div className="space-y-3">
                {users
                  .filter(u => u.status === 'active')
                  .slice(0, 5)
                  .map((u) => (
                    <div key={u.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 bg-primary-light/20 rounded-full flex items-center justify-center text-sm font-medium text-primary-main">
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent-success rounded-full border-2 border-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-textPrimary">{u.name}</p>
                          <p className="text-xs text-neutral-textMuted">{u.company}</p>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-textMuted">{u.lastLogin}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Chart placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-neutral-textPrimary mb-4">Crescimento Mensal</h3>
            <div className="h-64 flex items-end justify-around gap-2 px-4">
              {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((month) => {
                const height = 30 + Math.random() * 70;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary-main/20 rounded-t-lg transition-all hover:bg-primary-main/40"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-neutral-textMuted">{month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-neutral-textSecondary">{companies.length} empresas cadastradas</p>
            <button
              onClick={() => setShowAddCompanyModal(true)}
              className="bg-primary-main text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              + Nova Empresa
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-background">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-medium text-neutral-textSecondary">Empresa</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Plano</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Usuarios</th>
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
                      <td className="py-4 px-6 text-center font-medium">{company.users}</td>
                      <td className="py-4 px-6 text-center font-medium">{company.teams}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[company.status]}`}>
                          {company.status === 'active' ? 'Ativo' : company.status === 'trial' ? 'Trial' : 'Suspenso'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-neutral-textSecondary">{company.createdAt}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 hover:bg-neutral-background rounded-lg" title="Editar">
                            ✏️
                          </button>
                          <button className="p-2 hover:bg-neutral-background rounded-lg" title="Ver detalhes">
                            👁️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-neutral-textSecondary">{users.length} usuarios no sistema (amostra)</p>
            <button className="bg-primary-main text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors">
              + Novo Usuario
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-background">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-medium text-neutral-textSecondary">Usuario</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-neutral-textSecondary">Empresa</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Papel</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Status</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Ultimo Login</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Tarefas</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-neutral-border last:border-0 hover:bg-neutral-background/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center font-medium text-primary-main">
                              {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 ${u.status === 'active' ? 'bg-accent-success' : 'bg-gray-400'} rounded-full border-2 border-white`} />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-textPrimary">{u.name}</p>
                            <p className="text-sm text-neutral-textMuted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-neutral-textSecondary">{u.company}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[u.role]}`}>
                          {u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Gestor' : 'Usuario'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[u.status]}`}>
                          {u.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-neutral-textSecondary">{u.lastLogin}</td>
                      <td className="py-4 px-6 text-center font-medium text-primary-main">{u.tasksCompleted}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 hover:bg-neutral-background rounded-lg" title="Editar">
                            ✏️
                          </button>
                          <button className="p-2 hover:bg-neutral-background rounded-lg" title="Resetar senha">
                            🔑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <p className="text-neutral-textSecondary">{teams.length} equipes no sistema (amostra)</p>

          <div className="grid lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-neutral-textPrimary">{team.name}</h3>
                    <p className="text-sm text-neutral-textMuted">{team.company}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-accent-success/10 rounded-full">
                    <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse" />
                    <span className="text-xs text-accent-success font-medium">{team.activeNow} online</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <p className="text-2xl font-bold text-neutral-textPrimary">{team.members}</p>
                    <p className="text-xs text-neutral-textMuted">membros</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-neutral-textSecondary">Produtividade</span>
                      <span className="font-medium text-primary-main">{team.productivity}%</span>
                    </div>
                    <div className="h-2 bg-neutral-background rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          team.productivity >= 80 ? 'bg-accent-success' : team.productivity >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${team.productivity}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button className="w-full py-2 text-primary-main font-medium border border-primary-main/30 rounded-lg hover:bg-primary-main/5 transition-colors">
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <AddCompanyModal
          onClose={() => setShowAddCompanyModal(false)}
          onAdd={handleAddCompany}
        />
      )}

      <HelpButton content={getHelpContent('admin')} />
    </div>
  );
}

function AddCompanyModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (company: Omit<Company, 'id' | 'createdAt'>) => void;
}) {
  const [name, setName] = useState('');
  const [plan, setPlan] = useState<'free' | 'team' | 'enterprise'>('team');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) {
      onAdd({
        name: name.trim(),
        plan,
        users: 0,
        teams: 0,
        status: plan === 'free' ? 'trial' : 'active',
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-neutral-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-textPrimary">Nova Empresa</h2>
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
              Criar Empresa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
