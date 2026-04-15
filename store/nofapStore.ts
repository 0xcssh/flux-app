import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { NoFapStreak, NoFapMilestone } from '@/types/nofap';
import { MILESTONE_DAYS } from '@/types/nofap';
import { getTodayDate, formatLocalDate, daysBetween } from '@/lib/dateUtils';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface CurrentStreak {
  id: string;
  startDate: string;
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
          currentStreak: { id: generateUUID(), startDate: today },
        });
      },

      endStreak: () => {
        const state = get();
        if (!state.currentStreak) return;

        const today = getTodayDate();
        const streakDays = daysBetween(state.currentStreak.startDate, today) + 1;

        const streak: NoFapStreak = {
          id: state.currentStreak.id,
          user_id: '',
          start_date: state.currentStreak.startDate,
          end_date: today,
          streak_days: Math.max(streakDays, 1),
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
        if (!supabase) return;
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

        if (state.currentStreak) {
          const activeDays =
            daysBetween(state.currentStreak.startDate, getTodayDate()) + 1;
          streaksToSync.push({
            id: state.currentStreak.id,
            user_id: userId,
            start_date: state.currentStreak.startDate,
            end_date: null,
            streak_days: activeDays,
            is_active: true,
          });
        }

        if (streaksToSync.length === 0) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('nofap_streaks')
          .upsert(streaksToSync, { onConflict: 'id' });

        if (error) {
          console.error('[syncStreaks] Supabase upsert error:', error);
          return;
        }

        set((s) => ({
          history: s.history.map((h) =>
            streaksToSync.some((ts) => ts.id === h.id && !ts.is_active)
              ? { ...h, user_id: userId }
              : h
          ),
        }));
      },

      loadStreaks: async (userId: string) => {
        if (!supabase) return;
        set({ isLoading: true });
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from('nofap_streaks')
            .select('*')
            .eq('user_id', userId)
            .order('start_date', { ascending: false });

          if (!error && Array.isArray(data)) {
            const activeStreak = data.find((s: any) => s.is_active);
            const completedStreaks = data.filter((s: any) => !s.is_active) as NoFapStreak[];
            const maxDays = data.reduce(
              (max: number, s: any) => Math.max(max, s.streak_days ?? 0),
              0
            );

            set({
              history: completedStreaks,
              longestStreak: maxDays,
              currentStreak: activeStreak
                ? {
                    id: activeStreak.id,
                    startDate: activeStreak.start_date,
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
