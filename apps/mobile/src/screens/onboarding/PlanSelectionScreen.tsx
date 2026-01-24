import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, PLANS } from '@nciaflux/shared';

export function PlanSelectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Escolha seu plano</Text>
          <Text style={styles.subtitle}>
            Comece gratuitamente ou desbloqueie mais recursos.
          </Text>
        </View>

        {Object.values(PLANS).map((plan) => (
          <TouchableOpacity key={plan.id} style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>
                {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}/mês`}
              </Text>
            </View>
            <View style={styles.planFeatures}>
              {plan.features.map((feature, index) => (
                <Text key={index} style={styles.planFeature}>
                  • {feature}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.footer}>
          Você pode mudar de plano a qualquer momento.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
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
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.neutral.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.neutral.textSecondary,
  },
  planCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary.main,
  },
  planFeatures: {
    gap: SPACING.xs,
  },
  planFeature: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    lineHeight: 22,
  },
  footer: {
    fontSize: 14,
    color: COLORS.neutral.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
