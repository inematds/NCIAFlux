import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  NotificationPreferences,
} from '@nciaflux/shared';
import { notificationService } from '../../services/notifications';

type NotificationTone = 'gentle' | 'encouraging' | 'direct';

const TONE_OPTIONS: { value: NotificationTone; label: string; description: string; emoji: string }[] = [
  {
    value: 'gentle',
    label: 'Gentil',
    description: 'Mensagens suaves e acolhedoras',
    emoji: '🌸',
  },
  {
    value: 'encouraging',
    label: 'Encorajador',
    description: 'Mensagens motivacionais e positivas',
    emoji: '💪',
  },
  {
    value: 'direct',
    label: 'Direto',
    description: 'Mensagens objetivas e práticas',
    emoji: '📌',
  },
];

const TIME_PRESETS = [
  { label: '20:00', value: '20:00' },
  { label: '21:00', value: '21:00' },
  { label: '22:00', value: '22:00' },
  { label: '23:00', value: '23:00' },
];

const WAKE_PRESETS = [
  { label: '06:00', value: '06:00' },
  { label: '07:00', value: '07:00' },
  { label: '08:00', value: '08:00' },
  { label: '09:00', value: '09:00' },
];

export function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    const prefs = notificationService.getPreferences();
    setPreferences(prefs);
  }

  function updatePreference<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }

  async function savePreferences() {
    await notificationService.savePreferences(preferences);
    setHasChanges(false);
    navigation.goBack();
  }

  function renderToggleRow(
    label: string,
    description: string,
    key: keyof NotificationPreferences,
    emoji: string
  ) {
    const value = preferences[key] as boolean;
    return (
      <View style={styles.toggleRow}>
        <Text style={styles.toggleEmoji}>{emoji}</Text>
        <View style={styles.toggleContent}>
          <Text style={styles.toggleLabel}>{label}</Text>
          <Text style={styles.toggleDescription}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={(v) => updatePreference(key, v as never)}
          trackColor={{ false: COLORS.neutral.border, true: COLORS.primary.light }}
          thumbColor={value ? COLORS.primary.main : COLORS.neutral.textMuted}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <TouchableOpacity
          onPress={savePreferences}
          style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
          disabled={!hasChanges}
        >
          <Text
            style={[styles.saveButtonText, !hasChanges && styles.saveButtonTextDisabled]}
          >
            Salvar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Toggle */}
        <View style={styles.masterToggle}>
          <View style={styles.masterToggleContent}>
            <Text style={styles.masterToggleLabel}>Notificações</Text>
            <Text style={styles.masterToggleDescription}>
              {preferences.enabled ? 'Ativas' : 'Desativadas'}
            </Text>
          </View>
          <Switch
            value={preferences.enabled}
            onValueChange={(v) => updatePreference('enabled', v)}
            trackColor={{ false: COLORS.neutral.border, true: COLORS.primary.light }}
            thumbColor={preferences.enabled ? COLORS.primary.main : COLORS.neutral.textMuted}
          />
        </View>

        {preferences.enabled && (
          <>
            {/* Notification Types */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipos de Notificação</Text>
              <View style={styles.card}>
                {renderToggleRow(
                  'Lembretes de Check-in',
                  'Lembretes para fazer seu check-in diário',
                  'check_in_reminders',
                  '📝'
                )}
                <View style={styles.divider} />
                {renderToggleRow(
                  'Lembretes de Tarefas',
                  'Alertas sobre tarefas agendadas',
                  'task_reminders',
                  '✅'
                )}
                <View style={styles.divider} />
                {renderToggleRow(
                  'Lembretes de Foco',
                  'Início e fim de blocos de foco',
                  'focus_reminders',
                  '🎯'
                )}
                <View style={styles.divider} />
                {renderToggleRow(
                  'Celebrações',
                  'Comemore suas conquistas',
                  'celebrations',
                  '🎉'
                )}
              </View>
            </View>

            {/* Quiet Hours */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Horário de Silêncio</Text>
              <Text style={styles.sectionDescription}>
                Nenhuma notificação será enviada durante este período
              </Text>
              <View style={styles.card}>
                <View style={styles.quietHoursRow}>
                  <View style={styles.quietHoursItem}>
                    <Text style={styles.quietHoursLabel}>Início</Text>
                    <View style={styles.timePresets}>
                      {TIME_PRESETS.map((preset) => (
                        <TouchableOpacity
                          key={preset.value}
                          style={[
                            styles.timePresetButton,
                            preferences.quiet_hours_start === preset.value &&
                              styles.timePresetButtonActive,
                          ]}
                          onPress={() => updatePreference('quiet_hours_start', preset.value)}
                        >
                          <Text
                            style={[
                              styles.timePresetText,
                              preferences.quiet_hours_start === preset.value &&
                                styles.timePresetTextActive,
                            ]}
                          >
                            {preset.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                <View style={styles.quietHoursRow}>
                  <View style={styles.quietHoursItem}>
                    <Text style={styles.quietHoursLabel}>Fim</Text>
                    <View style={styles.timePresets}>
                      {WAKE_PRESETS.map((preset) => (
                        <TouchableOpacity
                          key={preset.value}
                          style={[
                            styles.timePresetButton,
                            preferences.quiet_hours_end === preset.value &&
                              styles.timePresetButtonActive,
                          ]}
                          onPress={() => updatePreference('quiet_hours_end', preset.value)}
                        >
                          <Text
                            style={[
                              styles.timePresetText,
                              preferences.quiet_hours_end === preset.value &&
                                styles.timePresetTextActive,
                            ]}
                          >
                            {preset.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Daily Limit */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Limite Diário</Text>
              <Text style={styles.sectionDescription}>
                Máximo de notificações por dia (atual: {preferences.max_daily_notifications})
              </Text>
              <View style={styles.card}>
                <View style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>4</Text>
                  <View style={styles.sliderTrack}>
                    {[4, 6, 8, 10, 12].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.sliderDot,
                          preferences.max_daily_notifications >= value && styles.sliderDotActive,
                        ]}
                        onPress={() => updatePreference('max_daily_notifications', value)}
                      >
                        {preferences.max_daily_notifications === value && (
                          <View style={styles.sliderDotSelected} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.sliderLabel}>12</Text>
                </View>
              </View>
            </View>

            {/* Tone */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tom das Mensagens</Text>
              <Text style={styles.sectionDescription}>
                Escolha como você prefere receber as notificações
              </Text>
              <View style={styles.toneOptions}>
                {TONE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.toneCard,
                      preferences.preferred_tone === option.value && styles.toneCardActive,
                    ]}
                    onPress={() => updatePreference('preferred_tone', option.value)}
                  >
                    <Text style={styles.toneEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.toneLabel,
                        preferences.preferred_tone === option.value && styles.toneLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.toneDescription}>{option.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prévia</Text>
              <View style={styles.previewCard}>
                <View style={styles.previewIcon}>
                  <Text style={styles.previewEmoji}>🔔</Text>
                </View>
                <View style={styles.previewContent}>
                  <Text style={styles.previewTitle}>
                    {preferences.preferred_tone === 'gentle'
                      ? 'Hora do check-in'
                      : preferences.preferred_tone === 'encouraging'
                      ? 'Vamos lá!'
                      : 'Check-in pendente'}
                  </Text>
                  <Text style={styles.previewBody}>
                    {preferences.preferred_tone === 'gentle'
                      ? 'Que tal fazer um check-in rápido? Estou aqui com você.'
                      : preferences.preferred_tone === 'encouraging'
                      ? 'Você consegue! Só 1 minuto para registrar como está.'
                      : 'Faça seu check-in agora.'}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Test Notification */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => notificationService.sendCheckInReminder()}
        >
          <Text style={styles.testButtonEmoji}>🔔</Text>
          <Text style={styles.testButtonText}>Enviar notificação de teste</Text>
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
  saveButton: {
    padding: SPACING.sm,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.main,
  },
  saveButtonTextDisabled: {
    color: COLORS.neutral.textMuted,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  masterToggleContent: {
    flex: 1,
  },
  masterToggleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  masterToggleDescription: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: 13,
    color: COLORS.neutral.textMuted,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  toggleEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.neutral.textPrimary,
  },
  toggleDescription: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral.border,
    marginVertical: SPACING.xs,
  },
  quietHoursRow: {
    marginBottom: SPACING.md,
  },
  quietHoursItem: {},
  quietHoursLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral.textSecondary,
    marginBottom: SPACING.sm,
  },
  timePresets: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  timePresetButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.neutral.background,
    alignItems: 'center',
  },
  timePresetButtonActive: {
    backgroundColor: COLORS.primary.main,
  },
  timePresetText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral.textSecondary,
  },
  timePresetTextActive: {
    color: COLORS.primary.contrast,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  sliderLabel: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    width: 24,
    textAlign: 'center',
  },
  sliderTrack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    height: 24,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
  },
  sliderDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderDotActive: {
    backgroundColor: COLORS.primary.light,
  },
  sliderDotSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary.main,
  },
  toneOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  toneCard: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toneCardActive: {
    borderColor: COLORS.primary.main,
    backgroundColor: COLORS.primary.light + '10',
  },
  toneEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  toneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: 2,
  },
  toneLabelActive: {
    color: COLORS.primary.main,
  },
  toneDescription: {
    fontSize: 11,
    color: COLORS.neutral.textMuted,
    textAlign: 'center',
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary.light + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  previewEmoji: {
    fontSize: 20,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: 2,
  },
  previewBody: {
    fontSize: 13,
    color: COLORS.neutral.textSecondary,
    lineHeight: 18,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    marginTop: SPACING.lg,
  },
  testButtonEmoji: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral.textSecondary,
  },
});
