import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SPACING, BORDER_RADIUS, CRISIS_MISSIONS, CRISIS_MESSAGES } from '@nciaflux/shared';

export function CrisisModeScreen() {
  const navigation = useNavigation();

  // Pick a random mission
  const mission = CRISIS_MISSIONS[Math.floor(Math.random() * CRISIS_MISSIONS.length)];
  const message = CRISIS_MESSAGES.activation[Math.floor(Math.random() * CRISIS_MESSAGES.activation.length)];

  function handleDeactivate() {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.header}>Modo Crise Ativo</Text>

          <View style={styles.messageContainer}>
            <Text style={styles.mainMessage}>{message}</Text>
            <Text style={styles.subMessage}>Hoje é dia de cuidar de você.</Text>
          </View>

          <View style={styles.missionCard}>
            <Text style={styles.missionLabel}>Sua única missão:</Text>
            <Text style={styles.missionText}>{mission.text}</Text>
            <Text style={styles.missionEmoji}>{mission.emoji}</Text>
          </View>

          <Text style={styles.notificationNote}>
            Notificações pausadas até amanhã
          </Text>

          <TouchableOpacity style={styles.deactivateButton} onPress={handleDeactivate}>
            <Text style={styles.deactivateButtonText}>Estou melhor, desativar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.crisis.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  header: {
    fontSize: 16,
    color: COLORS.crisis.text,
    opacity: 0.7,
    marginBottom: SPACING['2xl'],
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  mainMessage: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.crisis.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subMessage: {
    fontSize: 18,
    color: COLORS.crisis.text,
    opacity: 0.8,
    textAlign: 'center',
  },
  missionCard: {
    backgroundColor: COLORS.crisis.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: SPACING.xl,
  },
  missionLabel: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    marginBottom: SPACING.sm,
  },
  missionText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  missionEmoji: {
    fontSize: 48,
  },
  notificationNote: {
    fontSize: 14,
    color: COLORS.crisis.text,
    opacity: 0.6,
    marginBottom: SPACING['2xl'],
  },
  deactivateButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  deactivateButtonText: {
    fontSize: 16,
    color: COLORS.primary.main,
    opacity: 0.8,
  },
});
