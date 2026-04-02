import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import PaginationDots from '@/components/onboarding/PaginationDots';
import TrialOfferCard from '@/components/onboarding/TrialOfferCard';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuthStore } from '@/store/authStore';
import { track, AnalyticsEvents } from '@/lib/analytics';

export default function TrialScreen() {
  const router = useRouter();
  const { t } = useTranslation('onboarding');
  const { offerings, purchase } = useSubscription();
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [isLoading, setIsLoading] = useState(false);

  const completeOnboarding = async () => {
    try {
      await updateProfile({ onboarding_completed: true });
    } catch {
      // Continue anyway
    }
    track(AnalyticsEvents.ONBOARDING_COMPLETED);
    router.replace('/(tabs)');
  };

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      // Get the premium monthly package (with trial)
      const premiumOffering = offerings?.current;
      const trialPackage =
        premiumOffering?.availablePackages?.find(
          (pkg) => pkg.identifier === '$rc_monthly',
        ) ?? premiumOffering?.availablePackages?.[0];

      if (!trialPackage) {
        // No packages available (dev environment), skip
        track(AnalyticsEvents.TRIAL_STARTED, { source: 'onboarding' });
        await completeOnboarding();
        return;
      }

      const success = await purchase(trialPackage);
      if (success) {
        track(AnalyticsEvents.TRIAL_STARTED, { source: 'onboarding' });
      }
      await completeOnboarding();
    } catch (error) {
      console.error('[Trial] Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    track(AnalyticsEvents.TRIAL_SKIPPED, { source: 'onboarding' });
    await completeOnboarding();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Setting up your experience...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TrialOfferCard onStartTrial={handleStartTrial} onSkip={handleSkip} />
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
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 16,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
});
