import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { DailyLogEntry, LogFormData } from '@/types/log';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function computeVitalityScore(data: LogFormData): number {
  const raw =
    data.energy * 0.2 +
    data.mood * 0.2 +
    data.libido * 0.15 +
    data.sleep_quality * 0.2 +
    (10 - data.stress) * 0.15 +
    data.training * 0.1;
  // raw ranges from 1*1.0=1.0 to 10*1.0=10.0
  // Normalize to 0-100: ((raw - 1) / 9) * 100
  return Math.round(((raw - 1) / 9) * 100);
}

interface LogState {
  logs: Record<string, DailyLogEntry>;
  pendingSync: string[];
  todayLogged: boolean;
  isLoading: boolean;

  submitLog: (formData: LogFormData, userId?: string) => void;
  updateLog: (logDate: string, formData: LogFormData, userId?: string) => void;
  syncPendingLogs: () => Promise<void>;
  loadHistory: (userId: string, days: number) => Promise<void>;
  getTodayLog: () => DailyLogEntry | null;
  getLogsByDateRange: (startDate: string, endDate: string) => DailyLogEntry[];
  getLast: (n: number) => DailyLogEntry[];
}

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => ({
      logs: {},
      pendingSync: [],
      todayLogged: false,
      isLoading: false,

      submitLog: (formData: LogFormData, userId?: string) => {
        const today = getTodayDate();
        const now = new Date().toISOString();
        const vitalityScore = computeVitalityScore(formData);

        const entry: DailyLogEntry = {
          id: generateUUID(),
          user_id: userId || 'local',
          log_date: today,
          energy: formData.energy,
          mood: formData.mood,
          libido: formData.libido,
          sleep_quality: formData.sleep_quality,
          stress: formData.stress,
          training: formData.training,
          notes: formData.notes || undefined,
          nofap_checked: formData.nofap_checked,
          vitality_score: vitalityScore,
          log_time: now,
          synced: false,
          created_at: now,
          updated_at: now,
        };

        set((state) => ({
          logs: { ...state.logs, [today]: entry },
          pendingSync: [...state.pendingSync, today],
          todayLogged: true,
        }));
      },

      updateLog: (logDate: string, formData: LogFormData, userId?: string) => {
        const state = get();
        const existing = state.logs[logDate];
        if (!existing) return;

        const now = new Date().toISOString();
        const vitalityScore = computeVitalityScore(formData);

        const updated: DailyLogEntry = {
          ...existing,
          energy: formData.energy,
          mood: formData.mood,
          libido: formData.libido,
          sleep_quality: formData.sleep_quality,
          stress: formData.stress,
          training: formData.training,
          notes: formData.notes || undefined,
          nofap_checked: formData.nofap_checked,
          vitality_score: vitalityScore,
          synced: false,
          updated_at: now,
        };

        set((state) => ({
          logs: { ...state.logs, [logDate]: updated },
          pendingSync: state.pendingSync.includes(logDate)
            ? state.pendingSync
            : [...state.pendingSync, logDate],
        }));
      },

      syncPendingLogs: async () => {
        const state = get();
        if (state.pendingSync.length === 0) return;

        const logsToSync = state.pendingSync
          .map((date) => state.logs[date])
          .filter(Boolean)
          .map((log) => ({
            id: log.id,
            user_id: log.user_id,
            log_date: log.log_date,
            energy: log.energy,
            mood: log.mood,
            libido: log.libido,
            sleep_quality: log.sleep_quality,
            stress: log.stress,
            training: log.training,
            notes: log.notes ?? null,
            nofap_checked: log.nofap_checked,
            vitality_score: log.vitality_score,
            log_time: log.log_time,
            created_at: log.created_at,
            updated_at: log.updated_at,
          }));

        if (logsToSync.length === 0) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('daily_logs')
          .upsert(logsToSync, { onConflict: 'user_id,log_date' });

        if (!error) {
          const syncedDates = logsToSync.map((l) => l.log_date);
          set((state) => {
            const updatedLogs = { ...state.logs };
            for (const date of syncedDates) {
              if (updatedLogs[date]) {
                updatedLogs[date] = { ...updatedLogs[date], synced: true };
              }
            }
            return {
              logs: updatedLogs,
              pendingSync: state.pendingSync.filter(
                (d) => !syncedDates.includes(d)
              ),
            };
          });
        }
      },

      loadHistory: async (userId: string, days: number) => {
        set({ isLoading: true });
        try {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);
          const startStr = startDate.toISOString().split('T')[0];

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from('daily_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('log_date', startStr)
            .order('log_date', { ascending: false }) as { data: any[] | null; error: any };

          if (!error && data) {
            set((state) => {
              const merged = { ...state.logs };
              for (const row of data) {
                const existing = merged[row.log_date];
                // Remote wins if local is already synced or doesn't exist
                if (!existing || existing.synced) {
                  merged[row.log_date] = { ...row, synced: true } as DailyLogEntry;
                }
              }
              const today = getTodayDate();
              return {
                logs: merged,
                todayLogged: !!merged[today],
              };
            });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      getTodayLog: () => {
        const today = getTodayDate();
        return get().logs[today] ?? null;
      },

      getLogsByDateRange: (startDate: string, endDate: string) => {
        const logs = get().logs;
        return Object.values(logs)
          .filter((l) => l.log_date >= startDate && l.log_date <= endDate)
          .sort((a, b) => a.log_date.localeCompare(b.log_date));
      },

      getLast: (n: number) => {
        const logs = get().logs;
        return Object.values(logs)
          .sort((a, b) => b.log_date.localeCompare(a.log_date))
          .slice(0, n);
      },
    }),
    {
      name: 'flux-logs',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        logs: state.logs,
        pendingSync: state.pendingSync,
      }),
    }
  )
);
