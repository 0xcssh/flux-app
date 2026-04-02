import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useSubscription } from '@/hooks/useSubscription';

const TIER_BADGES = {
  free: { color: '#94A3B8', bg: '#F1F5F9', icon: 'user' },
  premium: { color: '#2563EB', bg: '#EFF6FF', icon: 'star' },
  pro: { color: '#0D9488', bg: '#F0FDFA', icon: 'diamond' },
} as const;

const PREMIUM_FEATURES = [
  'Unlimited history',
  'Infradian cycle detection',
  'AI-powered correlations',
  'PDF report exports',
  'Personalized recommendations',
  'Advanced NoFap analytics',
];

export default function SubscriptionCard() {
  const { t } = useTranslation('profile');
  const { tier, isTrialActive, trialExpiresAt } = useSubscription();
  const router = useRouter();

  const badge = TIER_BADGES[tier];

  const trialDaysLeft = trialExpiresAt
    ? Math.max(0, Math.ceil((trialExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.tierBadge, { backgroundColor: badge.bg }]}>
          <FontAwesome name={badge.icon as any} size={14} color={badge.color} />
          <Text style={[styles.tierText, { color: badge.color }]}>
            {t(`plans.${tier}`)}
          </Text>
        </View>
        <Text style={styles.currentPlan}>{t('current_plan')}</Text>
      </View>

      {isTrialActive && (
        <View style={styles.trialBanner}>
          <FontAwesome name="clock-o" size={14} color="#F59E0B" />
          <Text style={styles.trialText}>
            {t('trial_active', { days: trialDaysLeft })}
          </Text>
        </View>
      )}

      {tier === 'free' && (
        <>
          <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
          <View style={styles.featureList}>
            {PREMIUM_FEATURES.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <FontAwesome name="check" size={12} color="#10B981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/(modals)/paywall')}
            activeOpacity={0.8}
          >
            <FontAwesome name="star" size={16} color="#FFFFFF" />
            <Text style={styles.upgradeButtonText}>{t('upgrade_cta')}</Text>
          </TouchableOpacity>
        </>
      )}

      {tier !== 'free' && (
        <View style={styles.managePlan}>
          <Text style={styles.planDescription}>{t(`plan_descriptions.${tier}`)}</Text>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => router.push('/(modals)/paywall')}
            activeOpacity={0.7}
          >
            <Text style={styles.manageButtonText}>Manage Plan</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  tierText: {
    fontSize: 14,
    fontWeight: '700',
  },
  currentPlan: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  trialText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  featureList: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#64748B',
  },
  upgradeButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  managePlan: {
    marginTop: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  manageButton: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
});
