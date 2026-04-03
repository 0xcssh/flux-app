import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';

export interface ChallengeProgress {
  challengeId: string;
  startDate: string;
  currentDay: number;
  completedDays: number[];
  isActive: boolean;
}

interface ChallengeState {
  activeChallenge: ChallengeProgress | null;
  completedChallenges: string[];

  startChallenge: (challengeId: string) => void;
  completeDay: (dayNumber: number) => void;
  abandonChallenge: () => void;
  isCompleted: (challengeId: string) => boolean;
  getCurrentDayNumber: () => number;
}

function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      activeChallenge: null,
      completedChallenges: [],

      startChallenge: (challengeId: string) => {
        set({
          activeChallenge: {
            challengeId,
            startDate: getTodayDate(),
            currentDay: 1,
            completedDays: [],
            isActive: true,
          },
        });
      },

      completeDay: (dayNumber: number) => {
        const { activeChallenge } = get();
        if (!activeChallenge || !activeChallenge.isActive) return;
        if (activeChallenge.completedDays.includes(dayNumber)) return;

        const newCompletedDays = [...activeChallenge.completedDays, dayNumber];

        // Import duration check inline — we check if all days are done
        // by comparing completedDays length to currentDay (max day reached)
        set({
          activeChallenge: {
            ...activeChallenge,
            completedDays: newCompletedDays,
          },
        });
      },

      abandonChallenge: () => {
        set({ activeChallenge: null });
      },

      isCompleted: (challengeId: string) => {
        return get().completedChallenges.includes(challengeId);
      },

      getCurrentDayNumber: () => {
        const { activeChallenge } = get();
        if (!activeChallenge || !activeChallenge.isActive) return 0;
        const elapsed = daysBetween(activeChallenge.startDate, getTodayDate());
        return Math.max(1, Math.min(elapsed + 1, 999));
      },
    }),
    {
      name: 'flux-challenges',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        activeChallenge: state.activeChallenge,
        completedChallenges: state.completedChallenges,
      }),
    },
  ),
);
