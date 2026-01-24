import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, SPACING, getGreeting } from '@nciaflux/shared';
import { useAuth } from '../../hooks/useAuth';

export function DashboardScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seu dia</Text>
          <Text style={styles.cardSubtitle}>
            [Implementação do dashboard em Story 2.3]
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tarefas de hoje</Text>
          <Text style={styles.placeholder}>Nenhuma tarefa ainda</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Próximo check-in</Text>
          <Text style={styles.placeholder}>Aguardando configuração</Text>
        </View>
      </ScrollView>
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
  },
  header: {
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
  },
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.sm,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    fontStyle: 'italic',
  },
  placeholder: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
  },
});
