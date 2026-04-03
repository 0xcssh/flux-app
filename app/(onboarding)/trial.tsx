import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PaginationDots from '@/components/onboarding/PaginationDots';
import { useSettingsStore } from '@/store/settingsStore';
import { track, AnalyticsEvents } from '@/lib/analytics';
import DownsellModal from '@/components/paywall/DownsellModal';

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; color: string; title: string; description: string }[] = [
  {
    icon: 'calendar',
    color: '#3B82F6',
    title: 'Daily Action Plan',
    description: 'Personalized schedule aligned to your hormonal peaks',
  },
  {
    icon: 'analytics',
    color: '#22C55E',
    title: 'Deep Insights',
    description: 'Correlations, patterns, and weekly reports',
  },
  {
    icon: 'trophy',
    color: '#F59E0B',
    title: 'Guided Challenges',
    description: '7, 14, and 30-day programs to boost performance',
  },
];

export default function TrialScreen() {
  const router = useRouter();
  const setOnboardingSeen = useSettingsStore((s) => s.setOnboardingSeen);
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');

  // Stagger animations: 3 feature cards + plan cards + CTA
  const featureAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;
  const planAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const featureTimings = featureAnims.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      })
    );

    Animated.sequence([
      Animated.stagger(150, featureTimings),
      Animated.timing(planAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(ctaAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [featureAnims, planAnim, ctaAnim]);

  const finishOnboarding = () => {
    setOnboardingSeen(true);
    track(AnalyticsEvents.ONBOARDING_COMPLETED);
    router.replace('/(tabs)');
  };

  const handleStartTrial = () => {
    track(AnalyticsEvents.TRIAL_STARTED, { source: 'onboarding', plan: billingCycle });
    finishOnboarding();
  };

  const [showDownsell, setShowDownsell] = useState(false);
  const [downsellShown, setDownsellShown] = useState(false);

  const handleSkip = () => {
    if (!downsellShown) {
      setDownsellShown(true);
      setShowDownsell(true);
      return;
    }
    track(AnalyticsEvents.TRIAL_SKIPPED, { source: 'onboarding' });
    finishOnboarding();
  };

  const handleDownsellClaim = () => {
    setShowDownsell(false);
    track(AnalyticsEvents.TRIAL_STARTED, { source: 'downsell', plan: billingCycle });
    finishOnboarding();
  };

  const handleDownsellDismiss = () => {
    setShowDownsell(false);
    track(AnalyticsEvents.TRIAL_SKIPPED, { source: 'downsell' });
    finishOnboarding();
  };

  const priceLabel = billingCycle === 'annual'
    ? 'Then 89.99\u20AC/year \u00B7 Cancel anytime'
    : 'Then 14.99\u20AC/month \u00B7 Cancel anytime';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Optimize Every Day</Text>
          <Text style={styles.subtitle}>Get the most out of your hormonal rhythm</Text>
        </View>

        <View style={styles.featureList}>
          {FEATURES.map((feature, index) => (
            <Animated.View
              key={feature.title}
              style={[
                styles.featureCard,
                {
                  opacity: featureAnims[index],
                  transform: [{
                    translateY: featureAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                },
              ]}
            >
              <View style={[styles.featureIconCircle, { backgroundColor: feature.color + '1A' }]}>
                <Ionicons name={feature.icon} size={18} color={feature.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <Animated.View
          style={[
            styles.planSection,
            {
              opacity: planAnim,
              transform: [{
                translateY: planAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            },
          ]}
        >
          <View style={styles.planRow}>
            <TouchableOpacity
              style={[
                styles.planCard,
                billingCycle === 'annual' && styles.planCardSelected,
              ]}
              onPress={() => setBillingCycle('annual')}
              activeOpacity={0.7}
            >
              <View style={styles.planBadgeRow}>
                <Text style={styles.planName}>Annual</Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>SAVE 50%</Text>
                </View>
              </View>
              <Text style={styles.planPrice}>89.99{'\u20AC'}/year</Text>
              <Text style={styles.planEquivalent}>(7.49{'\u20AC'}/month)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planCard,
                billingCycle === 'monthly' && styles.planCardSelected,
              ]}
              onPress={() => setBillingCycle('monthly')}
              activeOpacity={0.7}
            >
              <View style={styles.planBadgeRow}>
                <Text style={styles.planName}>Monthly</Text>
              </View>
              <Text style={styles.planPrice}>14.99{'\u20AC'}/month</Text>
              <Text style={styles.planEquivalent}> </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.ctaSection, { opacity: ctaAnim, transform: [{ translateY: ctaAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleStartTrial}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
          </TouchableOpacity>
          <Text style={styles.priceText}>{priceLabel}</Text>
          <View style={styles.socialProof}>
            <Ionicons name="people" size={14} color="#8B8BA3" />
            <Text style={styles.socialProofText}>Trusted by 2,000+ men</Text>
          </View>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.6}>
            <Text style={styles.skipText}>Continue with Free Plan</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <PaginationDots total={5} current={4} />
      </View>
      <DownsellModal
        visible={showDownsell}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B8BA3',
    textAlign: 'center',
    marginTop: 8,
  },
  featureList: {
    gap: 10,
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  featureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featureDescription: {
    fontSize: 12,
    color: '#8B8BA3',
    marginTop: 2,
  },
  planSection: {
    marginBottom: 20,
  },
  planRow: {
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#2A2A45',
    alignItems: 'center',
  },
  planCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#1A1A2E' + 'F0',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  planBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  planName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveBadge: {
    backgroundColor: '#22C55E',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  planEquivalent: {
    fontSize: 12,
    color: '#8B8BA3',
    marginTop: 2,
  },
  ctaSection: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  priceText: {
    fontSize: 13,
    color: '#8B8BA3',
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  socialProofText: {
    fontSize: 12,
    color: '#8B8BA3',
  },
  skipText: {
    fontSize: 14,
    color: '#5A5A7A',
    fontWeight: '600',
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
});
