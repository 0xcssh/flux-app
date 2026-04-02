import { useMemo } from 'react';
import { useNoFapStore } from '@/store/nofapStore';

export function useNoFapStreak() {
  const store = useNoFapStore();

  const streakDays = store.getStreakDays();
  const milestones = useMemo(() => store.getMilestones(), [store.currentStreak]);

  return {
    currentStreak: store.currentStreak,
    streakDays,
    milestones,
    longestStreak: store.longestStreak,
    history: store.history,
    isLoading: store.isLoading,
    recordDay: store.recordDay,
    startStreak: store.startStreak,
    endStreak: store.endStreak,
    syncStreaks: store.syncStreaks,
    loadStreaks: store.loadStreaks,
  };
}
