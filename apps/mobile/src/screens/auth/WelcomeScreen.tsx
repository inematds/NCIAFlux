import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SPACING, BORDER_RADIUS } from '@nciaflux/shared';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type WelcomeNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.logo}>NeuroFluxo</Text>
          <Text style={styles.tagline}>Seu fluxo, seu ritmo</Text>
          <Text style={styles.description}>
            Descubra como seu cérebro funciona e crie estratégias personalizadas para o seu dia a dia.
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Discovery', { skipAuth: true })}
          >
            <Text style={styles.primaryButtonText}>Descobrir meu perfil</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>ou</Text>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>Já tenho conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkButtonText}>Criar conta</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Gratuito. Sem cartão. Sem julgamentos.
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
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
    paddingVertical: SPACING['2xl'],
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.primary.main,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.secondary.main,
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
  },
  actions: {
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.primary.contrast,
    fontSize: 18,
    fontWeight: '600',
  },
  orText: {
    color: COLORS.neutral.textMuted,
    marginVertical: SPACING.md,
  },
  secondaryButton: {
    backgroundColor: COLORS.neutral.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.neutral.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  linkButton: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  linkButtonText: {
    color: COLORS.primary.main,
    fontSize: 16,
  },
  footer: {
    textAlign: 'center',
    color: COLORS.neutral.textMuted,
    fontSize: 14,
    marginTop: SPACING.xl,
  },
});
