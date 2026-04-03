import React, { useState, useRef, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '@/hooks/useSubscription';
import { track, AnalyticsEvents } from '@/lib/analytics';
import DownsellModal from '@/components/paywall/DownsellModal';

type BillingCycle = 'monthly' | 'annual';

const FEATURES = [
  {
    icon: 'calendar' as const,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    title: 'Plan Your Day',
    description: 'Personalized daily action plan based on your unique rhythm',
  },
  {
    icon: 'analytics' as const,
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    title: 'Track Your Progress',
    description: 'Weekly reports, deep insights, and pattern detection',
  },
  {
    icon: 'trophy' as const,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    title: 'Build Better Habits',
    description: 'Guided challenges and smart reminders that adapt to you',
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { offerings, purchase, restore, isLoading, tier, isTrialActive } =
    useSubscription();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [purchasing, setPurchasing] = useState(false);
  const [downsellVisible, setDownsellVisible] = useState(false);
  const downsellShownRef = useRef(false);

  useEffect(() => {
    track(AnalyticsEvents.PAYWALL_VIEWED);
  }, []);

  const handlePurchase = async () => {
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
          plan: 'premium',
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
    if (!downsellShownRef.current) {
      downsellShownRef.current = true;
      setDownsellVisible(true);
      return;
    }
    track(AnalyticsEvents.PAYWALL_DISMISSED);
    router.back();
  };

  const handleDownsellClaim = () => {
    setDownsellVisible(false);
    // User wants the discount — trigger purchase flow
    handlePurchase();
  };

  const handleDownsellDismiss = () => {
    setDownsellVisible(false);
    track(AnalyticsEvents.PAYWALL_DISMISSED);
    router.back();
  };

  const showTrial = !isTrialActive && tier === 'free';

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={20} color="#8B8BA3" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>Optimize Every Day</Text>
        <Text style={styles.subtitle}>
          Join 2,000+ men who take control of their energy, mood, and
          performance
        </Text>

        {/* Feature Blocks */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, idx) => (
            <View
              key={idx}
              style={[
                styles.featureCard,
                { borderLeftColor: feature.borderColor },
              ]}
            >
              <View
                style={[styles.featureIcon, { backgroundColor: feature.bgColor }]}
              >
                <Ionicons name={feature.icon} size={22} color={feature.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

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
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>SAVE 50%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingContainer}>
          {/* Monthly */}
          <TouchableOpacity
            style={[
              styles.priceCard,
              billingCycle === 'monthly' && styles.priceCardActive,
            ]}
            onPress={() => setBillingCycle('monthly')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.priceLabel,
                billingCycle === 'monthly' && styles.priceLabelActive,
              ]}
            >
              Monthly
            </Text>
            <Text
              style={[
                styles.priceAmount,
                billingCycle === 'monthly' && styles.priceAmountActive,
              ]}
            >
              14.99{'\u20ac'}/month
            </Text>
          </TouchableOpacity>

          {/* Annual */}
          <TouchableOpacity
            style={[
              styles.priceCard,
              billingCycle === 'annual' && styles.priceCardActive,
            ]}
            onPress={() => setBillingCycle('annual')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.priceLabel,
                billingCycle === 'annual' && styles.priceLabelActive,
              ]}
            >
              Annual
            </Text>
            <Text
              style={[
                styles.priceAmount,
                billingCycle === 'annual' && styles.priceAmountActive,
              ]}
            >
              89.99{'\u20ac'}/year
            </Text>
            <Text style={styles.priceSubtext}>7.49{'\u20ac'}/month</Text>
          </TouchableOpacity>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handlePurchase}
          disabled={purchasing || tier === 'premium'}
          activeOpacity={0.8}
        >
          {purchasing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.ctaText}>
              {showTrial ? 'Start 7-Day Free Trial' : 'Subscribe Now'}
            </Text>
          )}
        </TouchableOpacity>
        <Text style={styles.ctaSubtext}>
          {showTrial
            ? 'Then 14.99\u20ac/month \u00b7 Cancel anytime'
            : billingCycle === 'monthly'
              ? '14.99\u20ac/month \u00b7 Cancel anytime'
              : '89.99\u20ac/year \u00b7 Cancel anytime'}
        </Text>

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

      {/* Downsell Modal */}
      <DownsellModal
        visible={downsellVisible}
        billingCycle={billingCycle}
        onClaim={handleDownsellClaim}
        onDismiss={handleDownsellDismiss}
      />
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
    fontSize: 14,
    color: '#8B8BA3',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 28,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: '#2A2A45',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 13,
    color: '#8B8BA3',
    lineHeight: 18,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#16162A',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
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
  pricingContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  priceCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2A2A45',
  },
  priceCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A5A7A',
    marginBottom: 6,
  },
  priceLabelActive: {
    color: '#3B82F6',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8B8BA3',
  },
  priceAmountActive: {
    color: '#FFFFFF',
  },
  priceSubtext: {
    fontSize: 12,
    color: '#5A5A7A',
    marginTop: 4,
  },
  ctaButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ctaSubtext: {
    fontSize: 12,
    color: '#5A5A7A',
    textAlign: 'center',
    marginBottom: 24,
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
