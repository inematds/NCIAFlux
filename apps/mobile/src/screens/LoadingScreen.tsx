import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS } from '@nciaflux/shared';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>NeuroFluxo</Text>
      <ActivityIndicator size="large" color={COLORS.primary.main} style={styles.loader} />
      <Text style={styles.tagline}>Seu fluxo, seu ritmo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.background,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary.main,
    marginBottom: 24,
  },
  loader: {
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
  },
});
