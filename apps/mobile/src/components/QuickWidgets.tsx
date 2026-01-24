import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

import { COLORS, SPACING, BORDER_RADIUS, Task, TaskPriority } from '@nciaflux/shared';

// Quick Task Widget - One touch to complete
interface QuickTaskWidgetProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onPress: (taskId: string) => void;
}

export function QuickTaskWidget({ task, onComplete, onPress }: QuickTaskWidgetProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const scaleAnim = new Animated.Value(1);

  const priorityColors: Record<TaskPriority, string> = {
    high: COLORS.accent.error,
    medium: COLORS.secondary.main,
    low: COLORS.accent.success,
  };

  function handleLongPress() {
    setIsCompleting(true);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete(task.id);
      setIsCompleting(false);
    });
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.taskWidget,
          { borderLeftColor: priorityColors[task.priority] },
        ]}
        onPress={() => onPress(task.id)}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        <View style={styles.taskWidgetContent}>
          <Text style={styles.taskWidgetTitle} numberOfLines={1}>
            {task.title}
          </Text>
          {task.estimated_duration_minutes && (
            <Text style={styles.taskWidgetMeta}>
              {task.estimated_duration_minutes} min
            </Text>
          )}
        </View>
        <View style={styles.taskWidgetAction}>
          <Text style={styles.taskWidgetActionIcon}>
            {isCompleting ? '✓' : '○'}
          </Text>
        </View>
        <Text style={styles.taskWidgetHint}>Segure para completar</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Quick Focus Widget - Start focus with one touch
interface QuickFocusWidgetProps {
  technique: 'pomodoro' | 'deep_work' | 'timeboxing' | 'free_flow';
  onStart: (technique: string) => void;
  isActive?: boolean;
  remainingMinutes?: number;
}

const TECHNIQUE_CONFIG = {
  pomodoro: { emoji: '🍅', name: 'Pomodoro', minutes: 25 },
  deep_work: { emoji: '🧠', name: 'Deep Work', minutes: 45 },
  timeboxing: { emoji: '📦', name: 'Timebox', minutes: 15 },
  free_flow: { emoji: '🌊', name: 'Fluxo', minutes: 0 },
};

export function QuickFocusWidget({
  technique,
  onStart,
  isActive = false,
  remainingMinutes,
}: QuickFocusWidgetProps) {
  const config = TECHNIQUE_CONFIG[technique];
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (isActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isActive]);

  return (
    <Animated.View style={{ transform: [{ scale: isActive ? pulseAnim : 1 }] }}>
      <TouchableOpacity
        style={[
          styles.focusWidget,
          isActive && styles.focusWidgetActive,
        ]}
        onPress={() => onStart(technique)}
        disabled={isActive}
      >
        <Text style={styles.focusWidgetEmoji}>{config.emoji}</Text>
        <Text style={styles.focusWidgetName}>{config.name}</Text>
        {isActive && remainingMinutes !== undefined ? (
          <Text style={styles.focusWidgetTime}>{remainingMinutes} min</Text>
        ) : (
          config.minutes > 0 && (
            <Text style={styles.focusWidgetDuration}>{config.minutes} min</Text>
          )
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Quick Energy Check Widget
interface QuickEnergyWidgetProps {
  currentEnergy?: number;
  onSelect: (energy: number) => void;
}

const ENERGY_OPTIONS = [
  { value: 1, emoji: '😴' },
  { value: 2, emoji: '😐' },
  { value: 3, emoji: '🙂' },
  { value: 4, emoji: '😊' },
  { value: 5, emoji: '⚡' },
];

export function QuickEnergyWidget({ currentEnergy, onSelect }: QuickEnergyWidgetProps) {
  return (
    <View style={styles.energyWidget}>
      <Text style={styles.energyWidgetLabel}>Energia agora:</Text>
      <View style={styles.energyWidgetOptions}>
        {ENERGY_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.energyWidgetOption,
              currentEnergy === option.value && styles.energyWidgetOptionSelected,
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={styles.energyWidgetEmoji}>{option.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Quick Action Button Widget
interface QuickActionWidgetProps {
  emoji: string;
  label: string;
  color?: string;
  onPress: () => void;
  badge?: number;
}

export function QuickActionWidget({
  emoji,
  label,
  color = COLORS.primary.main,
  onPress,
  badge,
}: QuickActionWidgetProps) {
  return (
    <TouchableOpacity
      style={[styles.actionWidget, { backgroundColor: color + '15' }]}
      onPress={onPress}
    >
      <View style={styles.actionWidgetIconContainer}>
        <Text style={styles.actionWidgetEmoji}>{emoji}</Text>
        {badge !== undefined && badge > 0 && (
          <View style={styles.actionWidgetBadge}>
            <Text style={styles.actionWidgetBadgeText}>
              {badge > 9 ? '9+' : badge}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.actionWidgetLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// Crisis Mode Quick Access Widget
interface CrisisWidgetProps {
  onActivate: () => void;
}

export function CrisisWidget({ onActivate }: CrisisWidgetProps) {
  return (
    <TouchableOpacity style={styles.crisisWidget} onPress={onActivate}>
      <View style={styles.crisisWidgetIcon}>
        <Text style={styles.crisisWidgetEmoji}>🫂</Text>
      </View>
      <View style={styles.crisisWidgetContent}>
        <Text style={styles.crisisWidgetTitle}>Dia difícil?</Text>
        <Text style={styles.crisisWidgetSubtitle}>Ative o modo crise</Text>
      </View>
    </TouchableOpacity>
  );
}

// Streak Widget
interface StreakWidgetProps {
  streakDays: number;
  lastCheckIn?: Date;
}

export function StreakWidget({ streakDays, lastCheckIn }: StreakWidgetProps) {
  const isToday = lastCheckIn
    ? new Date().toDateString() === new Date(lastCheckIn).toDateString()
    : false;

  return (
    <View style={styles.streakWidget}>
      <View style={styles.streakWidgetMain}>
        <Text style={styles.streakWidgetEmoji}>🔥</Text>
        <Text style={styles.streakWidgetCount}>{streakDays}</Text>
        <Text style={styles.streakWidgetLabel}>dias</Text>
      </View>
      <View
        style={[
          styles.streakWidgetStatus,
          isToday ? styles.streakWidgetStatusActive : styles.streakWidgetStatusPending,
        ]}
      >
        <Text style={styles.streakWidgetStatusText}>
          {isToday ? '✓ Hoje' : 'Pendente'}
        </Text>
      </View>
    </View>
  );
}

// Progress Ring Widget
interface ProgressRingWidgetProps {
  completed: number;
  total: number;
  label: string;
  color?: string;
}

export function ProgressRingWidget({
  completed,
  total,
  label,
  color = COLORS.primary.main,
}: ProgressRingWidgetProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.progressRingWidget}>
      <View style={styles.progressRingContainer}>
        <View style={[styles.progressRingBackground, { borderColor: color + '30' }]} />
        <View
          style={[
            styles.progressRingFill,
            {
              borderColor: color,
              borderRightColor: percentage > 50 ? color : 'transparent',
              borderBottomColor: percentage > 75 ? color : 'transparent',
              transform: [{ rotate: `${(percentage / 100) * 360}deg` }],
            },
          ]}
        />
        <View style={styles.progressRingCenter}>
          <Text style={[styles.progressRingPercentage, { color }]}>{percentage}%</Text>
        </View>
      </View>
      <Text style={styles.progressRingLabel}>{label}</Text>
      <Text style={styles.progressRingDetail}>
        {completed}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Quick Task Widget
  taskWidget: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: SPACING.sm,
  },
  taskWidgetContent: {
    flex: 1,
    paddingRight: SPACING.lg,
  },
  taskWidgetTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.neutral.textPrimary,
    marginBottom: 2,
  },
  taskWidgetMeta: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
  },
  taskWidgetAction: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
  },
  taskWidgetActionIcon: {
    fontSize: 20,
    color: COLORS.neutral.textMuted,
  },
  taskWidgetHint: {
    fontSize: 10,
    color: COLORS.neutral.textMuted,
    marginTop: SPACING.xs,
  },

  // Quick Focus Widget
  focusWidget: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  focusWidgetActive: {
    backgroundColor: COLORS.primary.main,
  },
  focusWidgetEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  focusWidgetName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  focusWidgetDuration: {
    fontSize: 10,
    color: COLORS.neutral.textMuted,
    marginTop: 2,
  },
  focusWidgetTime: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary.contrast,
    marginTop: 2,
  },

  // Quick Energy Widget
  energyWidget: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  energyWidgetLabel: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  energyWidgetOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  energyWidgetOption: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  energyWidgetOptionSelected: {
    backgroundColor: COLORS.primary.light + '30',
  },
  energyWidgetEmoji: {
    fontSize: 24,
  },

  // Quick Action Widget
  actionWidget: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    minWidth: 80,
  },
  actionWidgetIconContainer: {
    position: 'relative',
  },
  actionWidgetEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  actionWidgetBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.accent.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionWidgetBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
  actionWidgetLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Crisis Widget
  crisisWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.crisis.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  crisisWidgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  crisisWidgetEmoji: {
    fontSize: 20,
  },
  crisisWidgetContent: {
    flex: 1,
  },
  crisisWidgetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  crisisWidgetSubtitle: {
    fontSize: 12,
    color: COLORS.neutral.textSecondary,
  },

  // Streak Widget
  streakWidget: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  streakWidgetMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  streakWidgetEmoji: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  streakWidgetCount: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.accent.warning,
  },
  streakWidgetLabel: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    marginLeft: SPACING.xs,
  },
  streakWidgetStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  streakWidgetStatusActive: {
    backgroundColor: COLORS.accent.success + '20',
  },
  streakWidgetStatusPending: {
    backgroundColor: COLORS.neutral.border,
  },
  streakWidgetStatusText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.neutral.textSecondary,
  },

  // Progress Ring Widget
  progressRingWidget: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  progressRingContainer: {
    width: 60,
    height: 60,
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  progressRingBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    borderWidth: 6,
  },
  progressRingFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    borderWidth: 6,
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
  },
  progressRingCenter: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingPercentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressRingLabel: {
    fontSize: 12,
    color: COLORS.neutral.textSecondary,
    textAlign: 'center',
  },
  progressRingDetail: {
    fontSize: 10,
    color: COLORS.neutral.textMuted,
  },
});
