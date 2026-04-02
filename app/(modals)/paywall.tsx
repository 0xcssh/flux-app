import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSubscription } from '@/hooks/useSubscription';
import { track, AnalyticsEvents } from '@/lib/analytics';

type BillingCycle = 'monthly' | 'annual';

interface FeatureRow {
  label: string;
  free: string;
  premium: string;
  pro: string;
}

const FEATURES: FeatureRow[] = [
  { label: 'History', free: '7 days', premium: 'Unlimited', pro: 'Unlimited' },
  { label: 'Cycle Detection', free: '--', premium: 'check', pro: 'check' },
  { label: 'AI Insights', free: '--', premium: 'check', pro: 'check' },
  { label: 'PDF Reports', free: '--', premium: 'check', pro: 'Medical' },
  { label: 'NoFap Advanced', free: '--', premium: 'check', pro: 'check' },
  { label: 'TRT Tracking', free: '--', premium: '--', pro: 'check' },
  { label: 'AI Coaching', free: '--', premium: '--', pro: 'check' },
];

const PRICES = {
  premium: { monthly: '9.99', annual: '59.99' },
  pro: { monthly: '19.99', annual: '119.99' },
};

export default function PaywallScreen() {
  const router = useRouter();
  const { offerings, purchase, restore, isLoading, tier, isTrialActive } =
    useSubscription();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [purchasing, setPurchasing] = useState(false);

  React.useEffect(() => {
    track(AnalyticsEvents.PAYWALL_VIEWED);
  }, []);

  const handlePurchase = async (planTier: 'premium' | 'pro') => {
    setPurchasing(true);
    try {
      const offering = offerings?.current;
      if (!offering) {
        Alert.alert('Error', 'No offerings available. Please try again later.');
        return;
      }

      const identifier =
        billingCycle === 'monthly' ? '$rc_monthly' : '$rc_annual';
      const pkg = offering.availablePackages.find(
        (p) => p.identifier === identifier,
      );

      if (!pkg) {
        Alert.alert('Error', 'Package not available. Please try again.');
        return;
      }

      const success = await purchase(pkg);
      if (success) {
        track(AnalyticsEvents.SUBSCRIPTION_PURCHASED, {
          plan: planTier,
          cycle: billingCycle,
        });
        router.back();
      }
    } catch (error) {
      console.error('[Paywall] Purchase error:', error);
      Alert.alert('Error', 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      Alert.alert('Success', 'Purchases restored successfully.');
    } catch {
      Alert.alert('Error', 'Could not restore purchases.');
    }
  };

  const handleClose = () => {
    track(AnalyticsEvents.PAYWALL_DISMISSED);
    router.back();
  };

  const renderFeatureCell = (value: string) => {
    if (value === 'check') {
      return (
        <View style={styles.checkCell}>
          <FontAwesome name="check" size={14} color="#22C55E" />
        </View>
      );
    }
    if (value === '--') {
      return (
        <View style={styles.checkCell}>
          <FontAwesome name="minus" size={12} color="#5A5A7A" />
        </View>
      );
    }
    return (
      <View style={styles.checkCell}>
        <Text style={styles.featureCellText}>{value}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <FontAwesome name="times" size={20} color="#8B8BA3" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Unlock the full potential of your hormonal tracking
        </Text>

        {/* Billing Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              billingCycle === 'monthly' && styles.toggleActive,
            ]}
            onPress={() => setBillingCycle('monthly')}
          >
            <Text
              style={[
                styles.toggleText,
                billingCycle === 'monthly' && styles.toggleTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              billingCycle === 'annual' && styles.toggleActive,
            ]}
            onPress={() => setBillingCycle('annual')}
          >
            <Text
              style={[
                styles.toggleText,
                billingCycle === 'annual' && styles.toggleTextActive,
              ]}
            >
              Annual
            </Text>
            {billingCycle === 'annual' && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>Save 50%</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Feature Comparison Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <View style={styles.featureColumn}>
              <Text style={styles.headerText}>Feature</Text>
            </View>
            <View style={styles.planColumn}>
              <Text style={styles.headerText}>Free</Text>
            </View>
            <View style={[styles.planColumn, styles.premiumColumn]}>
              <Text style={[styles.headerText, styles.premiumText]}>Premium</Text>
            </View>
            <View style={[styles.planColumn, styles.proColumn]}>
              <Text style={[styles.headerText, styles.proText]}>Pro</Text>
            </View>
          </View>

          {/* Rows */}
          {FEATURES.map((feature, idx) => (
            <View
              key={idx}
              style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt]}
            >
              <View style={styles.featureColumn}>
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
              <View style={styles.planColumn}>
                {renderFeatureCell(feature.free)}
              </View>
              <View style={[styles.planColumn, styles.premiumColumn]}>
                {renderFeatureCell(feature.premium)}
              </View>
              <View style={[styles.planColumn, styles.proColumn]}>
                {renderFeatureCell(feature.pro)}
              </View>
            </View>
          ))}
        </View>

        {/* Purchase Buttons */}
        <View style={styles.purchaseSection}>
          {/* Premium */}
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => handlePurchase('premium')}
            disabled={purchasing || tier === 'premium'}
            activeOpacity={0.8}
          >
            {purchasing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <View>
                  <Text style={styles.purchaseButtonTitle}>Premium</Text>
                  <Text style={styles.purchaseButtonPrice}>
                    {billingCycle === 'monthly'
                      ? `${PRICES.premium.monthly}\u20AC/mo`
                      : `${PRICES.premium.annual}\u20AC/yr`}
                  </Text>
                </View>
                <FontAwesome name="arrow-right" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Pro */}
          <TouchableOpacity
            style={styles.proButton}
            onPress={() => handlePurchase('pro')}
            disabled={purchasing || tier === 'pro'}
            activeOpacity={0.8}
          >
            {purchasing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <View>
                  <Text style={styles.purchaseButtonTitle}>Pro</Text>
                  <Text style={styles.purchaseButtonPrice}>
                    {billingCycle === 'monthly'
                      ? `${PRICES.pro.monthly}\u20AC/mo`
                      : `${PRICES.pro.annual}\u20AC/yr`}
                  </Text>
                </View>
                <FontAwesome name="arrow-right" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Trial CTA */}
          {!isTrialActive && tier === 'free' && (
            <View style={styles.trialNote}>
              <FontAwesome name="gift" size={14} color="#2563EB" />
              <Text style={styles.trialNoteText}>
                Start with a 7-day free trial of Premium
              </Text>
            </View>
          )}
        </View>

        {/* Restore */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isLoading}
        >
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Legal */}
        <View style={styles.legalSection}>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://flux-app.com/terms')}
          >
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>|</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://flux-app.com/privacy')}
          >
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#252540',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8B8BA3',
    textAlign: 'center',
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#16162A',
    borderRadius: 12,
    padding: 3,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    gap: 6,
  },
  toggleActive: {
    backgroundColor: '#1A1A2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A7A',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  saveBadge: {
    backgroundColor: '#064E3B',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22C55E',
  },
  table: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#16162A',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A45',
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A45',
  },
  tableRowAlt: {
    backgroundColor: '#16162A',
  },
  featureColumn: {
    flex: 2,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  planColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumColumn: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  proColumn: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B8BA3',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  premiumText: {
    color: '#3B82F6',
  },
  proText: {
    color: '#22C55E',
  },
  featureLabel: {
    fontSize: 13,
    color: '#8B8BA3',
    fontWeight: '500',
  },
  checkCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCellText: {
    fontSize: 11,
    color: '#8B8BA3',
    fontWeight: '600',
    textAlign: 'center',
  },
  purchaseSection: {
    gap: 12,
    marginBottom: 20,
  },
  premiumButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  proButton: {
    flexDirection: 'row',
    backgroundColor: '#22C55E',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  purchaseButtonTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  purchaseButtonPrice: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  trialNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  trialNoteText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  restoreText: {
    fontSize: 14,
    color: '#8B8BA3',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  legalSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    color: '#5A5A7A',
  },
  legalSeparator: {
    fontSize: 12,
    color: '#5A5A7A',
  },
});
