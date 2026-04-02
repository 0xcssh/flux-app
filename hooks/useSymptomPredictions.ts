import { useMemo } from 'react';
import { useCircadianPhase } from '@/hooks/useCircadianPhase';
import { useLogStore } from '@/store/logStore';
import { getPredictedSymptoms, type SymptomPrediction } from '@/lib/symptomPredictions';
import type { DailyLogEntry } from '@/types/log';

interface UseSymptomPredictionsResult {
  prediction: SymptomPrediction;
  hasPersonalData: boolean;
}

export function useSymptomPredictions(): UseSymptomPredictionsResult {
  const { phase } = useCircadianPhase();
  const logsMap = useLogStore((s) => s.logs);

  return useMemo(() => {
    const allLogs: DailyLogEntry[] = Object.values(logsMap);
    // Sort by date descending and take last 30
    const recentLogs = allLogs
      .sort((a, b) => b.log_date.localeCompare(a.log_date))
      .slice(0, 30);

    const prediction = getPredictedSymptoms(phase, recentLogs);
    const hasPersonalData = !!prediction.personalNote;

    return { prediction, hasPersonalData };
  }, [phase, logsMap]);
}
