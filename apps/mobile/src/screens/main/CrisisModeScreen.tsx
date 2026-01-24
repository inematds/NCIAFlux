import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  CRISIS_MISSIONS,
  CRISIS_MESSAGES,
  CrisisMission,
} from '@nciaflux/shared';

const BREATHING_EXERCISES = [
  { name: 'Respiração 4-7-8', description: 'Inspire 4s, segure 7s, expire 8s', rounds: 3 },
  { name: 'Respiração Quadrada', description: '4s em cada fase: inspire, segure, expire, segure', rounds: 4 },
];

const GROUNDING_EXERCISES = [
  '5 coisas que você pode VER',
  '4 coisas que você pode TOCAR',
  '3 coisas que você pode OUVIR',
  '2 coisas que você pode CHEIRAR',
  '1 coisa que você pode SABOREAR',
];

export function CrisisModeScreen() {
  const navigation = useNavigation();
  const [mission, setMission] = useState<CrisisMission | null>(null);
  const [activationMessage, setActivationMessage] = useState('');
  const [showBreathing, setShowBreathing] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);

  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Pick random mission and message on mount
    const randomMission = CRISIS_MISSIONS[Math.floor(Math.random() * CRISIS_MISSIONS.length)];
    const randomMessage = CRISIS_MESSAGES.activation[Math.floor(Math.random() * CRISIS_MESSAGES.activation.length)];
    setMission(randomMission);
    setActivationMessage(randomMessage);

    // Start gentle pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  function handleNewMission() {
    const currentIndex = CRISIS_MISSIONS.findIndex((m) => m.id === mission?.id);
    const nextIndex = (currentIndex + 1) % CRISIS_MISSIONS.length;
    setMission(CRISIS_MISSIONS[nextIndex]);
  }

  function handleDeactivate() {
    navigation.goBack();
  }

  function startBreathingExercise() {
    setShowBreathing(true);
    setBreathingCount(0);
    setBreathingPhase('inhale');
    runBreathingCycle();
  }

  function runBreathingCycle() {
    // Simple 4-7-8 breathing visualization
    setBreathingPhase('inhale');
    setTimeout(() => {
      setBreathingPhase('hold');
      setTimeout(() => {
        setBreathingPhase('exhale');
        setTimeout(() => {
          setBreathingCount((prev) => {
            if (prev < 2) {
              runBreathingCycle();
              return prev + 1;
            } else {
              setShowBreathing(false);
              return 0;
            }
          });
        }, 8000);
      }, 7000);
    }, 4000);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Modo Crise Ativo</Text>
          </View>
        </View>

        {/* Main Message */}
        <View style={styles.messageSection}>
          <Text style={styles.mainMessage}>{activationMessage}</Text>
          <Text style={styles.subMessage}>Hoje é dia de cuidar de você.</Text>
        </View>

        {/* Mission Card */}
        <Animated.View
          style={[styles.missionCard, { transform: [{ scale: pulseAnim }] }]}
        >
          <Text style={styles.missionLabel}>Sua única missão:</Text>
          {mission && (
            <>
              <Text style={styles.missionEmoji}>{mission.emoji}</Text>
              <Text style={styles.missionText}>{mission.text}</Text>
            </>
          )}
          <TouchableOpacity style={styles.newMissionButton} onPress={handleNewMission}>
            <Text style={styles.newMissionButtonText}>Outra missão</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Notification Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeEmoji}>🔕</Text>
          <Text style={styles.noticeText}>
            Notificações pausadas até você desativar o modo crise
          </Text>
        </View>

        {/* Quick Exercises */}
        <View style={styles.exercisesSection}>
          <Text style={styles.exercisesTitle}>Se precisar de ajuda extra:</Text>

          {/* Breathing Exercise */}
          <TouchableOpacity
            style={styles.exerciseCard}
            onPress={() => !showBreathing && startBreathingExercise()}
          >
            <Text style={styles.exerciseEmoji}>🌬️</Text>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>Respiração Guiada</Text>
              <Text style={styles.exerciseDescription}>
                {showBreathing
                  ? `${breathingPhase === 'inhale' ? 'Inspire...' : breathingPhase === 'hold' ? 'Segure...' : 'Expire...'} (${breathingCount + 1}/3)`
                  : 'Técnica 4-7-8 para acalmar'}
              </Text>
            </View>
            {showBreathing && (
              <View
                style={[
                  styles.breathingIndicator,
                  breathingPhase === 'inhale' && styles.breathingInhale,
                  breathingPhase === 'hold' && styles.breathingHold,
                  breathingPhase === 'exhale' && styles.breathingExhale,
                ]}
              />
            )}
          </TouchableOpacity>

          {/* Grounding Exercise */}
          <TouchableOpacity
            style={styles.exerciseCard}
            onPress={() => setShowGrounding(!showGrounding)}
          >
            <Text style={styles.exerciseEmoji}>🌍</Text>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>Técnica 5-4-3-2-1</Text>
              <Text style={styles.exerciseDescription}>
                Exercício de grounding para ansiedade
              </Text>
            </View>
            <Text style={styles.exerciseArrow}>{showGrounding ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showGrounding && (
            <View style={styles.groundingSteps}>
              {GROUNDING_EXERCISES.map((step, index) => (
                <View key={index} style={styles.groundingStep}>
                  <Text style={styles.groundingNumber}>{5 - index}</Text>
                  <Text style={styles.groundingText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Supportive Message */}
        <View style={styles.supportSection}>
          <Text style={styles.supportText}>
            Lembre-se: dias difíceis não definem você.{'\n'}
            Você está fazendo o seu melhor, e isso é suficiente.
          </Text>
        </View>

        {/* Deactivate Button */}
        <TouchableOpacity style={styles.deactivateButton} onPress={handleDeactivate}>
          <Text style={styles.deactivateButtonText}>Estou melhor, desativar</Text>
        </TouchableOpacity>

        {/* Emergency Notice */}
        <View style={styles.emergencyNotice}>
          <Text style={styles.emergencyText}>
            Se você está em crise séria, ligue para o CVV: 188
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.crisis.background,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.crisis.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary.main,
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.crisis.text,
    fontWeight: '500',
  },
  messageSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
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
    opacity: 0.7,
    textAlign: 'center',
  },
  missionCard: {
    backgroundColor: COLORS.crisis.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  missionLabel: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    marginBottom: SPACING.md,
  },
  missionEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  missionText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  newMissionButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  newMissionButtonText: {
    fontSize: 14,
    color: COLORS.primary.main,
    fontWeight: '500',
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary.light + '30',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  noticeEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.secondary.dark,
    lineHeight: 20,
  },
  exercisesSection: {
    marginBottom: SPACING.xl,
  },
  exercisesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.crisis.text,
    marginBottom: SPACING.md,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.crisis.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  exerciseEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  exerciseDescription: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    marginTop: 2,
  },
  exerciseArrow: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
  },
  breathingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  breathingInhale: {
    backgroundColor: COLORS.primary.main,
  },
  breathingHold: {
    backgroundColor: COLORS.secondary.main,
  },
  breathingExhale: {
    backgroundColor: COLORS.accent.success,
  },
  groundingSteps: {
    backgroundColor: COLORS.crisis.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  groundingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  groundingNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary.main + '20',
    color: COLORS.primary.main,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: SPACING.md,
  },
  groundingText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.neutral.textPrimary,
  },
  supportSection: {
    backgroundColor: COLORS.accent.success + '15',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  supportText: {
    fontSize: 16,
    color: COLORS.neutral.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  deactivateButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  deactivateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.contrast,
  },
  emergencyNotice: {
    alignItems: 'center',
  },
  emergencyText: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    textAlign: 'center',
  },
});
