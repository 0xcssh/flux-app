import { useState, useEffect, useRef, useMemo } from 'react';
import type { DailyLogEntry } from '@/types/log';
import type { NoFapStreak } from '@/types/nofap';
import type { InsightData } from '@/types/insight';
import { generateInsights } from '@/lib/correlations';

const MIN_DAYS_FOR_INSIGHTS = 14;

interface UseInsightsReturn {
  insights: InsightData;
  isLoading: boolean;
  hasEnoughData: boolean;
  daysUntilInsights: number;
}

const EMPTY_INSIGHTS: InsightData = {
  correlations: [],
  patterns: [],
  recommendations: [],
};

export function useInsights(
  logs: DailyLogEntry[],
  streaks: NoFapStreak[],
): UseInsightsReturn {
  const [insights, setInsights] = useState<InsightData>(EMPTY_INSIGHTS);
  const [isLoading, setIsLoading] = useState(false);
  const lastLogCountRef = useRef<number>(0);

  const hasEnoughData = logs.length >= MIN_DAYS_FOR_INSIGHTS;
  const daysUntilInsights = Math.max(0, MIN_DAYS_FOR_INSIGHTS - logs.length);

  // Sorted logs for consistent computation
  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date)),
    [logs],
  );

  useEffect(() => {
    // Only recompute when new logs are added
    if (sortedLogs.length === lastLogCountRef.current) return;
    if (!hasEnoughData) {
      lastLogCountRef.current = sortedLogs.length;
      return;
    }

    setIsLoading(true);
    lastLogCountRef.current = sortedLogs.length;

    // Compute insights asynchronously to avoid blocking the UI thread
    const timeoutId = setTimeout(() => {
      try {
        const result = generateInsights(sortedLogs, streaks);
        setInsights(result);
      } catch (error) {
        console.error('[useInsights] Error generating insights:', error);
      } finally {
        setIsLoading(false);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [sortedLogs, streaks, hasEnoughData]);

  return {
    insights,
    isLoading,
    hasEnoughData,
    daysUntilInsights,
  };
}
