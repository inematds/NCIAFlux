import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

import { COLORS, SPACING, BORDER_RADIUS } from '@nciaflux/shared';

export type RewardType = 'points' | 'streak' | 'badge' | 'level_up' | 'xp';

interface MicroRewardProps {
  type: RewardType;
  value: number | string;
  visible: boolean;
  onComplete?: () => void;
  position?: 'top' | 'bottom' | 'center';
}

const REWARD_CONFIGS: Record<RewardType, { emoji: string; prefix: string; suffix: string; color: string }> = {
  points: { emoji: '✨', prefix: '+', suffix: ' pts', color: COLORS.primary.main },
  streak: { emoji: '🔥', prefix: '', suffix: ' dias', color: COLORS.accent.warning },
  badge: { emoji: '🏅', prefix: '', suffix: '', color: COLORS.secondary.main },
  level_up: { emoji: '⬆️', prefix: 'Nível ', suffix: '', color: COLORS.accent.success },
  xp: { emoji: '⚡', prefix: '+', suffix: ' XP', color: COLORS.primary.main },
};

export function MicroReward({
  type,
  value,
  visible,
  onComplete,
  position = 'center',
}: MicroRewardProps) {
  const config = REWARD_CONFIGS[type];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(position === 'bottom' ? 20 : -20)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      // Reset
      fadeAnim.setValue(0);
      translateY.setValue(position === 'bottom' ? 20 : -20);
      scaleAnim.setValue(0.5);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Float up and fade out
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: position === 'bottom' ? 20 : -30,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete?.();
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return { top: 100 };
      case 'bottom':
        return { bottom: 150 };
      default:
        return { top: '40%' };
    }
  };

  return (
    <View style={[styles.container, getPositionStyle()]} pointerEvents="none">
      <Animated.View
        style={[
          styles.badge,
          { backgroundColor: config.color },
          {
            opacity: fadeAnim,
            transform: [
              { translateY },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={styles.value}>
          {config.prefix}{value}{config.suffix}
        </Text>
      </Animated.View>
    </View>
  );
}

// Floating achievement badge component
interface AchievementBadgeProps {
  emoji: string;
  title: string;
  description: string;
  visible: boolean;
  onDismiss: () => void;
}

export function AchievementBadge({
  emoji,
  title,
  description,
  visible,
  onDismiss,
}: AchievementBadgeProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 3 seconds
      const timer = setTimeout(() => {
        dismissBadge();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  function dismissBadge() {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.achievementContainer,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.achievementBadge}>
        <View style={styles.achievementIcon}>
          <Text style={styles.achievementEmoji}>{emoji}</Text>
        </View>
        <View style={styles.achievementContent}>
          <Text style={styles.achievementTitle}>{title}</Text>
          <Text style={styles.achievementDescription}>{description}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// Progress milestone indicator
interface ProgressMilestoneProps {
  current: number;
  total: number;
  milestones?: number[];
  onMilestoneReached?: (milestone: number) => void;
}

export function ProgressMilestone({
  current,
  total,
  milestones = [25, 50, 75, 100],
}: ProgressMilestoneProps) {
  const progress = (current / total) * 100;

  return (
    <View style={styles.milestoneContainer}>
      <View style={styles.milestoneTrack}>
        <View style={[styles.milestoneFill, { width: `${Math.min(progress, 100)}%` }]} />
        {milestones.map((milestone) => (
          <View
            key={milestone}
            style={[
              styles.milestoneMarker,
              { left: `${milestone}%` },
              progress >= milestone && styles.milestoneMarkerReached,
            ]}
          >
            {progress >= milestone && (
              <Text style={styles.milestoneCheck}>✓</Text>
            )}
          </View>
        ))}
      </View>
      <View style={styles.milestoneLabels}>
        {milestones.map((milestone) => (
          <Text
            key={milestone}
            style={[
              styles.milestoneLabel,
              { left: `${milestone}%` },
              progress >= milestone && styles.milestoneLabelReached,
            ]}
          >
            {milestone}%
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emoji: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
  // Achievement badge styles
  achievementContainer: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 1000,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary.main,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary.light + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 13,
    color: COLORS.neutral.textSecondary,
  },
  // Progress milestone styles
  milestoneContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  milestoneTrack: {
    height: 8,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  milestoneFill: {
    height: '100%',
    backgroundColor: COLORS.primary.main,
    borderRadius: 4,
  },
  milestoneMarker: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
    marginLeft: -8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneMarkerReached: {
    backgroundColor: COLORS.accent.success,
    borderColor: COLORS.accent.success,
  },
  milestoneCheck: {
    fontSize: 10,
    color: COLORS.neutral.white,
    fontWeight: '700',
  },
  milestoneLabels: {
    position: 'relative',
    height: 20,
    marginTop: SPACING.xs,
  },
  milestoneLabel: {
    position: 'absolute',
    fontSize: 10,
    color: COLORS.neutral.textMuted,
    marginLeft: -12,
  },
  milestoneLabelReached: {
    color: COLORS.accent.success,
    fontWeight: '600',
  },
});
