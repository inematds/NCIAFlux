import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, SPACING } from '@nciaflux/shared';

export function DiscoveryResultScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Seu Perfil</Text>
        <Text style={styles.subtitle}>
          Resultado da análise do seu perfil cognitivo.
        </Text>
        <Text style={styles.placeholder}>
          [Implementação em Story 1.5]
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
