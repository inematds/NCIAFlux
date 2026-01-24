import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

import { COLORS, SPACING, BORDER_RADIUS } from '@nciaflux/shared';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type CelebrationType =
  | 'task_complete'
  | 'streak'
  | 'focus_complete'
  | 'checkin_complete'
  | 'daily_goal'
  | 'first_task'
  | 'all_tasks';

interface CelebrationConfig {
  emoji: string;
  title: string;
  message: string;
  confetti: boolean;
  duration: number;
}

const CELEBRATION_CONFIGS: Record<CelebrationType, CelebrationConfig> = {
  task_complete: {
    emoji: '✅',
    title: 'Tarefa concluída!',
    message: 'Ótimo trabalho!',
    confetti: false,
    duration: 1500,
  },
  streak: {
    emoji: '🔥',
    title: 'Sequência mantida!',
    message: 'Continue assim!',
    confetti: true,
    duration: 2500,
  },
  focus_complete: {
    emoji: '🎯',
    title: 'Foco concluído!',
    message: 'Você se manteve focado!',
    confetti: true,
    duration: 2000,
  },
  checkin_complete: {
    emoji: '📝',
    title: 'Check-in feito!',
    message: 'Obrigado por compartilhar!',
    confetti: false,
    duration: 1500,
  },
  daily_goal: {
    emoji: '🏆',
    title: 'Meta diária atingida!',
    message: 'Você é incrível!',
    confetti: true,
    duration: 3000,
  },
  first_task: {
    emoji: '🌟',
    title: 'Primeira tarefa!',
    message: 'O primeiro passo é o mais importante!',
    confetti: true,
    duration: 2000,
  },
  all_tasks: {
    emoji: '🎉',
    title: 'Todas as tarefas!',
    message: 'Parabéns, você completou tudo!',
    confetti: true,
    duration: 3000,
  },
};

const CONFETTI_COLORS = [
  COLORS.primary.main,
  COLORS.secondary.main,
  COLORS.accent.success,
  '#FFD700',
  '#FF69B4',
  '#00CED1',
];

interface ConfettiPiece {
  id: number;
  x: number;
  y: Animated.Value;
  rotation: Animated.Value;
  color: string;
  size: number;
}

interface CelebrationOverlayProps {
  type: CelebrationType;
  visible: boolean;
  onDismiss: () => void;
  customMessage?: string;
  streakCount?: number;
}

export function CelebrationOverlay({
  type,
  visible,
  onDismiss,
  customMessage,
  streakCount,
}: CelebrationOverlayProps) {
  const config = CELEBRATION_CONFIGS[type];
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      bounceAnim.setValue(0);

      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Bounce the emoji
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ).start();

      // Generate confetti if needed
      if (config.confetti) {
        generateConfetti();
      }

      // Auto dismiss
      const timer = setTimeout(() => {
        dismissCelebration();
      }, config.duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  function generateConfetti() {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 30; i++) {
      pieces.push({
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        y: new Animated.Value(-50),
        rotation: new Animated.Value(0),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 8 + Math.random() * 8,
      });
    }
    setConfettiPieces(pieces);

    // Animate confetti falling
    pieces.forEach((piece, index) => {
      const delay = index * 50;
      Animated.parallel([
        Animated.timing(piece.y, {
          toValue: SCREEN_HEIGHT + 100,
          duration: 2000 + Math.random() * 1000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(piece.rotation, {
          toValue: 360 * (2 + Math.random() * 3),
          duration: 2000 + Math.random() * 1000,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }

  function dismissCelebration() {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setConfettiPieces([]);
      onDismiss();
    });
  }

  if (!visible) return null;

  const displayMessage = customMessage || config.message;
  const displayTitle = streakCount
    ? `${config.title} ${streakCount} dias!`
    : config.title;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <Animated.View
          key={piece.id}
          style={[
            styles.confettiPiece,
            {
              left: piece.x,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              transform: [
                { translateY: piece.y },
                {
                  rotate: piece.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      {/* Celebration Card */}
      <TouchableOpacity
        style={styles.cardWrapper}
        activeOpacity={0.9}
        onPress={dismissCelebration}
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.emoji,
              { transform: [{ translateY: bounceAnim }] },
            ]}
          >
            {config.emoji}
          </Animated.Text>
          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.message}>{displayMessage}</Text>
          <Text style={styles.tapHint}>Toque para continuar</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 2,
  },
  cardWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: SCREEN_WIDTH - SPACING.xl * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  tapHint: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
  },
});
