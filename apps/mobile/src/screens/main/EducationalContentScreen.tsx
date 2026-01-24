import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
} from '@nciaflux/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ContentCategory = 'all' | 'adhd' | 'focus' | 'emotions' | 'productivity' | 'self_care';

interface EducationalPill {
  id: string;
  title: string;
  summary: string;
  content: string[];
  category: ContentCategory;
  emoji: string;
  readTime: number; // minutes
  isNew: boolean;
  isRead: boolean;
}

const EDUCATIONAL_PILLS: EducationalPill[] = [
  {
    id: '1',
    title: 'TDAH não é preguiça',
    summary: 'Entenda a diferença entre falta de motivação e dificuldade neurológica',
    content: [
      'O TDAH afeta o sistema de dopamina do cérebro, o neurotransmissor responsável pela motivação e recompensa.',
      'Quando você tem TDAH, seu cérebro tem dificuldade em produzir ou utilizar dopamina de forma eficiente.',
      'Isso significa que tarefas que parecem "fáceis" para outras pessoas podem exigir muito mais esforço mental de você.',
      'Não é sobre querer ou não querer fazer - é sobre como seu cérebro processa a motivação.',
      'Dica: Divida tarefas grandes em pequenas etapas e celebre cada conquista, por menor que seja.',
    ],
    category: 'adhd',
    emoji: '🧠',
    readTime: 2,
    isNew: true,
    isRead: false,
  },
  {
    id: '2',
    title: 'A técnica do "só 5 minutos"',
    summary: 'Como vencer a paralisia inicial usando micro-compromissos',
    content: [
      'A paralisia inicial é um dos maiores desafios do TDAH. Começar parece impossível.',
      'A técnica dos 5 minutos funciona assim: comprometa-se a fazer algo por apenas 5 minutos.',
      'O truque é que, uma vez que você começa, geralmente é mais fácil continuar.',
      'Se após 5 minutos você quiser parar, tudo bem! Você já fez mais do que antes.',
      'Essa técnica reduz a resistência mental porque 5 minutos parece "fácil" e não ameaçador.',
      'Dica: Use um timer. Quando tocar, avalie: "Quero continuar mais 5 minutos?"',
    ],
    category: 'productivity',
    emoji: '⏱️',
    readTime: 2,
    isNew: true,
    isRead: false,
  },
  {
    id: '3',
    title: 'Regulação emocional e TDAH',
    summary: 'Por que suas emoções podem parecer mais intensas',
    content: [
      'Pessoas com TDAH frequentemente experimentam emoções mais intensas que os outros.',
      'Isso acontece porque o TDAH afeta o córtex pré-frontal, responsável pela regulação emocional.',
      'Você pode passar de feliz para frustrado rapidamente, ou sentir rejeição de forma muito intensa.',
      'Isso é chamado de Disforia Sensível à Rejeição (RSD) - e é muito comum no TDAH.',
      'Reconhecer que suas emoções intensas têm uma base neurológica pode ajudar a não se culpar.',
      'Dica: Quando sentir uma emoção intensa, pause e respire. Pergunte: "O que estou sentindo agora?"',
    ],
    category: 'emotions',
    emoji: '💭',
    readTime: 3,
    isNew: false,
    isRead: false,
  },
  {
    id: '4',
    title: 'Body Doubling: trabalhe acompanhado',
    summary: 'Como a presença de outras pessoas pode aumentar seu foco',
    content: [
      'Body doubling é ter alguém por perto enquanto você trabalha - mesmo que não estejam fazendo a mesma coisa.',
      'Para pessoas com TDAH, a presença de outra pessoa pode criar uma "âncora" de atenção.',
      'Não precisa ser presencial: chamadas de vídeo, streamings de trabalho ou cafés funcionam também.',
      'A ideia é que a responsabilidade implícita de ter alguém "junto" ajuda a manter o foco.',
      'Dica: Experimente o modo "trabalhe comigo" do YouTube ou apps de body doubling virtual.',
    ],
    category: 'focus',
    emoji: '👥',
    readTime: 2,
    isNew: false,
    isRead: true,
  },
  {
    id: '5',
    title: 'O poder do ambiente',
    summary: 'Como organizar seu espaço para apoiar seu foco',
    content: [
      'Seu ambiente físico tem um impacto enorme na sua capacidade de foco.',
      'Pessoas com TDAH são especialmente sensíveis a distrações visuais e auditivas.',
      'Mantenha seu espaço de trabalho o mais limpo possível - menos estímulos, menos distrações.',
      'Use fones com cancelamento de ruído ou música ambiente sem letra.',
      'Tenha tudo que precisa ao alcance antes de começar uma tarefa.',
      'Dica: Crie um "kit de foco" com tudo que você precisa: água, lanches, carregador, etc.',
    ],
    category: 'productivity',
    emoji: '🏠',
    readTime: 2,
    isNew: false,
    isRead: true,
  },
  {
    id: '6',
    title: 'Autocuidado não é luxo',
    summary: 'Por que descanso é essencial para cérebros TDAH',
    content: [
      'Cérebros com TDAH trabalham mais para fazer as mesmas tarefas que outras pessoas.',
      'Isso significa que você se cansa mais rápido - e precisa de mais pausas.',
      'Ignorar o cansaço leva ao esgotamento, que piora todos os sintomas do TDAH.',
      'Pausas regulares não são preguiça - são manutenção necessária do seu cérebro.',
      'Sono, alimentação e exercício têm impacto direto nos sintomas do TDAH.',
      'Dica: Programe pausas no seu dia como se fossem compromissos importantes.',
    ],
    category: 'self_care',
    emoji: '🌿',
    readTime: 2,
    isNew: false,
    isRead: false,
  },
  {
    id: '7',
    title: 'Hiperfoco: superpoder ou armadilha?',
    summary: 'Entendendo o estado de foco intenso do TDAH',
    content: [
      'Hiperfoco é quando você fica tão absorvido em algo que perde a noção do tempo.',
      'Pode ser um superpoder quando direcionado para algo produtivo ou criativo.',
      'Mas também pode ser uma armadilha quando você esquece de comer, dormir ou fazer outras coisas.',
      'O hiperfoco geralmente acontece com atividades que seu cérebro acha interessantes ou novidades.',
      'Tarefas "chatas" raramente ativam o hiperfoco - e isso não é culpa sua.',
      'Dica: Use alarmes para sair do hiperfoco quando necessário. Defina limites de tempo.',
    ],
    category: 'adhd',
    emoji: '🔥',
    readTime: 2,
    isNew: false,
    isRead: false,
  },
  {
    id: '8',
    title: 'Gentle parenting para si mesmo',
    summary: 'Como tratar a si mesmo com mais compaixão',
    content: [
      'Pessoas com TDAH frequentemente têm um crítico interno muito severo.',
      'Anos de frustração e mal-entendidos podem criar uma voz autocrítica constante.',
      'Tente falar consigo mesmo como falaria com um amigo querido que está tendo dificuldades.',
      'Quando errar, em vez de "Eu sou tão estúpido", tente "Isso foi difícil, e está tudo bem".',
      'Autocompaixão não é desculpa - é reconhecer que você está fazendo seu melhor com o cérebro que tem.',
      'Dica: Quando o crítico interno aparecer, pergunte: "Eu diria isso para um amigo?"',
    ],
    category: 'emotions',
    emoji: '💝',
    readTime: 3,
    isNew: false,
    isRead: false,
  },
];

const CATEGORIES: { value: ContentCategory; label: string; emoji: string }[] = [
  { value: 'all', label: 'Todos', emoji: '📚' },
  { value: 'adhd', label: 'TDAH', emoji: '🧠' },
  { value: 'focus', label: 'Foco', emoji: '🎯' },
  { value: 'emotions', label: 'Emoções', emoji: '💭' },
  { value: 'productivity', label: 'Produtividade', emoji: '⚡' },
  { value: 'self_care', label: 'Autocuidado', emoji: '🌿' },
];

export function EducationalContentScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory>('all');
  const [expandedPillId, setExpandedPillId] = useState<string | null>(null);
  const [readPills, setReadPills] = useState<Set<string>>(
    new Set(EDUCATIONAL_PILLS.filter((p) => p.isRead).map((p) => p.id))
  );

  const filteredPills = EDUCATIONAL_PILLS.filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );

  function handlePillPress(pillId: string) {
    if (expandedPillId === pillId) {
      setExpandedPillId(null);
    } else {
      setExpandedPillId(pillId);
      // Mark as read
      setReadPills((prev) => new Set([...prev, pillId]));
    }
  }

  function renderPill(pill: EducationalPill) {
    const isExpanded = expandedPillId === pill.id;
    const isRead = readPills.has(pill.id);

    return (
      <TouchableOpacity
        key={pill.id}
        style={[styles.pillCard, isExpanded && styles.pillCardExpanded]}
        onPress={() => handlePillPress(pill.id)}
        activeOpacity={0.8}
      >
        <View style={styles.pillHeader}>
          <View style={styles.pillIconContainer}>
            <Text style={styles.pillEmoji}>{pill.emoji}</Text>
            {pill.isNew && !isRead && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NOVO</Text>
              </View>
            )}
          </View>
          <View style={styles.pillHeaderContent}>
            <Text style={styles.pillTitle}>{pill.title}</Text>
            <Text style={styles.pillSummary} numberOfLines={isExpanded ? undefined : 2}>
              {pill.summary}
            </Text>
            <View style={styles.pillMeta}>
              <Text style={styles.pillReadTime}>📖 {pill.readTime} min</Text>
              {isRead && <Text style={styles.pillReadStatus}>✓ Lido</Text>}
            </View>
          </View>
          <Text style={styles.pillArrow}>{isExpanded ? '▼' : '▶'}</Text>
        </View>

        {isExpanded && (
          <View style={styles.pillContent}>
            {pill.content.map((paragraph, index) => (
              <Text key={index} style={styles.pillParagraph}>
                {paragraph}
              </Text>
            ))}
            <View style={styles.pillActions}>
              <TouchableOpacity style={styles.pillAction}>
                <Text style={styles.pillActionEmoji}>🔖</Text>
                <Text style={styles.pillActionText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pillAction}>
                <Text style={styles.pillActionEmoji}>📤</Text>
                <Text style={styles.pillActionText}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  const unreadCount = EDUCATIONAL_PILLS.filter((p) => !readPills.has(p.id)).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Pílulas Educativas</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} novas</Text>
            </View>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Category Filter */}
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
              styles.categoryChip,
              selectedCategory === category.value && styles.categoryChipActive,
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
        {/* Daily Pill */}
        <View style={styles.dailySection}>
          <Text style={styles.dailyLabel}>💡 Pílula do Dia</Text>
          {renderPill(EDUCATIONAL_PILLS[0])}
        </View>

        {/* All Pills */}
        <View style={styles.allSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'Todas as Pílulas' : CATEGORIES.find((c) => c.value === selectedCategory)?.label}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {filteredPills.length} pílula{filteredPills.length !== 1 ? 's' : ''} disponíve{filteredPills.length !== 1 ? 'is' : 'l'}
          </Text>
          {filteredPills.slice(1).map(renderPill)}
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressCard}>
            <Text style={styles.progressEmoji}>📊</Text>
            <View style={styles.progressContent}>
              <Text style={styles.progressTitle}>Seu Progresso</Text>
              <Text style={styles.progressText}>
                Você leu {readPills.size} de {EDUCATIONAL_PILLS.length} pílulas
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(readPills.size / EDUCATIONAL_PILLS.length) * 100}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  unreadBadge: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary.main,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary.contrast,
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
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral.background,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary.main,
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  categoryLabel: {
    fontSize: 13,
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
  dailySection: {
    marginBottom: SPACING.xl,
  },
  dailyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginBottom: SPACING.sm,
  },
  allSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.neutral.textMuted,
    marginBottom: SPACING.md,
  },
  pillCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pillCardExpanded: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary.main,
  },
  pillHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pillIconContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  pillEmoji: {
    fontSize: 32,
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.accent.error,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.sm,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
  pillHeaderContent: {
    flex: 1,
  },
  pillTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.xs,
  },
  pillSummary: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  pillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  pillReadTime: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
  },
  pillReadStatus: {
    fontSize: 12,
    color: COLORS.accent.success,
  },
  pillArrow: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
    marginLeft: SPACING.sm,
    marginTop: SPACING.xs,
  },
  pillContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
  },
  pillParagraph: {
    fontSize: 15,
    color: COLORS.neutral.textPrimary,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  pillActions: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
  },
  pillAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillActionEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  pillActionText: {
    fontSize: 14,
    color: COLORS.primary.main,
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: SPACING.lg,
  },
  progressCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary.light + '20',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  progressEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  progressContent: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.xs,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary.main,
    borderRadius: 4,
  },
});
