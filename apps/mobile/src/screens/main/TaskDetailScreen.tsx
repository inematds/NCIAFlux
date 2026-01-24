import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, SPACING } from '@nciaflux/shared';

export function TaskDetailScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Detalhes da Tarefa</Text>
        <Text style={styles.placeholder}>
          [Implementação em Story 2.2]
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary.main,
    marginBottom: SPACING.sm,
  },
  placeholder: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    fontStyle: 'italic',
  },
});
