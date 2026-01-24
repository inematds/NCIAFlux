import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
} from '@nciaflux/shared';

type ReportPeriod = 'week' | 'month' | 'quarter';

interface DayData {
  day: string;
  tasksCompleted: number;
  focusMinutes: number;
  mood: number; // 1-5
  energy: number; // 1-5
}

// Mock data for demonstration
const MOCK_WEEKLY_DATA: DayData[] = [
  { day: 'Seg', tasksCompleted: 5, focusMinutes: 120, mood: 4, energy: 4 },
  { day: 'Ter', tasksCompleted: 3, focusMinutes: 90, mood: 3, energy: 3 },
  { day: 'Qua', tasksCompleted: 7, focusMinutes: 180, mood: 5, energy: 5 },
  { day: 'Qui', tasksCompleted: 4, focusMinutes: 105, mood: 4, energy: 3 },
  { day: 'Sex', tasksCompleted: 6, focusMinutes: 150, mood: 4, energy: 4 },
  { day: 'Sab', tasksCompleted: 2, focusMinutes: 45, mood: 3, energy: 2 },
  { day: 'Dom', tasksCompleted: 1, focusMinutes: 30, mood: 4, energy: 3 },
];

const MOCK_INSIGHTS = [
  {
    id: '1',
    emoji: '🌅',
    title: 'Melhor horário',
    description: 'Você é mais produtivo entre 9h e 12h',
    type: 'positive' as const,
  },
  {
    id: '2',
    emoji: '📊',
    title: 'Padrão de energia',
    description: 'Sua energia tende a cair após as 15h',
    type: 'neutral' as const,
  },
  {
    id: '3',
    emoji: '✅',
    title: 'Taxa de conclusão',
    description: 'Você completou 82% das tarefas planejadas',
    type: 'positive' as const,
  },
  {
    id: '4',
    emoji: '🔥',
    title: 'Técnica favorita',
    description: 'Pomodoro é sua técnica de foco mais usada',
    type: 'neutral' as const,
  },
];

const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
  { value: 'quarter', label: 'Trimestre' },
];

export function ReportsScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState<ReportPeriod>('week');

  const weeklyStats = {
    tasksCompleted: MOCK_WEEKLY_DATA.reduce((sum, d) => sum + d.tasksCompleted, 0),
    focusMinutes: MOCK_WEEKLY_DATA.reduce((sum, d) => sum + d.focusMinutes, 0),
    avgMood: (MOCK_WEEKLY_DATA.reduce((sum, d) => sum + d.mood, 0) / MOCK_WEEKLY_DATA.length).toFixed(1),
    avgEnergy: (MOCK_WEEKLY_DATA.reduce((sum, d) => sum + d.energy, 0) / MOCK_WEEKLY_DATA.length).toFixed(1),
  };

  const maxTasks = Math.max(...MOCK_WEEKLY_DATA.map((d) => d.tasksCompleted));

  function formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  }

  function getMoodEmoji(mood: number): string {
    const emojis = ['😢', '😔', '😐', '🙂', '😊'];
    return emojis[Math.min(mood - 1, 4)] || '😐';
  }

  function getInsightColor(type: 'positive' | 'neutral' | 'warning'): string {
    switch (type) {
      case 'positive':
        return COLORS.accent.success;
      case 'warning':
        return COLORS.accent.error;
      default:
        return COLORS.primary.main;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatórios</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {PERIOD_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.periodButton,
                period === option.value && styles.periodButtonActive,
              ]}
              onPress={() => setPeriod(option.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  period === option.value && styles.periodButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{weeklyStats.tasksCompleted}</Text>
            <Text style={styles.statLabel}>Tarefas concluídas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatMinutes(weeklyStats.focusMinutes)}</Text>
            <Text style={styles.statLabel}>Tempo de foco</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getMoodEmoji(parseFloat(weeklyStats.avgMood))}</Text>
            <Text style={styles.statLabel}>Humor médio</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{weeklyStats.avgEnergy}</Text>
            <Text style={styles.statLabel}>Energia média</Text>
          </View>
        </View>

        {/* Tasks Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Tarefas por dia</Text>
          <View style={styles.chartContainer}>
            {MOCK_WEEKLY_DATA.map((data, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { height: `${(data.tasksCompleted / maxTasks) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Focus Time Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Tempo de foco (minutos)</Text>
          <View style={styles.focusChartContainer}>
            {MOCK_WEEKLY_DATA.map((data, index) => {
              const maxFocus = Math.max(...MOCK_WEEKLY_DATA.map((d) => d.focusMinutes));
              return (
                <View key={index} style={styles.focusRow}>
                  <Text style={styles.focusDay}>{data.day}</Text>
                  <View style={styles.focusBarWrapper}>
                    <View
                      style={[
                        styles.focusBar,
                        { width: `${(data.focusMinutes / maxFocus) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.focusValue}>{data.focusMinutes}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Mood & Energy Trend */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Humor e Energia</Text>
          <View style={styles.moodGrid}>
            {MOCK_WEEKLY_DATA.map((data, index) => (
              <View key={index} style={styles.moodDayCard}>
                <Text style={styles.moodDay}>{data.day}</Text>
                <Text style={styles.moodEmoji}>{getMoodEmoji(data.mood)}</Text>
                <View style={styles.energyDots}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.energyDot,
                        level <= data.energy && styles.energyDotFilled,
                      ]}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Insights Section */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {MOCK_INSIGHTS.map((insight) => (
            <View
              key={insight.id}
              style={[
                styles.insightCard,
                { borderLeftColor: getInsightColor(insight.type) },
              ]}
            >
              <Text style={styles.insightEmoji}>{insight.emoji}</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Share/Export Button */}
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportEmoji}>📤</Text>
          <Text style={styles.exportButtonText}>Compartilhar relatório</Text>
        </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
    backgroundColor: COLORS.neutral.white,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backText: {
    fontSize: 24,
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary.main,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral.textSecondary,
  },
  periodButtonTextActive: {
    color: COLORS.primary.contrast,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary.main,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.neutral.textSecondary,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    width: '60%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.sm,
    minHeight: 4,
  },
  barLabel: {
    marginTop: SPACING.sm,
    fontSize: 12,
    color: COLORS.neutral.textSecondary,
  },
  focusChartContainer: {
    gap: SPACING.sm,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusDay: {
    width: 32,
    fontSize: 12,
    color: COLORS.neutral.textSecondary,
  },
  focusBarWrapper: {
    flex: 1,
    height: 16,
    backgroundColor: COLORS.neutral.border,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginHorizontal: SPACING.sm,
  },
  focusBar: {
    height: '100%',
    backgroundColor: COLORS.secondary.main,
    borderRadius: BORDER_RADIUS.sm,
  },
  focusValue: {
    width: 40,
    fontSize: 12,
    color: COLORS.neutral.textSecondary,
    textAlign: 'right',
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodDayCard: {
    alignItems: 'center',
    padding: SPACING.xs,
  },
  moodDay: {
    fontSize: 11,
    color: COLORS.neutral.textMuted,
    marginBottom: SPACING.xs,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  energyDots: {
    flexDirection: 'row',
    gap: 2,
  },
  energyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.neutral.border,
  },
  energyDotFilled: {
    backgroundColor: COLORS.secondary.main,
  },
  insightsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.md,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
  },
  insightEmoji: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: 13,
    color: COLORS.neutral.textSecondary,
    lineHeight: 18,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary.main,
  },
  exportEmoji: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.main,
  },
});
