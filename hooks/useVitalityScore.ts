import { useMemo } from 'react';
import { DailyLogEntry } from '@/types/log';

interface VitalityResult {
  score: number;
  label: string; // i18n key
  color: string; // hex color for UI
}

/**
 * Derives a display-ready vitality score from today's log entry.
 * Returns a neutral state when no entry is available.
 */
export function useVitalityScore(entry: DailyLogEntry | null): VitalityResult {
  return useMemo(() => {
    if (!entry) {
      return { score: 0, label: 'vitality.no_data', color: '#9CA3AF' }; // gray
    }

    const score = entry.vitality_score;

    if (score >= 80) {
      return { score, label: 'vitality.excellent', color: '#10B981' }; // green
    }
    if (score >= 60) {
      return { score, label: 'vitality.good', color: '#3B82F6' }; // blue
    }
    if (score >= 40) {
      return { score, label: 'vitality.moderate', color: '#F59E0B' }; // amber
    }
    if (score >= 20) {
      return { score, label: 'vitality.low', color: '#F97316' }; // orange
    }
    return { score, label: 'vitality.very_low', color: '#EF4444' }; // red
  }, [entry]);
}
