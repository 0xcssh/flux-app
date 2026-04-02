import { useCallback, useEffect } from 'react';
import { useLogStore } from '@/store/logStore';
import type { LogFormData } from '@/types/log';

export function useDailyLog(userId?: string) {
  const store = useLogStore();

  const todayLog = store.getTodayLog();
  const isLogged = !!todayLog;

  const submitLog = useCallback(
    (data: LogFormData) => {
      if (isLogged) {
        const today = new Date().toISOString().split('T')[0];
        store.updateLog(today, data, userId);
      } else {
        store.submitLog(data, userId);
      }
    },
    [userId, isLogged, store]
  );

  // Auto-sync pending logs
  useEffect(() => {
    if (store.pendingSync.length > 0) {
      store.syncPendingLogs();
    }
  }, [store.pendingSync.length]);

  return {
    todayLog,
    isLogged,
    submitLog,
    logs: store.logs,
    isLoading: store.isLoading,
    loadHistory: store.loadHistory,
    getLast: store.getLast,
    getLogsByDateRange: store.getLogsByDateRange,
  };
}
