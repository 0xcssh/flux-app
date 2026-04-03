import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PaginationDots from '@/components/onboarding/PaginationDots';
import { useSettingsStore } from '@/store/settingsStore';
import { track, AnalyticsEvents } from '@/lib/analytics';

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

  // Stagger animations: 3 feature cards + CTA
  const featureAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;
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
      Animated.timing(ctaAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [featureAnims, ctaAnim]);

  const finishOnboarding = () => {
    setOnboardingSeen(true);
    track(AnalyticsEvents.ONBOARDING_COMPLETED);
    router.replace('/(tabs)');
  };

  const handleStartTrial = () => {
    track(AnalyticsEvents.TRIAL_STARTED, { source: 'onboarding' });
    finishOnboarding();
  };

  const handleSkip = () => {
    track(AnalyticsEvents.TRIAL_SKIPPED, { source: 'onboarding' });
    finishOnboarding();
  };

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

        <Animated.View style={[styles.ctaSection, { opacity: ctaAnim, transform: [{ translateY: ctaAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleStartTrial}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
          </TouchableOpacity>
          <Text style={styles.priceText}>Then 14.99/month -- Cancel anytime</Text>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.6}>
            <Text style={styles.skipText}>Continue with Free Plan</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <PaginationDots total={5} current={4} />
      </View>
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
    paddingTop: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
    marginBottom: 32,
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
  ctaSection: {
    alignItems: 'center',
    gap: 12,
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
  skipText: {
    fontSize: 14,
    color: '#5A5A7A',
    fontWeight: '600',
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
});
