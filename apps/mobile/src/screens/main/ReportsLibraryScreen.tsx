import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
} from '@nciaflux/shared';

type ReportCategory = 'overview' | 'focus' | 'mood' | 'tasks' | 'patterns';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  emoji: string;
  isPremium: boolean;
  dataRequired: string[];
  previewUrl?: string;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'weekly_summary',
    name: 'Resumo Semanal',
    description: 'Visão geral da sua semana com principais métricas',
    category: 'overview',
    emoji: '📊',
    isPremium: false,
    dataRequired: ['tasks', 'focus', 'checkins'],
  },
  {
    id: 'monthly_progress',
    name: 'Progresso Mensal',
    description: 'Análise detalhada do seu mês com tendências',
    category: 'overview',
    emoji: '📈',
    isPremium: true,
    dataRequired: ['tasks', 'focus', 'checkins', 'streaks'],
  },
  {
    id: 'focus_analysis',
    name: 'Análise de Foco',
    description: 'Detalhamento das suas sessões de foco',
    category: 'focus',
    emoji: '🎯',
    isPremium: false,
    dataRequired: ['focus'],
  },
  {
    id: 'focus_techniques',
    name: 'Técnicas de Foco',
    description: 'Comparativo de eficácia entre técnicas',
    category: 'focus',
    emoji: '⚡',
    isPremium: true,
    dataRequired: ['focus'],
  },
  {
    id: 'energy_patterns',
    name: 'Padrões de Energia',
    description: 'Seus níveis de energia ao longo do tempo',
    category: 'mood',
    emoji: '🔋',
    isPremium: false,
    dataRequired: ['checkins'],
  },
  {
    id: 'mood_tracker',
    name: 'Tracker de Humor',
    description: 'Acompanhamento detalhado do seu humor',
    category: 'mood',
    emoji: '😊',
    isPremium: true,
    dataRequired: ['checkins'],
  },
  {
    id: 'task_completion',
    name: 'Taxa de Conclusão',
    description: 'Análise de conclusão de tarefas',
    category: 'tasks',
    emoji: '✅',
    isPremium: false,
    dataRequired: ['tasks'],
  },
  {
    id: 'productivity_score',
    name: 'Score de Produtividade',
    description: 'Índice composto de produtividade',
    category: 'tasks',
    emoji: '🏆',
    isPremium: true,
    dataRequired: ['tasks', 'focus'],
  },
  {
    id: 'best_times',
    name: 'Melhores Horários',
    description: 'Quando você é mais produtivo',
    category: 'patterns',
    emoji: '⏰',
    isPremium: false,
    dataRequired: ['tasks', 'focus'],
  },
  {
    id: 'weekly_patterns',
    name: 'Padrões Semanais',
    description: 'Tendências por dia da semana',
    category: 'patterns',
    emoji: '📅',
    isPremium: true,
    dataRequired: ['tasks', 'focus', 'checkins'],
  },
  {
    id: 'professional_report',
    name: 'Relatório Profissional',
    description: 'Relatório para compartilhar com terapeuta/coach',
    category: 'overview',
    emoji: '👨‍⚕️',
    isPremium: true,
    dataRequired: ['tasks', 'focus', 'checkins', 'streaks'],
  },
];

const CATEGORIES: { value: ReportCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'Todos', emoji: '📑' },
  { value: 'overview', label: 'Visão Geral', emoji: '📊' },
  { value: 'focus', label: 'Foco', emoji: '🎯' },
  { value: 'mood', label: 'Humor', emoji: '😊' },
  { value: 'tasks', label: 'Tarefas', emoji: '✅' },
  { value: 'patterns', label: 'Padrões', emoji: '🔍' },
];

export function ReportsLibraryScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'all'>('all');
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const filteredReports = REPORT_TEMPLATES.filter(
    (r) => selectedCategory === 'all' || r.category === selectedCategory
  );

  const freeReports = filteredReports.filter((r) => !r.isPremium);
  const premiumReports = filteredReports.filter((r) => r.isPremium);

  function handleReportPress(report: ReportTemplate) {
    setSelectedReport(report);
    setShowPreviewModal(true);
  }

  function handleGenerateReport() {
    // In production, this would navigate to the report generation screen
    setShowPreviewModal(false);
    // navigation.navigate('GenerateReport', { reportId: selectedReport?.id });
  }

  function renderReportCard(report: ReportTemplate) {
    return (
      <TouchableOpacity
        key={report.id}
        style={styles.reportCard}
        onPress={() => handleReportPress(report)}
      >
        <View style={styles.reportHeader}>
          <Text style={styles.reportEmoji}>{report.emoji}</Text>
          {report.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          )}
        </View>
        <Text style={styles.reportName}>{report.name}</Text>
        <Text style={styles.reportDescription}>{report.description}</Text>
        <View style={styles.reportMeta}>
          <Text style={styles.reportMetaText}>
            {report.dataRequired.length} fonte{report.dataRequired.length > 1 ? 's' : ''} de dados
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biblioteca de Relatórios</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.categoryTab,
              selectedCategory === category.value && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(category.value)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === category.value && styles.categoryLabelActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Free Reports */}
        {freeReports.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Relatórios Gratuitos</Text>
            <View style={styles.reportsGrid}>
              {freeReports.map(renderReportCard)}
            </View>
          </View>
        )}

        {/* Premium Reports */}
        {premiumReports.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Relatórios Premium</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PLANO AVANÇADO</Text>
              </View>
            </View>
            <View style={styles.reportsGrid}>
              {premiumReports.map(renderReportCard)}
            </View>
          </View>
        )}

        {/* Recent Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relatórios Recentes</Text>
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>Nenhum relatório gerado ainda</Text>
            <Text style={styles.emptySubtext}>
              Escolha um modelo acima para gerar seu primeiro relatório
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Report Preview Modal */}
      <Modal
        visible={showPreviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowPreviewModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Prévia do Relatório</Text>
            <View style={styles.headerSpacer} />
          </View>

          {selectedReport && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalReportHeader}>
                <Text style={styles.modalReportEmoji}>{selectedReport.emoji}</Text>
                <Text style={styles.modalReportName}>{selectedReport.name}</Text>
                <Text style={styles.modalReportDescription}>
                  {selectedReport.description}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Dados Incluídos</Text>
                <View style={styles.dataSourcesList}>
                  {selectedReport.dataRequired.map((source) => (
                    <View key={source} style={styles.dataSourceItem}>
                      <Text style={styles.dataSourceIcon}>✓</Text>
                      <Text style={styles.dataSourceText}>
                        {source === 'tasks'
                          ? 'Tarefas e atividades'
                          : source === 'focus'
                          ? 'Sessões de foco'
                          : source === 'checkins'
                          ? 'Check-ins e humor'
                          : source === 'streaks'
                          ? 'Sequências e conquistas'
                          : source}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>O que você verá</Text>
                <View style={styles.previewFeatures}>
                  <View style={styles.previewFeature}>
                    <Text style={styles.previewFeatureIcon}>📊</Text>
                    <Text style={styles.previewFeatureText}>Gráficos interativos</Text>
                  </View>
                  <View style={styles.previewFeature}>
                    <Text style={styles.previewFeatureIcon}>💡</Text>
                    <Text style={styles.previewFeatureText}>Insights personalizados</Text>
                  </View>
                  <View style={styles.previewFeature}>
                    <Text style={styles.previewFeatureIcon}>📥</Text>
                    <Text style={styles.previewFeatureText}>Exportar como PDF</Text>
                  </View>
                  <View style={styles.previewFeature}>
                    <Text style={styles.previewFeatureIcon}>📤</Text>
                    <Text style={styles.previewFeatureText}>Compartilhar</Text>
                  </View>
                </View>
              </View>

              {selectedReport.isPremium && (
                <View style={styles.premiumNotice}>
                  <Text style={styles.premiumNoticeEmoji}>⭐</Text>
                  <View style={styles.premiumNoticeContent}>
                    <Text style={styles.premiumNoticeTitle}>Relatório Premium</Text>
                    <Text style={styles.premiumNoticeText}>
                      Disponível no Plano Avançado
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.generateButton,
                  selectedReport.isPremium && styles.generateButtonPremium,
                ]}
                onPress={handleGenerateReport}
              >
                <Text style={styles.generateButtonText}>
                  {selectedReport.isPremium ? 'Fazer Upgrade' : 'Gerar Relatório'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  categoryScroll: {
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  categoryContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral.background,
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary.main,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral.textSecondary,
  },
  categoryLabelActive: {
    color: COLORS.primary.contrast,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.md,
  },
  proBadge: {
    backgroundColor: COLORS.secondary.main + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary.main,
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  reportCard: {
    width: '48%',
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reportEmoji: {
    fontSize: 32,
  },
  premiumBadge: {
    backgroundColor: COLORS.secondary.main,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.xs,
  },
  reportDescription: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  reportMeta: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
    paddingTop: SPACING.xs,
  },
  reportMetaText: {
    fontSize: 11,
    color: COLORS.neutral.textMuted,
  },
  emptyRecent: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.neutral.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
    backgroundColor: COLORS.neutral.white,
  },
  modalCloseButton: {
    padding: SPACING.sm,
  },
  modalCloseText: {
    fontSize: 20,
    color: COLORS.neutral.textSecondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  modalReportHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalReportEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  modalReportName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.xs,
  },
  modalReportDescription: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
    textAlign: 'center',
  },
  modalSection: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.md,
  },
  dataSourcesList: {
    gap: SPACING.sm,
  },
  dataSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataSourceIcon: {
    fontSize: 16,
    color: COLORS.accent.success,
    marginRight: SPACING.sm,
  },
  dataSourceText: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
  },
  previewFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  previewFeature: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  previewFeatureIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  previewFeatureText: {
    fontSize: 13,
    color: COLORS.neutral.textSecondary,
  },
  premiumNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary.light + '20',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  premiumNoticeEmoji: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  premiumNoticeContent: {
    flex: 1,
  },
  premiumNoticeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary.dark,
  },
  premiumNoticeText: {
    fontSize: 13,
    color: COLORS.neutral.textSecondary,
  },
  generateButton: {
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  generateButtonPremium: {
    backgroundColor: COLORS.secondary.main,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
});
