import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  CognitiveProfile,
  EnergyPattern,
} from '@nciaflux/shared';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type DiscoveryResultRouteProp = RouteProp<AuthStackParamList, 'DiscoveryResult'>;
type DiscoveryResultNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'DiscoveryResult'
>;

// Mock profile generator - In production, this would come from the API
function generateMockProfile(sessionId: string): CognitiveProfile {
  return {
    id: `profile_${sessionId}`,
    user_id: null,
    session_id: sessionId,
    summary:
      'Você tem um perfil com energia variável ao longo do dia, funcionando melhor em blocos de foco curtos com pausas frequentes.',
    insight:
      'Seu cérebro responde bem a estímulos externos como prazos e recompensas. Tarefas paralelas tendem a te dispersar - uma de cada vez funciona melhor.',
    suggestion:
      'Experimente a técnica Pomodoro (25 min foco + 5 min pausa) nos seus horários de pico de energia.',
    energy_pattern: {
      morning: 'medium',
      afternoon: 'high',
      evening: 'medium',
      night: 'low',
    } as EnergyPattern,
    execution_style: 'sequential',
    distraction_triggers: ['notifications', 'social_media', 'thoughts'],
    coping_strengths: ['lists', 'timers', 'music'],
    focus_duration_minutes: 25,
    best_focus_time: 'afternoon',
    needs_external_accountability: true,
    response_to_pressure: 'mixed',
    raw_answers: {},
    created_at: new Date(),
    updated_at: new Date(),
  };
}

export function DiscoveryResultScreen() {
  const navigation = useNavigation<DiscoveryResultNavigationProp>();
  const route = useRoute<DiscoveryResultRouteProp>();
  const { sessionId } = route.params;

  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setProfile(generateMockProfile(sessionId));
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  async function handleShare() {
    try {
      await Share.share({
        message: `Descobri meu perfil cognitivo no NeuroFluxo! ${profile?.summary}`,
        title: 'Meu Perfil NeuroFluxo',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  function handleContinue() {
    navigation.navigate('Register');
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
          <Text style={styles.loadingText}>Analisando seu perfil...</Text>
          <Text style={styles.loadingSubtext}>Isso leva só alguns segundos</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.title}>Seu Perfil Cognitivo</Text>
          <Text style={styles.subtitle}>Baseado nas suas respostas</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{profile.summary}</Text>
        </View>

        {/* Energy Pattern */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Padrão de Energia</Text>
          <View style={styles.energyGrid}>
            {Object.entries(profile.energy_pattern).map(([time, level]) => (
              <View key={time} style={styles.energyItem}>
                <Text style={styles.energyTime}>{getTimeLabel(time)}</Text>
                <View
                  style={[
                    styles.energyBar,
                    { backgroundColor: getEnergyColor(level as string) },
                  ]}
                />
                <Text style={styles.energyLevel}>{getEnergyLabel(level as string)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Principais Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightEmoji}>💡</Text>
            <Text style={styles.insightText}>{profile.insight}</Text>
          </View>
        </View>

        {/* Características */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suas Características</Text>

          <View style={styles.characteristicRow}>
            <View style={styles.characteristicLabel}>
              <Text style={styles.characteristicIcon}>⏱️</Text>
              <Text style={styles.characteristicName}>Foco ideal</Text>
            </View>
            <Text style={styles.characteristicValue}>
              {profile.focus_duration_minutes} minutos
            </Text>
          </View>

          <View style={styles.characteristicRow}>
            <View style={styles.characteristicLabel}>
              <Text style={styles.characteristicIcon}>📋</Text>
              <Text style={styles.characteristicName}>Estilo de execução</Text>
            </View>
            <Text style={styles.characteristicValue}>
              {getExecutionStyleLabel(profile.execution_style)}
            </Text>
          </View>

          <View style={styles.characteristicRow}>
            <View style={styles.characteristicLabel}>
              <Text style={styles.characteristicIcon}>🎯</Text>
              <Text style={styles.characteristicName}>Melhor horário</Text>
            </View>
            <Text style={styles.characteristicValue}>
              {getTimeLabel(profile.best_focus_time)}
            </Text>
          </View>
        </View>

        {/* O que te ajuda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que te ajuda</Text>
          <View style={styles.tagsContainer}>
            {profile.coping_strengths.map((strength) => (
              <View key={strength} style={styles.tagPositive}>
                <Text style={styles.tagPositiveText}>{getCopingLabel(strength)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* O que te distrai */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que te distrai</Text>
          <View style={styles.tagsContainer}>
            {profile.distraction_triggers.map((trigger) => (
              <View key={trigger} style={styles.tagNegative}>
                <Text style={styles.tagNegativeText}>{getDistractionLabel(trigger)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Suggestion */}
        <View style={styles.suggestionCard}>
          <Text style={styles.suggestionTitle}>💡 Sugestão para você</Text>
          <Text style={styles.suggestionText}>{profile.suggestion}</Text>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaText}>
            Quer um plano personalizado baseado no seu perfil?
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Criar minha conta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
            <Text style={styles.secondaryButtonText}>Compartilhar resultado</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeLabel(time: string): string {
  const labels: Record<string, string> = {
    morning: 'Manhã',
    afternoon: 'Tarde',
    evening: 'Noite',
    night: 'Madrugada',
  };
  return labels[time] || time;
}

function getEnergyLabel(level: string): string {
  const labels: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
  };
  return labels[level] || level;
}

function getEnergyColor(level: string): string {
  const colors: Record<string, string> = {
    low: COLORS.energy.low,
    medium: COLORS.energy.medium,
    high: COLORS.energy.high,
  };
  return colors[level] || COLORS.neutral.border;
}

function getExecutionStyleLabel(style: string): string {
  const labels: Record<string, string> = {
    sequential: 'Uma tarefa por vez',
    parallel: 'Várias ao mesmo tempo',
    burst: 'Em rajadas',
  };
  return labels[style] || style;
}

function getCopingLabel(coping: string): string {
  const labels: Record<string, string> = {
    lists: 'Listas',
    timers: 'Timers',
    music: 'Música',
    movement: 'Movimento',
    caffeine: 'Café',
    body_doubling: 'Companhia',
    rewards: 'Recompensas',
    deadlines: 'Prazos',
  };
  return labels[coping] || coping;
}

function getDistractionLabel(distraction: string): string {
  const labels: Record<string, string> = {
    notifications: 'Notificações',
    noise: 'Barulho',
    visual_clutter: 'Bagunça visual',
    thoughts: 'Pensamentos',
    social_media: 'Redes sociais',
    hunger: 'Fome',
    fatigue: 'Cansaço',
  };
  return labels[distraction] || distraction;
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginTop: SPACING.lg,
  },
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    marginTop: SPACING.xs,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
    marginTop: SPACING.xs,
  },
  summaryCard: {
    backgroundColor: COLORS.primary.main + '15',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary.main,
  },
  summaryText: {
    fontSize: 16,
    color: COLORS.neutral.textPrimary,
    lineHeight: 24,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.md,
  },
  energyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  energyItem: {
    alignItems: 'center',
    flex: 1,
  },
  energyTime: {
    fontSize: 12,
    color: COLORS.neutral.textSecondary,
    marginBottom: SPACING.xs,
  },
  energyBar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: SPACING.xs,
  },
  energyLevel: {
    fontSize: 11,
    color: COLORS.neutral.textMuted,
    fontWeight: '500',
  },
  insightCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  insightEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.neutral.textPrimary,
    lineHeight: 22,
  },
  characteristicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  characteristicLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  characteristicIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  characteristicName: {
    fontSize: 15,
    color: COLORS.neutral.textSecondary,
  },
  characteristicValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tagPositive: {
    backgroundColor: COLORS.accent.success + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  tagPositiveText: {
    fontSize: 14,
    color: COLORS.accent.success,
    fontWeight: '500',
  },
  tagNegative: {
    backgroundColor: COLORS.accent.warning + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  tagNegativeText: {
    fontSize: 14,
    color: COLORS.secondary.dark,
    fontWeight: '500',
  },
  suggestionCard: {
    backgroundColor: COLORS.secondary.light + '40',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary.dark,
    marginBottom: SPACING.sm,
  },
  suggestionText: {
    fontSize: 15,
    color: COLORS.neutral.textPrimary,
    lineHeight: 22,
  },
  ctaSection: {
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING['2xl'],
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.contrast,
  },
  secondaryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: COLORS.primary.main,
  },
});
