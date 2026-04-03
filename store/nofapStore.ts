import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { NoFapStreak, NoFapMilestone } from '@/types/nofap';
import { MILESTONE_DAYS } from '@/types/nofap';
import { getTodayDate, formatLocalDate } from '@/lib/dateUtils';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

interface CurrentStreak {
  startDate: string;
  days: number;
}

interface NoFapState {
  currentStreak: CurrentStreak | null;
  history: NoFapStreak[];
  longestStreak: number;
  isLoading: boolean;

  startStreak: () => void;
  endStreak: () => void;
  recordDay: (abstained: boolean) => void;
  getMilestones: () => NoFapMilestone[];
  getStreakDays: () => number;
  syncStreaks: (userId: string) => Promise<void>;
  loadStreaks: (userId: string) => Promise<void>;
}

export const useNoFapStore = create<NoFapState>()(
  persist(
    (set, get) => ({
      currentStreak: null,
      history: [],
      longestStreak: 0,
      isLoading: false,

      startStreak: () => {
        const today = getTodayDate();
        set({
          currentStreak: { startDate: today, days: 1 },
        });
      },

      endStreak: () => {
        const state = get();
        if (!state.currentStreak) return;

        const today = getTodayDate();
        const streakDays = daysBetween(state.currentStreak.startDate, today);

        const streak: NoFapStreak = {
          id: generateUUID(),
          user_id: '',
          start_date: state.currentStreak.startDate,
          end_date: today,
          streak_days: Math.max(streakDays, state.currentStreak.days),
          is_active: false,
        };

        set((s) => ({
          currentStreak: null,
          history: [streak, ...s.history],
          longestStreak: Math.max(s.longestStreak, streak.streak_days),
        }));
      },

      recordDay: (abstained: boolean) => {
        const state = get();
        if (abstained) {
          if (!state.currentStreak) {
            get().startStreak();
          } else {
            const today = getTodayDate();
            const days = daysBetween(state.currentStreak.startDate, today) + 1;
            set((s) => ({
              currentStreak: {
                startDate: state.currentStreak!.startDate,
                days: Math.max(days, 1),
              },
              longestStreak: Math.max(s.longestStreak, days),
            }));
          }
        } else {
          if (state.currentStreak) {
            get().endStreak();
          }
        }
      },

      getMilestones: () => {
        const state = get();
        const streakDays = state.currentStreak
          ? daysBetween(state.currentStreak.startDate, getTodayDate()) + 1
          : 0;

        return MILESTONE_DAYS.map((days) => {
          const achieved = streakDays >= days;
          let achievedDate: string | null = null;
          if (achieved && state.currentStreak) {
            const d = new Date(state.currentStreak.startDate + 'T00:00:00');
            d.setDate(d.getDate() + days - 1);
            achievedDate = formatLocalDate(d);
          }
          return {
            days,
            title_key: `milestones.${days}d.name`,
            achieved,
            achieved_date: achievedDate,
          };
        });
      },

      getStreakDays: () => {
        const state = get();
        if (!state.currentStreak) return 0;
        return daysBetween(state.currentStreak.startDate, getTodayDate()) + 1;
      },

      syncStreaks: async (userId: string) => {
        const state = get();
        const streaksToSync = state.history
          .filter((s) => !s.user_id || s.user_id === '' || s.user_id === userId)
          .map((s) => ({
            id: s.id,
            user_id: userId,
            start_date: s.start_date,
            end_date: s.end_date,
            streak_days: s.streak_days,
            is_active: s.is_active,
          }));

        // Also sync current streak if active
        if (state.currentStreak) {
          streaksToSync.push({
            id: generateUUID(),
            user_id: userId,
            start_date: state.currentStreak.startDate,
            end_date: null,
            streak_days: state.currentStreak.days,
            is_active: true,
          });
        }

        if (streaksToSync.length === 0) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('nofap_streaks')
          .upsert(streaksToSync, { onConflict: 'id' });
      },

      loadStreaks: async (userId: string) => {
        set({ isLoading: true });
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from('nofap_streaks')
            .select('*')
            .eq('user_id', userId)
            .order('start_date', { ascending: false }) as { data: any[] | null; error: any };

          if (!error && data) {
            const activeStreak = data.find((s) => s.is_active);
            const completedStreaks = data.filter((s) => !s.is_active) as NoFapStreak[];
            const maxDays = data.reduce(
              (max, s) => Math.max(max, s.streak_days ?? 0),
              0
            );

            set({
              history: completedStreaks,
              longestStreak: maxDays,
              currentStreak: activeStreak
                ? {
                    startDate: activeStreak.start_date,
                    days:
                      daysBetween(activeStreak.start_date, getTodayDate()) + 1,
                  }
                : get().currentStreak,
            });
          }
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'flux-nofap',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        currentStreak: state.currentStreak,
        history: state.history,
        longestStreak: state.longestStreak,
      }),
    }
  )
);
