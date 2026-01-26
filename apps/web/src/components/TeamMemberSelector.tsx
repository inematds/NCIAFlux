'use client';

import { useTeam } from '@/contexts/TeamContext';

interface TeamMemberSelectorProps {
  showStats?: boolean;
}

export default function TeamMemberSelector({ showStats = true }: TeamMemberSelectorProps) {
  const {
    isTeamMode,
    selectedTeam,
    selectedMemberIds,
    selectedMembers,
    selectAllMembers,
    clearMemberSelection,
    toggleMember,
    isViewingAllMembers,
  } = useTeam();

  if (!isTeamMode || !selectedTeam) {
    return null;
  }

  const avgProductivity = selectedMembers.length > 0
    ? Math.round(selectedMembers.reduce((sum, m) => sum + m.productivity, 0) / selectedMembers.length)
    : 0;

  const activeCount = selectedMembers.filter(m => m.status === 'active').length;

  return (
    <div className="bg-gradient-to-r from-secondary-main/10 to-primary-main/10 rounded-xl p-4 mb-6 border border-secondary-main/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">👥</span>
          <h3 className="font-semibold text-neutral-textPrimary">{selectedTeam.name}</h3>
          <span className="text-sm text-neutral-textMuted">
            ({selectedMemberIds.length} de {selectedTeam.members.length} selecionados)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={selectAllMembers}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              isViewingAllMembers
                ? 'bg-primary-main text-white'
                : 'bg-white text-neutral-textSecondary hover:bg-neutral-background'
            }`}
          >
            Todos
          </button>
          {selectedMemberIds.length > 0 && !isViewingAllMembers && (
            <button
              onClick={clearMemberSelection}
              className="px-3 py-1 text-sm bg-white text-neutral-textSecondary rounded-lg hover:bg-neutral-background transition-colors"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Member Pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTeam.members.map((member) => {
          const isSelected = selectedMemberIds.includes(member.id);
          return (
            <button
              key={member.id}
              onClick={() => toggleMember(member.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                isSelected
                  ? 'bg-primary-main text-white shadow-sm'
                  : 'bg-white text-neutral-textSecondary hover:bg-neutral-background border border-neutral-border'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                member.status === 'active' ? 'bg-accent-success' :
                member.status === 'away' ? 'bg-secondary-main' : 'bg-neutral-textMuted'
              }`} />
              <span>{member.name.split(' ')[0]}</span>
              {isSelected && <span className="opacity-70">{member.productivity}%</span>}
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      {showStats && selectedMembers.length > 0 && (
        <div className="flex items-center gap-6 pt-3 border-t border-neutral-border/50">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <div>
              <p className="text-xs text-neutral-textMuted">Produtividade Media</p>
              <p className="font-semibold text-primary-main">{avgProductivity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🟢</span>
            <div>
              <p className="text-xs text-neutral-textMuted">Ativos Agora</p>
              <p className="font-semibold text-accent-success">{activeCount}/{selectedMembers.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            <div>
              <p className="text-xs text-neutral-textMuted">Visualizando</p>
              <p className="font-semibold text-neutral-textPrimary">
                {isViewingAllMembers ? 'Equipe Completa' : `${selectedMembers.length} membro(s)`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function TeamMemberSelectorCompact() {
  const {
    isTeamMode,
    selectedTeam,
    selectedMemberIds,
    toggleMember,
    selectAllMembers,
    isViewingAllMembers,
  } = useTeam();

  if (!isTeamMode || !selectedTeam) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-neutral-textMuted">Membros:</span>
      <button
        onClick={selectAllMembers}
        className={`px-2 py-1 text-xs rounded-md transition-colors ${
          isViewingAllMembers
            ? 'bg-primary-main text-white'
            : 'bg-neutral-background text-neutral-textSecondary hover:bg-neutral-border'
        }`}
      >
        Todos ({selectedTeam.members.length})
      </button>
      {selectedTeam.members.map((member) => {
        const isSelected = selectedMemberIds.includes(member.id);
        return (
          <button
            key={member.id}
            onClick={() => toggleMember(member.id)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              isSelected && !isViewingAllMembers
                ? 'bg-secondary-main text-white'
                : 'bg-neutral-background text-neutral-textSecondary hover:bg-neutral-border'
            }`}
          >
            {member.name.split(' ')[0]}
          </button>
        );
      })}
    </div>
  );
}
