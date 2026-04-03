import type { DailyLogEntry, PhaseType } from '@/types/log';
import { getCurrentPhase } from '@/lib/hormoneEngine';

export interface PredictionResult {
  symptomId: string;
  predicted: boolean;
  actual: number;
  matched: boolean;
  metricKey: string;
}

export interface SymptomAccuracyResult {
  overallScore: number;
  totalPredictions: number;
  correctPredictions: number;
  results: PredictionResult[];
}

interface SymptomMetricMapping {
  symptomId: string;
  metricKey: keyof DailyLogEntry;
  direction: 'high' | 'low';
  threshold: number;
  phase: PhaseType;
}

const SYMPTOM_MAPPINGS: SymptomMetricMapping[] = [
  // Rise phase
  { symptomId: 'rising_energy', metricKey: 'energy', direction: 'high', threshold: 6, phase: 'rise' },
  { symptomId: 'mental_clarity', metricKey: 'mood', direction: 'high', threshold: 6, phase: 'rise' },
  // Peak phase
  { symptomId: 'max_strength', metricKey: 'energy', direction: 'high', threshold: 6, phase: 'peak' },
  { symptomId: 'peak_focus', metricKey: 'mood', direction: 'high', threshold: 6, phase: 'peak' },
  { symptomId: 'high_confidence', metricKey: 'mood', direction: 'high', threshold: 7, phase: 'peak' },
  { symptomId: 'competitive_drive', metricKey: 'mood', direction: 'high', threshold: 7, phase: 'peak' },
  // Decline phase
  { symptomId: 'gradual_fatigue', metricKey: 'energy', direction: 'low', threshold: 5, phase: 'decline' },
  { symptomId: 'possible_irritability', metricKey: 'stress', direction: 'high', threshold: 6, phase: 'decline' },
  { symptomId: 'hunger_increase', metricKey: 'training', direction: 'low', threshold: 4, phase: 'decline' },
  // Recovery phase
  { symptomId: 'need_rest', metricKey: 'energy', direction: 'low', threshold: 5, phase: 'recovery' },
  { symptomId: 'lower_libido', metricKey: 'libido', direction: 'low', threshold: 5, phase: 'recovery' },
];

function getPhaseFromHour(logTime: string): PhaseType {
  const date = new Date(logTime);
  const hour = date.getHours() + date.getMinutes() / 60;
  return getCurrentPhase(hour).phase;
}

export function computeSymptomAccuracy(logs: DailyLogEntry[]): SymptomAccuracyResult {
  const results: PredictionResult[] = [];

  for (const log of logs) {
    const phase = getPhaseFromHour(log.log_time);
    const relevantMappings = SYMPTOM_MAPPINGS.filter((m) => m.phase === phase);

    for (const mapping of relevantMappings) {
      const actual = log[mapping.metricKey] as number;
      if (typeof actual !== 'number') continue;

      const matched =
        mapping.direction === 'high'
          ? actual >= mapping.threshold
          : actual <= mapping.threshold;

      results.push({
        symptomId: mapping.symptomId,
        predicted: true,
        actual,
        matched,
        metricKey: mapping.metricKey as string,
      });
    }
  }

  const totalPredictions = results.length;
  const correctPredictions = results.filter((r) => r.matched).length;
  const overallScore =
    totalPredictions > 0
      ? Math.round((correctPredictions / totalPredictions) * 100)
      : 0;

  return {
    overallScore,
    totalPredictions,
    correctPredictions,
    results,
  };
}
