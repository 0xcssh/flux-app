import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/shared/LoadingScreen';

export default function RootIndex() {
  const { session, profile, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      router.replace('/(auth)/login');
    } else if (profile && !profile.onboarding_completed) {
      router.replace('/(onboarding)/welcome');
    } else if (session) {
      router.replace('/(tabs)');
    }
  }, [session, profile, isLoading]);

  return <LoadingScreen />;
}
