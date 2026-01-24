import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  CHECK_IN_MOODS,
  CHECK_IN_PROMPTS,
  CHECK_IN_RESPONSES,
  CheckInType,
} from '@nciaflux/shared';

type CheckInParams = {
  CheckIn: { type?: CheckInType };
};

type CheckInStep = 'mood' | 'energy' | 'notes' | 'complete';

const ENERGY_LEVELS = [
  { value: 1, emoji: '😴', label: 'Muito baixa' },
  { value: 2, emoji: '🥱', label: 'Baixa' },
  { value: 3, emoji: '😐', label: 'Moderada' },
  { value: 4, emoji: '⚡', label: 'Boa' },
  { value: 5, emoji: '🔥', label: 'Alta' },
];

export function CheckInScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<CheckInParams, 'CheckIn'>>();
  const checkInType: CheckInType = route.params?.type || 'on_demand';

  const [step, setStep] = useState<CheckInStep>('mood');
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  const prompts = CHECK_IN_PROMPTS[checkInType];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  function getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  function handleMoodSelect(selectedMood: string) {
    setMood(selectedMood);
    animateTransition(() => setStep('energy'));
  }

  function handleEnergySelect(selectedEnergy: number) {
    setEnergy(selectedEnergy);
    animateTransition(() => setStep('notes'));
  }

  function handleSubmit() {
    // Generate response based on energy level
    let responses: readonly string[];
    if (energy && energy >= 4) {
      responses = CHECK_IN_RESPONSES.high_energy;
    } else if (mood === 'struggling' || mood === 'low') {
      responses = CHECK_IN_RESPONSES.struggling;
    } else {
      responses = CHECK_IN_RESPONSES.low_energy;
    }
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    setResponseMessage(randomResponse);
    animateTransition(() => setStep('complete'));
  }

  function animateTransition(callback: () => void) {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      slideAnim.setValue(30);
      callback();
    });
  }

  function handleClose() {
    navigation.goBack();
  }

  function renderMoodStep() {
    return (
      <Animated.View
        style={[
          styles.stepContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.greeting}>{getTimeBasedGreeting()}!</Text>
        <Text style={styles.question}>{prompts.greeting}</Text>

        <View style={styles.moodGrid}>
          {CHECK_IN_MOODS.map((moodOption) => (
            <TouchableOpacity
              key={moodOption.value}
              style={[
                styles.moodCard,
                mood === moodOption.value && styles.moodCardSelected,
              ]}
              onPress={() => handleMoodSelect(moodOption.value)}
            >
              <Text style={styles.moodEmoji}>{moodOption.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  mood === moodOption.value && styles.moodLabelSelected,
                ]}
              >
                {moodOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  }

  function renderEnergyStep() {
    return (
      <Animated.View
        style={[
          styles.stepContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.question}>{prompts.energy}</Text>

        <View style={styles.energyContainer}>
          {ENERGY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.energyCard,
                energy === level.value && styles.energyCardSelected,
              ]}
              onPress={() => handleEnergySelect(level.value)}
            >
              <Text style={styles.energyEmoji}>{level.emoji}</Text>
              <View style={styles.energyBar}>
                <View
                  style={[
                    styles.energyFill,
                    { width: `${level.value * 20}%` },
                    energy === level.value && styles.energyFillSelected,
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.energyLabel,
                  energy === level.value && styles.energyLabelSelected,
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  }

  function renderNotesStep() {
    return (
      <Animated.View
        style={[
          styles.stepContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.question}>Quer adicionar algo mais?</Text>
        <Text style={styles.subtitle}>Opcional - pode pular se preferir</Text>

        <TextInput
          style={styles.notesInput}
          placeholder="Como você está se sentindo, o que está pensando..."
          placeholderTextColor={COLORS.neutral.textMuted}
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
          textAlignVertical="top"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSubmit}
          >
            <Text style={styles.skipButtonText}>Pular</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  function renderCompleteStep() {
    const selectedMood = CHECK_IN_MOODS.find((m) => m.value === mood);
    const selectedEnergy = ENERGY_LEVELS.find((e) => e.value === energy);

    return (
      <Animated.View
        style={[
          styles.stepContainer,
          styles.completeContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.completeIcon}>
          <Text style={styles.completeEmoji}>✨</Text>
        </View>

        <Text style={styles.completeTitle}>Check-in registrado!</Text>
        <Text style={styles.responseMessage}>{responseMessage}</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Seu check-in:</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Humor:</Text>
            <Text style={styles.summaryValue}>
              {selectedMood?.emoji} {selectedMood?.label}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Energia:</Text>
            <Text style={styles.summaryValue}>
              {selectedEnergy?.emoji} {selectedEnergy?.label}
            </Text>
          </View>
          {notes.trim() && (
            <View style={styles.summaryNotes}>
              <Text style={styles.summaryLabel}>Notas:</Text>
              <Text style={styles.summaryNotesText}>{notes}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
          <Text style={styles.doneButtonText}>Continuar</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  function getProgress(): number {
    switch (step) {
      case 'mood':
        return 25;
      case 'energy':
        return 50;
      case 'notes':
        return 75;
      case 'complete':
        return 100;
      default:
        return 0;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check-in</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'mood' && renderMoodStep()}
        {step === 'energy' && renderEnergyStep()}
        {step === 'notes' && renderNotesStep()}
        {step === 'complete' && renderCompleteStep()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  closeText: {
    fontSize: 20,
    color: COLORS.neutral.textSecondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary.main,
    borderRadius: 2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  stepContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.sm,
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.xl,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  moodCard: {
    width: '48%',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moodCardSelected: {
    borderColor: COLORS.primary.main,
    backgroundColor: COLORS.primary.light + '20',
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.neutral.textSecondary,
  },
  moodLabelSelected: {
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  energyContainer: {
    gap: SPACING.sm,
  },
  energyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  energyCardSelected: {
    borderColor: COLORS.primary.main,
    backgroundColor: COLORS.primary.light + '20',
  },
  energyEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  energyBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 4,
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    backgroundColor: COLORS.neutral.textMuted,
    borderRadius: 4,
  },
  energyFillSelected: {
    backgroundColor: COLORS.primary.main,
  },
  energyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral.textSecondary,
    width: 80,
    textAlign: 'right',
  },
  energyLabelSelected: {
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.neutral.textPrimary,
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    marginBottom: SPACING.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  skipButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textSecondary,
  },
  submitButton: {
    flex: 2,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.primary.main,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.contrast,
  },
  completeContainer: {
    alignItems: 'center',
  },
  completeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  completeEmoji: {
    fontSize: 40,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.md,
  },
  responseMessage: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.textMuted,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  summaryNotes: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
  },
  summaryNotesText: {
    fontSize: 14,
    color: COLORS.neutral.textPrimary,
    marginTop: SPACING.xs,
    lineHeight: 20,
  },
  doneButton: {
    width: '100%',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.primary.main,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.contrast,
  },
});
