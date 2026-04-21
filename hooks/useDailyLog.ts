import { useCallback, useEffect } from 'react';
import { useLogStore } from '@/store/logStore';
import { getTodayDate } from '@/lib/dateUtils';
import type { LogFormData } from '@/types/log';

export function useDailyLog(userId?: string, targetDate?: string) {
  const store = useLogStore();

  const date = targetDate ?? getTodayDate();
  const targetLog = store.logs[date] ?? null;
  const isLogged = !!targetLog;

  const submitLog = useCallback(
    (data: LogFormData) => {
      if (isLogged) {
        store.updateLog(date, data, userId);
      } else {
        store.submitLog(data, userId, date);
      }
    },
    [userId, isLogged, store, date]
  );

  useEffect(() => {
    if (store.pendingSync.length > 0) {
      store.syncPendingLogs();
    }
  }, [store.pendingSync.length]);

  return {
    todayLog: targetLog,
    isLogged,
    submitLog,
    logs: store.logs,
    isLoading: store.isLoading,
    loadHistory: store.loadHistory,
    getLast: store.getLast,
    getLogsByDateRange: store.getLogsByDateRange,
  };
}
