import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import PaginationDots from '@/components/onboarding/PaginationDots';
import TrialOfferCard from '@/components/onboarding/TrialOfferCard';
import { useSettingsStore } from '@/store/settingsStore';
import { track, AnalyticsEvents } from '@/lib/analytics';

export default function TrialScreen() {
  const router = useRouter();
  const { t } = useTranslation('onboarding');
  const setOnboardingSeen = useSettingsStore((s) => s.setOnboardingSeen);
  const [isLoading, setIsLoading] = useState(false);

  const finishOnboarding = () => {
    setOnboardingSeen(true);
    track(AnalyticsEvents.ONBOARDING_COMPLETED);
    // Go straight to the app — no account needed yet
    router.replace('/(tabs)');
  };

  const handleStartTrial = () => {
    // We'll handle the actual trial purchase after signup
    track(AnalyticsEvents.TRIAL_STARTED, { source: 'onboarding' });
    finishOnboarding();
  };

  const handleSkip = () => {
    track(AnalyticsEvents.TRIAL_SKIPPED, { source: 'onboarding' });
    finishOnboarding();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
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
    backgroundColor: '#0A0A0F',
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
    color: '#8B8BA3',
    marginTop: 16,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
});
