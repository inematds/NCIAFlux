import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';

import { COLORS, SPACING, BORDER_RADIUS, DiscoveryQuestion, DiscoveryAnswer } from '@nciaflux/shared';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type DiscoveryNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Discovery'>;

// Discovery questions from the database seed
const QUESTIONS: DiscoveryQuestion[] = [
  {
    id: '1',
    order: 1,
    category: 'energy',
    question_text: 'Como você geralmente se sente pela manhã?',
    question_type: 'single_choice',
    options: [
      { value: 'low', label: 'Difícil acordar, pouca energia', emoji: '😴' },
      { value: 'medium', label: 'Normal, demoro a engrenar', emoji: '😐' },
      { value: 'high', label: 'Acordo bem disposto', emoji: '⚡' },
    ],
    required: true,
  },
  {
    id: '2',
    order: 2,
    category: 'energy',
    question_text: 'Em que período do dia você se sente mais produtivo?',
    question_type: 'single_choice',
    options: [
      { value: 'morning', label: 'Manhã' },
      { value: 'afternoon', label: 'Tarde' },
      { value: 'evening', label: 'Noite' },
      { value: 'varies', label: 'Varia muito' },
    ],
    required: true,
  },
  {
    id: '3',
    order: 3,
    category: 'focus',
    question_text: 'Por quanto tempo você consegue manter o foco em uma tarefa?',
    question_type: 'slider',
    min_value: 5,
    max_value: 60,
    required: true,
  },
  {
    id: '4',
    order: 4,
    category: 'distraction',
    question_text: 'O que mais te distrai durante o dia?',
    question_type: 'multiple_choice',
    options: [
      { value: 'notifications', label: 'Notificações' },
      { value: 'noise', label: 'Barulho' },
      { value: 'thoughts', label: 'Pensamentos' },
      { value: 'social_media', label: 'Redes sociais' },
      { value: 'hunger', label: 'Fome' },
      { value: 'fatigue', label: 'Cansaço' },
    ],
    required: true,
  },
  {
    id: '5',
    order: 5,
    category: 'execution',
    question_text: 'Como você prefere organizar suas tarefas?',
    question_type: 'single_choice',
    options: [
      { value: 'sequential', label: 'Uma de cada vez, em ordem' },
      { value: 'parallel', label: 'Várias ao mesmo tempo' },
      { value: 'burst', label: 'Tudo de uma vez quando dá' },
    ],
    required: true,
  },
  {
    id: '6',
    order: 6,
    category: 'coping',
    question_text: 'O que já te ajudou a manter o foco?',
    question_type: 'multiple_choice',
    options: [
      { value: 'lists', label: 'Listas' },
      { value: 'timers', label: 'Timers' },
      { value: 'music', label: 'Música' },
      { value: 'movement', label: 'Movimento' },
      { value: 'caffeine', label: 'Café' },
      { value: 'body_doubling', label: 'Trabalhar com alguém' },
      { value: 'rewards', label: 'Recompensas' },
      { value: 'deadlines', label: 'Prazos' },
    ],
    required: true,
  },
  {
    id: '7',
    order: 7,
    category: 'accountability',
    question_text: 'Você funciona melhor com alguém te cobrando?',
    question_type: 'single_choice',
    options: [
      { value: 'yes', label: 'Sim, preciso de cobrança externa' },
      { value: 'no', label: 'Não, prefiro autonomia' },
      { value: 'sometimes', label: 'Depende da situação' },
    ],
    required: true,
  },
  {
    id: '8',
    order: 8,
    category: 'pressure',
    question_text: 'Como você reage sob pressão/prazos apertados?',
    question_type: 'single_choice',
    options: [
      { value: 'thrives', label: 'Me motiva e rendo mais' },
      { value: 'freezes', label: 'Travo e fico ansioso' },
      { value: 'mixed', label: 'Às vezes ajuda, às vezes atrapalha' },
    ],
    required: true,
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function DiscoveryScreen() {
  const navigation = useNavigation<DiscoveryNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, DiscoveryAnswer>>({});
  const [sliderValue, setSliderValue] = useState(25);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const isLastQuestion = currentIndex === QUESTIONS.length - 1;

  const currentAnswer = answers[currentQuestion.id];
  const canProceed =
    currentAnswer !== undefined ||
    (currentQuestion.question_type === 'slider' && sliderValue > 0);

  function handleSelect(value: string) {
    if (currentQuestion.question_type === 'single_choice') {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { question_id: currentQuestion.id, value },
      }));
    } else if (currentQuestion.question_type === 'multiple_choice') {
      const current = (currentAnswer?.value as string[]) || [];
      const newValue = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { question_id: currentQuestion.id, value: newValue },
      }));
    }
  }

  function animateSlide(direction: 'next' | 'prev') {
    const toValue = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;

    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function handleNext() {
    // Save slider value if needed
    if (currentQuestion.question_type === 'slider') {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { question_id: currentQuestion.id, value: sliderValue },
      }));
    }

    if (isLastQuestion) {
      // Generate session ID for non-logged users
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      navigation.navigate('DiscoveryResult', { sessionId });
    } else {
      animateSlide('next');
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      animateSlide('prev');
      setCurrentIndex((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  }

  function isSelected(value: string): boolean {
    if (!currentAnswer) return false;

    if (Array.isArray(currentAnswer.value)) {
      return currentAnswer.value.includes(value);
    }

    return currentAnswer.value === value;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} de {QUESTIONS.length}
        </Text>
      </View>

      {/* Question Content */}
      <Animated.View
        style={[styles.content, { transform: [{ translateX: slideAnim }] }]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.category}>{getCategoryLabel(currentQuestion.category)}</Text>
          <Text style={styles.question}>{currentQuestion.question_text}</Text>

          {currentQuestion.question_type === 'slider' && (
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={currentQuestion.min_value || 5}
                maximumValue={currentQuestion.max_value || 60}
                step={5}
                value={sliderValue}
                onValueChange={setSliderValue}
                minimumTrackTintColor={COLORS.primary.main}
                maximumTrackTintColor={COLORS.neutral.border}
                thumbTintColor={COLORS.primary.main}
              />
              <Text style={styles.sliderValue}>{sliderValue} minutos</Text>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>5 min</Text>
                <Text style={styles.sliderLabel}>60 min</Text>
              </View>
            </View>
          )}

          {(currentQuestion.question_type === 'single_choice' ||
            currentQuestion.question_type === 'multiple_choice') && (
            <View style={styles.optionsContainer}>
              {currentQuestion.question_type === 'multiple_choice' && (
                <Text style={styles.multiSelectHint}>Selecione todas que se aplicam</Text>
              )}
              {currentQuestion.options?.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.option, isSelected(option.value) && styles.optionSelected]}
                  onPress={() => handleSelect(option.value)}
                >
                  {option.emoji && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
                  <Text
                    style={[
                      styles.optionText,
                      isSelected(option.value) && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected(option.value) && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.backButton} onPress={handlePrev}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={styles.nextButtonText}>
            {isLastQuestion ? 'Ver resultado' : 'Próxima'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    energy: 'Energia',
    focus: 'Foco',
    distraction: 'Distrações',
    execution: 'Execução',
    coping: 'Estratégias',
    accountability: 'Responsabilidade',
    pressure: 'Pressão',
  };
  return labels[category] || category;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary.main,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  category: {
    fontSize: 14,
    color: COLORS.secondary.main,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  question: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
    lineHeight: 32,
    marginBottom: SPACING.xl,
  },
  sliderContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary.main,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  sliderLabel: {
    fontSize: 12,
    color: COLORS.neutral.textMuted,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  multiSelectHint: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
  },
  option: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
  },
  optionSelected: {
    borderColor: COLORS.primary.main,
    backgroundColor: COLORS.primary.main + '10',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.neutral.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: COLORS.primary.main,
    fontWeight: '700',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
    backgroundColor: COLORS.neutral.white,
  },
  backButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
  },
  nextButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.contrast,
  },
});
