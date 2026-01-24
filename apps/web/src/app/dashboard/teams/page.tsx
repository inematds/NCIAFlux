'use client';

import { useState } from 'react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'away' | 'offline';
  productivity: number;
  lastCheckIn: string;
  avatar?: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
}

const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Desenvolvimento',
    description: 'Equipe de desenvolvimento de software',
    members: [
      { id: '1', name: 'Ana Silva', email: 'ana@empresa.com', role: 'Tech Lead', department: 'Eng', status: 'active', productivity: 92, lastCheckIn: '10:30' },
      { id: '2', name: 'João Pereira', email: 'joao@empresa.com', role: 'Dev Sênior', department: 'Eng', status: 'active', productivity: 85, lastCheckIn: '09:45' },
      { id: '3', name: 'Lucas Mendes', email: 'lucas@empresa.com', role: 'Dev Pleno', department: 'Eng', status: 'away', productivity: 78, lastCheckIn: '08:00' },
    ],
  },
  {
    id: '2',
    name: 'Design',
    description: 'Equipe de UX/UI Design',
    members: [
      { id: '4', name: 'Carlos Santos', email: 'carlos@empresa.com', role: 'UX Lead', department: 'Design', status: 'active', productivity: 88, lastCheckIn: '10:00' },
      { id: '5', name: 'Mariana Lima', email: 'mariana@empresa.com', role: 'UI Designer', department: 'Design', status: 'offline', productivity: 75, lastCheckIn: 'Ontem' },
    ],
  },
  {
    id: '3',
    name: 'Produto',
    description: 'Equipe de gestão de produto',
    members: [
      { id: '6', name: 'Fernanda Costa', email: 'fernanda@empresa.com', role: 'Product Manager', department: 'Produto', status: 'active', productivity: 90, lastCheckIn: '10:15' },
      { id: '7', name: 'Ricardo Souza', email: 'ricardo@empresa.com', role: 'Product Owner', department: 'Produto', status: 'active', productivity: 82, lastCheckIn: '09:30' },
    ],
  },
];

const STATUS_CONFIG = {
  active: { label: 'Ativo', color: 'bg-accent-success', textColor: 'text-accent-success' },
  away: { label: 'Ausente', color: 'bg-secondary-main', textColor: 'text-secondary-dark' },
  offline: { label: 'Offline', color: 'bg-neutral-textMuted', textColor: 'text-neutral-textMuted' },
};

export default function TeamsPage() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const allMembers = MOCK_TEAMS.flatMap(t => t.members);
  const activeCount = allMembers.filter(m => m.status === 'active').length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
            Gestão de Equipes
          </h1>
          <p className="text-neutral-textSecondary mt-1">
            Gerencie suas equipes e acompanhe o desempenho
          </p>
        </div>
        <div className="flex gap-3">
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
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-main text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Nova Equipe
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm text-neutral-textSecondary">Total de Equipes</p>
          <p className="text-3xl font-bold text-neutral-textPrimary mt-1">{MOCK_TEAMS.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm text-neutral-textSecondary">Total de Membros</p>
          <p className="text-3xl font-bold text-neutral-textPrimary mt-1">{allMembers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm text-neutral-textSecondary">Membros Ativos</p>
          <p className="text-3xl font-bold text-accent-success mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm text-neutral-textSecondary">Produtividade Média</p>
          <p className="text-3xl font-bold text-primary-main mt-1">
            {Math.round(allMembers.reduce((a, m) => a + m.productivity, 0) / allMembers.length)}%
          </p>
        </div>
      </div>

      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid lg:grid-cols-3 gap-6">
          {MOCK_TEAMS.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTeam(team)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-textPrimary">{team.name}</h3>
                    <p className="text-sm text-neutral-textMuted">{team.description}</p>
                  </div>
                  <span className="text-2xl">👥</span>
                </div>

                <div className="flex -space-x-2 mb-4">
                  {team.members.slice(0, 4).map((member) => (
                    <div
                      key={member.id}
                      className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center font-medium text-primary-main border-2 border-white"
                      title={member.name}
                    >
                      {member.name.split(' ').map(n => n[0]).join('')}
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
                    {team.members.length} membros
                  </span>
                  <span className="text-accent-success font-medium">
                    {team.members.filter(m => m.status === 'active').length} ativos
                  </span>
                </div>
              </div>

              <div className="px-6 py-3 bg-neutral-background border-t border-neutral-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-textSecondary">Produtividade</span>
                  <span className="font-medium text-primary-main">
                    {Math.round(team.members.reduce((a, m) => a + m.productivity, 0) / team.members.length)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-background">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-neutral-textSecondary">Membro</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-neutral-textSecondary">Equipe</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-neutral-textSecondary">Função</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Status</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Produtividade</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-neutral-textSecondary">Último Check-in</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TEAMS.flatMap(team =>
                  team.members.map(member => (
                    <tr key={member.id} className="border-b border-neutral-border last:border-0 hover:bg-neutral-background/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center font-medium text-primary-main">
                              {member.name.split(' ').map(n => n[0]).join('')}
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
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[member.status].textColor} bg-opacity-10`}
                          style={{ backgroundColor: `currentColor`, opacity: 0.1 }}>
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
                      <td className="py-4 px-6 text-center text-neutral-textSecondary">{member.lastCheckIn}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Team Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-textPrimary">{selectedTeam.name}</h2>
                <p className="text-sm text-neutral-textMuted">{selectedTeam.description}</p>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <h3 className="font-medium text-neutral-textPrimary mb-4">Membros da Equipe</h3>
              <div className="space-y-3">
                {selectedTeam.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-neutral-background rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center font-medium text-primary-main">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${STATUS_CONFIG[member.status].color} rounded-full border-2 border-white`} />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-textPrimary">{member.name}</p>
                        <p className="text-sm text-neutral-textMuted">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary-main">{member.productivity}%</p>
                      <p className="text-xs text-neutral-textMuted">produtividade</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full mt-4 py-2 text-primary-main font-medium border-2 border-dashed border-neutral-border rounded-xl hover:bg-neutral-background transition-colors"
              >
                + Adicionar Membro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-neutral-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-textPrimary">Nova Equipe</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                  Nome da Equipe
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                  placeholder="Ex: Marketing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                  Descrição
                </label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main min-h-[80px]"
                  placeholder="Descreva o objetivo da equipe..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  Criar Equipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
