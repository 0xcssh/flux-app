import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const {
    session,
    user,
    profile,
    isLoading,
    error,
    setSession,
    signIn,
    signUp,
    signOut,
    fetchProfile,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        fetchProfile();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        fetchProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    profile,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
  };
}
