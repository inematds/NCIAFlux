import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, SPACING } from '@nciaflux/shared';

export function FocusBlockScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bloco de Foco</Text>
        <Text style={styles.subtitle}>
          Timer e técnicas de foco.
        </Text>
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
  subtitle: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  placeholder: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    fontStyle: 'italic',
  },
});
