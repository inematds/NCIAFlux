import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Vibration,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FocusTechnique } from '@nciaflux/shared';

type TimerPhase = 'idle' | 'focus' | 'break' | 'completed';

interface TechniqueConfig {
  id: FocusTechnique;
  name: string;
  description: string;
  focusMinutes: number;
  breakMinutes: number;
  emoji: string;
}

const TECHNIQUES: TechniqueConfig[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    description: '25 min foco + 5 min pausa',
    focusMinutes: 25,
    breakMinutes: 5,
    emoji: '🍅',
  },
  {
    id: 'deep_work',
    name: 'Trabalho Profundo',
    description: '45 min de foco intenso',
    focusMinutes: 45,
    breakMinutes: 10,
    emoji: '🧠',
  },
  {
    id: 'timeboxing',
    name: 'Timeboxing',
    description: '15 min para tarefas rápidas',
    focusMinutes: 15,
    breakMinutes: 3,
    emoji: '📦',
  },
  {
    id: 'free_flow',
    name: 'Fluxo Livre',
    description: 'Sem timer, pare quando quiser',
    focusMinutes: 0,
    breakMinutes: 0,
    emoji: '🌊',
  },
];

const MOTIVATIONAL_MESSAGES = [
  'Você está indo muito bem! Continue assim.',
  'Cada minuto de foco é uma vitória.',
  'Sua mente está trabalhando a seu favor.',
  'Lembre-se: progresso, não perfeição.',
  'Você está construindo novos hábitos.',
];

const BREAK_SUGGESTIONS = [
  'Levante e alongue o corpo',
  'Beba um copo de água',
  'Olhe para longe da tela',
  'Respire fundo 5 vezes',
  'Dê uma volta rápida',
];

export function FocusBlockScreen() {
  const navigation = useNavigation();
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueConfig>(TECHNIQUES[0]);
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [freeFlowTime, setFreeFlowTime] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Progress animation
  useEffect(() => {
    if (totalTime > 0) {
      Animated.timing(progressAnim, {
        toValue: timeRemaining / totalTime,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, [timeRemaining, totalTime, progressAnim]);

  // Pulse animation during focus
  useEffect(() => {
    if (phase === 'focus') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [phase, pulseAnim]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  function startTimer() {
    if (selectedTechnique.id === 'free_flow') {
      // Free flow mode - count up
      setPhase('focus');
      setFreeFlowTime(0);
      intervalRef.current = setInterval(() => {
        setFreeFlowTime((prev) => prev + 1);
      }, 1000);
    } else {
      // Standard timer - count down
      const focusSeconds = selectedTechnique.focusMinutes * 60;
      setPhase('focus');
      setTimeRemaining(focusSeconds);
      setTotalTime(focusSeconds);
      progressAnim.setValue(1);

      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }

  function handlePhaseComplete() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Vibrate to notify
    Vibration.vibrate([0, 200, 100, 200]);

    if (phase === 'focus') {
      setSessionsCompleted((prev) => prev + 1);

      if (selectedTechnique.breakMinutes > 0) {
        // Start break
        const breakSeconds = selectedTechnique.breakMinutes * 60;
        setPhase('break');
        setTimeRemaining(breakSeconds);
        setTotalTime(breakSeconds);
        progressAnim.setValue(1);

        intervalRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              handlePhaseComplete();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setPhase('completed');
      }
    } else if (phase === 'break') {
      setPhase('completed');
    }
  }

  function pauseTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function resumeTimer() {
    if (selectedTechnique.id === 'free_flow') {
      intervalRef.current = setInterval(() => {
        setFreeFlowTime((prev) => prev + 1);
      }, 1000);
    } else {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }

  function resetTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPhase('idle');
    setTimeRemaining(0);
    setTotalTime(0);
    setFreeFlowTime(0);
    progressAnim.setValue(1);
  }

  function stopFreeFlow() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSessionsCompleted((prev) => prev + 1);
    setPhase('completed');
  }

  function getRandomMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  const progressPercentage = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Voltar</Text>
          </TouchableOpacity>
          <View style={styles.sessionBadge}>
            <Text style={styles.sessionCount}>{sessionsCompleted}</Text>
            <Text style={styles.sessionLabel}>sessões</Text>
          </View>
        </View>

        {/* Timer Display */}
        <Animated.View
          style={[
            styles.timerContainer,
            { transform: [{ scale: pulseAnim }] },
            phase === 'focus' && styles.timerFocus,
            phase === 'break' && styles.timerBreak,
          ]}
        >
          {phase === 'idle' ? (
            <>
              <Text style={styles.timerIdleText}>Pronto para focar?</Text>
              <Text style={styles.timerIdleSubtext}>
                Escolha uma técnica abaixo
              </Text>
            </>
          ) : phase === 'completed' ? (
            <>
              <Text style={styles.completedEmoji}>🎉</Text>
              <Text style={styles.completedText}>Parabéns!</Text>
              <Text style={styles.completedSubtext}>
                {sessionsCompleted} {sessionsCompleted === 1 ? 'sessão' : 'sessões'} completada
                {sessionsCompleted === 1 ? '' : 's'}
              </Text>
            </>
          ) : selectedTechnique.id === 'free_flow' ? (
            <>
              <Text style={styles.timerTime}>{formatTime(freeFlowTime)}</Text>
              <Text style={styles.timerPhase}>Fluxo Livre</Text>
            </>
          ) : (
            <>
              <Text style={styles.timerTime}>{formatTime(timeRemaining)}</Text>
              <Text style={styles.timerPhase}>
                {phase === 'focus' ? 'Foco' : 'Pausa'}
              </Text>
              {/* Progress bar */}
              <View style={styles.progressBar}>
                <Animated.View
                  style={[styles.progressFill, { width: progressPercentage }]}
                />
              </View>
            </>
          )}
        </Animated.View>

        {/* Motivational message during focus */}
        {phase === 'focus' && (
          <View style={styles.messageContainer}>
            <Text style={styles.motivationalMessage}>
              💪 {getRandomMessage(MOTIVATIONAL_MESSAGES)}
            </Text>
          </View>
        )}

        {/* Break suggestions */}
        {phase === 'break' && (
          <View style={styles.messageContainer}>
            <Text style={styles.breakTitle}>Sugestão para a pausa:</Text>
            <Text style={styles.breakSuggestion}>
              ☕ {getRandomMessage(BREAK_SUGGESTIONS)}
            </Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {phase === 'idle' && (
            <TouchableOpacity style={styles.startButton} onPress={startTimer}>
              <Text style={styles.startButtonText}>Iniciar Foco</Text>
            </TouchableOpacity>
          )}

          {(phase === 'focus' || phase === 'break') && (
            <View style={styles.activeControls}>
              {selectedTechnique.id === 'free_flow' ? (
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={stopFreeFlow}
                >
                  <Text style={styles.stopButtonText}>Parar</Text>
                </TouchableOpacity>
              ) : (
                <>
                  {intervalRef.current ? (
                    <TouchableOpacity
                      style={styles.pauseButton}
                      onPress={pauseTimer}
                    >
                      <Text style={styles.pauseButtonText}>Pausar</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.resumeButton}
                      onPress={resumeTimer}
                    >
                      <Text style={styles.resumeButtonText}>Continuar</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetTimer}
                  >
                    <Text style={styles.resetButtonText}>Reiniciar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {phase === 'completed' && (
            <View style={styles.completedControls}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={startTimer}
              >
                <Text style={styles.startButtonText}>Mais uma sessão</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.doneButtonText}>Concluir</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Technique Selection (only when idle) */}
        {phase === 'idle' && (
          <View style={styles.techniquesSection}>
            <Text style={styles.sectionTitle}>Escolha a técnica</Text>
            {TECHNIQUES.map((technique) => (
              <TouchableOpacity
                key={technique.id}
                style={[
                  styles.techniqueCard,
                  selectedTechnique.id === technique.id && styles.techniqueSelected,
                ]}
                onPress={() => setSelectedTechnique(technique)}
              >
                <Text style={styles.techniqueEmoji}>{technique.emoji}</Text>
                <View style={styles.techniqueInfo}>
                  <Text
                    style={[
                      styles.techniqueName,
                      selectedTechnique.id === technique.id &&
                        styles.techniqueNameSelected,
                    ]}
                  >
                    {technique.name}
                  </Text>
                  <Text style={styles.techniqueDescription}>
                    {technique.description}
                  </Text>
                </View>
                {selectedTechnique.id === technique.id && (
                  <Text style={styles.techniqueCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tips Section */}
        {phase === 'idle' && (
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>Dicas para o foco</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>📱</Text>
              <Text style={styles.tipText}>
                Silencie notificações durante o bloco de foco
              </Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>🎧</Text>
              <Text style={styles.tipText}>
                Música lo-fi ou sons da natureza podem ajudar
              </Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>💧</Text>
              <Text style={styles.tipText}>
                Tenha água por perto antes de começar
              </Text>
            </View>
          </View>
        )}
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
    paddingBottom: SPACING['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backButton: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
  },
  sessionBadge: {
    backgroundColor: COLORS.primary.main + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sessionCount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary.main,
  },
  sessionLabel: {
    fontSize: 12,
    color: COLORS.primary.main,
  },
  timerContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timerFocus: {
    backgroundColor: COLORS.primary.main + '10',
    borderWidth: 3,
    borderColor: COLORS.primary.main,
  },
  timerBreak: {
    backgroundColor: COLORS.accent.success + '10',
    borderWidth: 3,
    borderColor: COLORS.accent.success,
  },
  timerIdleText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.sm,
  },
  timerIdleSubtext: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
  },
  timerTime: {
    fontSize: 64,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  timerPhase: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginTop: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 4,
    marginTop: SPACING.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary.main,
    borderRadius: 4,
  },
  completedEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  completedText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.accent.success,
  },
  completedSubtext: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
    marginTop: SPACING.sm,
  },
  messageContainer: {
    backgroundColor: COLORS.secondary.light + '30',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  motivationalMessage: {
    fontSize: 15,
    color: COLORS.secondary.dark,
    textAlign: 'center',
    lineHeight: 22,
  },
  breakTitle: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    marginBottom: SPACING.xs,
  },
  breakSuggestion: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent.success,
    textAlign: 'center',
  },
  controls: {
    marginTop: SPACING.xl,
  },
  startButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.md + 4,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary.contrast,
  },
  activeControls: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: COLORS.secondary.main,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  pauseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
  resumeButton: {
    flex: 1,
    backgroundColor: COLORS.accent.success,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  resumeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
  stopButton: {
    flex: 1,
    backgroundColor: COLORS.accent.error,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
  resetButton: {
    flex: 1,
    backgroundColor: COLORS.neutral.border,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textSecondary,
  },
  completedControls: {
    gap: SPACING.md,
  },
  doneButton: {
    backgroundColor: COLORS.neutral.white,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textSecondary,
  },
  techniquesSection: {
    marginTop: SPACING['2xl'],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.md,
  },
  techniqueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
  },
  techniqueSelected: {
    borderColor: COLORS.primary.main,
    backgroundColor: COLORS.primary.main + '08',
  },
  techniqueEmoji: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  techniqueInfo: {
    flex: 1,
  },
  techniqueName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  techniqueNameSelected: {
    color: COLORS.primary.main,
  },
  techniqueDescription: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    marginTop: 2,
  },
  techniqueCheck: {
    fontSize: 20,
    color: COLORS.primary.main,
    fontWeight: '700',
  },
  tipsSection: {
    marginTop: SPACING['2xl'],
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  tipEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    lineHeight: 20,
  },
});
