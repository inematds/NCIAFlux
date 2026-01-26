'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { globalTeamsStorage, teamsStorage, userStorage, StoredTeam, StoredTeamMember } from '@/lib/storage';
import { profileManager } from '@/lib/profile-manager';

interface TeamContextType {
  // Current context
  isTeamMode: boolean;
  selectedTeamId: string | null;
  selectedTeam: StoredTeam | null;

  // Member selection
  selectedMemberIds: string[];
  selectedMembers: StoredTeamMember[];

  // All teams user can manage
  managedTeams: StoredTeam[];

  // Actions
  selectTeam: (teamId: string | null) => void;
  selectMembers: (memberIds: string[]) => void;
  selectAllMembers: () => void;
  clearMemberSelection: () => void;
  toggleMember: (memberId: string) => void;

  // Helpers
  getMemberById: (memberId: string) => StoredTeamMember | undefined;
  isViewingAllMembers: boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [managedTeams, setManagedTeams] = useState<StoredTeam[]>([]);

  // Load managed teams on mount
  useEffect(() => {
    const user = userStorage.get();
    if (!user) return;

    const globalTeams = globalTeamsStorage.getAll();
    const personalTeams = teamsStorage.getAll();
    const allTeams = [...globalTeams, ...personalTeams];

    // Filter teams where user is owner or has manager role
    const userTeams = allTeams.filter(t => {
      const isOwner = t.ownerId === user.id;
      const isManager = t.members.some(m =>
        m.email?.toLowerCase() === user.email?.toLowerCase() && m.role === 'manager'
      );
      return isOwner || isManager;
    });

    setManagedTeams(userTeams);

    // Restore saved team selection from profile manager
    const viewMode = profileManager.getViewMode();
    if (viewMode === 'management' && userTeams.length > 0) {
      // If there was a team selected, try to restore it
      const savedTeamId = localStorage.getItem('nciaflux_selected_team');
      if (savedTeamId && userTeams.find(t => t.id === savedTeamId)) {
        setSelectedTeamId(savedTeamId);
        // Select all members by default
        const team = userTeams.find(t => t.id === savedTeamId);
        if (team) {
          setSelectedMemberIds(team.members.map(m => m.id));
        }
      }
    }
  }, []);

  // Get current selected team
  const selectedTeam = selectedTeamId
    ? managedTeams.find(t => t.id === selectedTeamId) || null
    : null;

  // Get selected members
  const selectedMembers = selectedTeam
    ? selectedTeam.members.filter(m => selectedMemberIds.includes(m.id))
    : [];

  // Check if viewing all members
  const isViewingAllMembers = selectedTeam
    ? selectedMemberIds.length === selectedTeam.members.length
    : false;

  // Actions
  function selectTeam(teamId: string | null) {
    setSelectedTeamId(teamId);
    if (teamId) {
      localStorage.setItem('nciaflux_selected_team', teamId);
      profileManager.setViewMode('management');
      // Select all members by default when selecting a team
      const team = managedTeams.find(t => t.id === teamId);
      if (team) {
        setSelectedMemberIds(team.members.map(m => m.id));
      }
    } else {
      localStorage.removeItem('nciaflux_selected_team');
      profileManager.setViewMode('personal');
      setSelectedMemberIds([]);
    }
  }

  function selectMembers(memberIds: string[]) {
    setSelectedMemberIds(memberIds);
  }

  function selectAllMembers() {
    if (selectedTeam) {
      setSelectedMemberIds(selectedTeam.members.map(m => m.id));
    }
  }

  function clearMemberSelection() {
    setSelectedMemberIds([]);
  }

  function toggleMember(memberId: string) {
    setSelectedMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  }

  function getMemberById(memberId: string): StoredTeamMember | undefined {
    return selectedTeam?.members.find(m => m.id === memberId);
  }

  const value: TeamContextType = {
    isTeamMode: selectedTeamId !== null,
    selectedTeamId,
    selectedTeam,
    selectedMemberIds,
    selectedMembers,
    managedTeams,
    selectTeam,
    selectMembers,
    selectAllMembers,
    clearMemberSelection,
    toggleMember,
    getMemberById,
    isViewingAllMembers,
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}

// Helper hook to check if we should show team features
export function useTeamFeatures() {
  const { isTeamMode, selectedTeam, selectedMembers, isViewingAllMembers } = useTeam();

  return {
    isTeamMode,
    teamName: selectedTeam?.name || '',
    memberCount: selectedTeam?.members.length || 0,
    selectedCount: selectedMembers.length,
    isViewingAll: isViewingAllMembers,
    hasSelection: selectedMembers.length > 0,
  };
}
