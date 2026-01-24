import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SPACING, BORDER_RADIUS } from '@nciaflux/shared';
import { useAuth } from '../../hooks/useAuth';
import { MainStackParamList } from '../../navigation/MainNavigator';

type ProfileNavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Mock stats - In production, this would come from Supabase
const MOCK_STATS = {
  tasksCompleted: 47,
  focusMinutes: 1250,
  streakDays: 5,
  checkInsCompleted: 18,
};

const MOCK_PROFILE = {
  executionStyle: 'sequential',
  bestFocusTime: 'afternoon',
  focusDuration: 25,
};

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { user, logout } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [checkInReminders, setCheckInReminders] = useState(true);
  const [focusReminders, setFocusReminders] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  function handleLogout() {
    setShowLogoutModal(false);
    logout();
  }

  function formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.email}>{user?.email || 'email@exemplo.com'}</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>
              Plano {user?.plan === 'free' ? 'Gratuito' : user?.plan || 'Básico'}
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Suas Estatísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{MOCK_STATS.tasksCompleted}</Text>
              <Text style={styles.statLabel}>Tarefas</Text>
              <Text style={styles.statSublabel}>concluídas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatMinutes(MOCK_STATS.focusMinutes)}</Text>
              <Text style={styles.statLabel}>Tempo</Text>
              <Text style={styles.statSublabel}>de foco</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{MOCK_STATS.streakDays}</Text>
              <Text style={styles.statLabel}>Dias</Text>
              <Text style={styles.statSublabel}>seguidos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{MOCK_STATS.checkInsCompleted}</Text>
              <Text style={styles.statLabel}>Check-ins</Text>
              <Text style={styles.statSublabel}>feitos</Text>
            </View>
          </View>
        </View>

        {/* Cognitive Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil Cognitivo</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Estilo de execução</Text>
              <Text style={styles.profileValue}>
                {MOCK_PROFILE.executionStyle === 'sequential'
                  ? 'Uma tarefa por vez'
                  : 'Múltiplas tarefas'}
              </Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Melhor horário</Text>
              <Text style={styles.profileValue}>
                {MOCK_PROFILE.bestFocusTime === 'morning'
                  ? 'Manhã'
                  : MOCK_PROFILE.bestFocusTime === 'afternoon'
                  ? 'Tarde'
                  : 'Noite'}
              </Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Tempo de foco ideal</Text>
              <Text style={styles.profileValue}>{MOCK_PROFILE.focusDuration} minutos</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Ver perfil completo →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Refazer descoberta →</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notificações</Text>
                <Text style={styles.settingDescription}>Ativar todas as notificações</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.neutral.border, true: COLORS.primary.main + '60' }}
                thumbColor={notificationsEnabled ? COLORS.primary.main : COLORS.neutral.disabled}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Lembretes de check-in</Text>
                <Text style={styles.settingDescription}>Receber lembretes para fazer check-in</Text>
              </View>
              <Switch
                value={checkInReminders && notificationsEnabled}
                onValueChange={setCheckInReminders}
                disabled={!notificationsEnabled}
                trackColor={{ false: COLORS.neutral.border, true: COLORS.primary.main + '60' }}
                thumbColor={
                  checkInReminders && notificationsEnabled
                    ? COLORS.primary.main
                    : COLORS.neutral.disabled
                }
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Lembretes de foco</Text>
                <Text style={styles.settingDescription}>Notificar quando começar/terminar foco</Text>
              </View>
              <Switch
                value={focusReminders && notificationsEnabled}
                onValueChange={setFocusReminders}
                disabled={!notificationsEnabled}
                trackColor={{ false: COLORS.neutral.border, true: COLORS.primary.main + '60' }}
                thumbColor={
                  focusReminders && notificationsEnabled
                    ? COLORS.primary.main
                    : COLORS.neutral.disabled
                }
              />
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>🎨</Text>
            <Text style={styles.menuItemText}>Aparência</Text>
            <Text style={styles.menuItemValue}>Automático</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>🗣️</Text>
            <Text style={styles.menuItemText}>Tom do assistente</Text>
            <Text style={styles.menuItemValue}>Gentil</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>🔕</Text>
            <Text style={styles.menuItemText}>Horário silencioso</Text>
            <Text style={styles.menuItemValue}>22:00 - 08:00</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>❓</Text>
            <Text style={styles.menuItemText}>Ajuda e FAQ</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>💬</Text>
            <Text style={styles.menuItemText}>Enviar feedback</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>📜</Text>
            <Text style={styles.menuItemText}>Termos e privacidade</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>ℹ️</Text>
            <Text style={styles.menuItemText}>Sobre o NeuroFluxo</Text>
            <Text style={styles.menuItemValue}>v1.0.0</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
          >
            <Text style={styles.logoutButtonText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sair da conta?</Text>
            <Text style={styles.modalText}>
              Você precisará fazer login novamente para acessar sua conta.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={handleLogout}>
                <Text style={styles.modalConfirmButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary.contrast,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
  },
  email: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    marginTop: SPACING.xs,
  },
  planBadge: {
    backgroundColor: COLORS.secondary.light,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
  },
  planText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary.dark,
  },
  statsSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.textMuted,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary.main,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginTop: SPACING.xs,
  },
  statSublabel: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  profileCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  profileLabel: {
    fontSize: 15,
    color: COLORS.neutral.textSecondary,
  },
  profileValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  linkButton: {
    paddingVertical: SPACING.sm,
  },
  linkButtonText: {
    fontSize: 15,
    color: COLORS.primary.main,
    fontWeight: '500',
  },
  settingsCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.neutral.textPrimary,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.neutral.textMuted,
    marginTop: 2,
  },
  menuItem: {
    backgroundColor: COLORS.neutral.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.neutral.textPrimary,
  },
  menuItemValue: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    marginRight: SPACING.sm,
  },
  menuItemArrow: {
    fontSize: 16,
    color: COLORS.neutral.textMuted,
  },
  dangerSection: {
    marginTop: SPACING.lg,
  },
  logoutButton: {
    backgroundColor: COLORS.neutral.white,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent.error,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.accent.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalText: {
    fontSize: 15,
    color: COLORS.neutral.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.neutral.background,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.accent.error,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
});
