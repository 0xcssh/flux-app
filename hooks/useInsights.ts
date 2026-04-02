import { useMemo } from 'react';
import type { DailyLogEntry } from '@/types/log';
import type { NoFapStreak } from '@/types/nofap';
import type { InsightTier, TieredInsightData } from '@/types/insight';
import {
  getUniversalInsights,
  computeEarlyPatterns,
  generateWeeklyInsights,
  generateInsights,
} from '@/lib/correlations';

const TIER_THRESHOLDS: Record<string, number> = { early: 3, weekly: 7, deep: 14 };

export function useInsights(
  logs: DailyLogEntry[],
  streaks: NoFapStreak[],
): TieredInsightData {
  const daysLogged = logs.length;

  const tier: InsightTier =
    daysLogged >= 14
      ? 'deep'
      : daysLogged >= 7
        ? 'weekly'
        : daysLogged >= 3
          ? 'early'
          : 'universal';

  // Sorted logs for consistent computation
  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date)),
    [logs],
  );

  // Always available
  const universalInsights = useMemo(() => getUniversalInsights(), []);

  // 3+ days
  const earlyPatterns = useMemo(
    () => (daysLogged >= 3 ? computeEarlyPatterns(sortedLogs) : undefined),
    [sortedLogs, daysLogged],
  );

  // 7+ days
  const weeklyInsights = useMemo(
    () => (daysLogged >= 7 ? generateWeeklyInsights(sortedLogs, streaks) : undefined),
    [sortedLogs, streaks, daysLogged],
  );

  // 14+ days
  const deepInsights = useMemo(
    () => (daysLogged >= 14 ? generateInsights(sortedLogs, streaks) : undefined),
    [sortedLogs, streaks, daysLogged],
  );

  // Next tier info
  const nextTier: InsightTier | null =
    tier === 'deep'
      ? null
      : tier === 'weekly'
        ? 'deep'
        : tier === 'early'
          ? 'weekly'
          : 'early';

  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] ?? 3 : 0;
  const daysUntilNextTier = Math.max(0, nextThreshold - daysLogged);

  return {
    tier,
    universalInsights,
    earlyPatterns,
    weeklyInsights,
    deepInsights,
    daysLogged,
    daysUntilNextTier,
    nextTier,
  };
}
