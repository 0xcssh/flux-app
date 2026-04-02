import { useEffect } from 'react';
import { router } from 'expo-router';
import { useSettingsStore } from '@/store/settingsStore';
import { LoadingScreen } from '@/components/shared/LoadingScreen';

export default function RootIndex() {
  const onboardingSeen = useSettingsStore((s) => s.onboardingSeen);

  useEffect(() => {
    if (!onboardingSeen) {
      router.replace('/(onboarding)/welcome');
    } else {
      // Go straight to the app — no account needed
      router.replace('/(tabs)');
    }
  }, [onboardingSeen]);

  return <LoadingScreen />;
}
