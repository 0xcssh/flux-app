import type { PhaseType, DailyLogEntry } from '@/types/log';

export interface PredictedSymptom {
  id: string;
  labelKey: string;
  icon: string;
  intensity: 1 | 2 | 3;
  category: 'physical' | 'mental' | 'emotional';
}

export interface SymptomPrediction {
  phase: PhaseType;
  symptoms: PredictedSymptom[];
  personalNote?: { key: string; params: Record<string, string> };
}

const PHASE_SYMPTOMS: Record<PhaseType, PredictedSymptom[]> = {
  rise: [
    { id: 'rising_energy', labelKey: 'symptom.rising_energy', icon: '⚡', intensity: 2, category: 'physical' },
    { id: 'mental_clarity', labelKey: 'symptom.mental_clarity', icon: '🧠', intensity: 1, category: 'mental' },
    { id: 'motivation_up', labelKey: 'symptom.motivation_up', icon: '🎯', intensity: 2, category: 'emotional' },
    { id: 'appetite_normal', labelKey: 'symptom.appetite_normal', icon: '🍽️', intensity: 1, category: 'physical' },
  ],
  peak: [
    { id: 'max_strength', labelKey: 'symptom.max_strength', icon: '💪', intensity: 3, category: 'physical' },
    { id: 'peak_focus', labelKey: 'symptom.peak_focus', icon: '🔥', intensity: 3, category: 'mental' },
    { id: 'high_confidence', labelKey: 'symptom.high_confidence', icon: '👑', intensity: 3, category: 'emotional' },
    { id: 'competitive_drive', labelKey: 'symptom.competitive_drive', icon: '⚔️', intensity: 2, category: 'mental' },
  ],
  decline: [
    { id: 'gradual_fatigue', labelKey: 'symptom.gradual_fatigue', icon: '😮‍💨', intensity: 2, category: 'physical' },
    { id: 'creativity_window', labelKey: 'symptom.creativity_window', icon: '🎨', intensity: 2, category: 'mental' },
    { id: 'possible_irritability', labelKey: 'symptom.possible_irritability', icon: '😤', intensity: 1, category: 'emotional' },
    { id: 'hunger_increase', labelKey: 'symptom.hunger_increase', icon: '🍔', intensity: 2, category: 'physical' },
  ],
  recovery: [
    { id: 'need_rest', labelKey: 'symptom.need_rest', icon: '😴', intensity: 3, category: 'physical' },
    { id: 'lower_libido', labelKey: 'symptom.lower_libido', icon: '💤', intensity: 2, category: 'physical' },
    { id: 'reflective_mood', labelKey: 'symptom.reflective_mood', icon: '🌙', intensity: 1, category: 'emotional' },
    { id: 'melatonin_rising', labelKey: 'symptom.melatonin_rising', icon: '🧪', intensity: 2, category: 'physical' },
  ],
};

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function getPredictedSymptoms(
  phase: PhaseType,
  logs?: DailyLogEntry[],
): SymptomPrediction {
  const symptoms = PHASE_SYMPTOMS[phase];
  const prediction: SymptomPrediction = { phase, symptoms };

  if (logs && logs.length >= 7) {
    // Compute day-of-week averages for energy
    const dayTotals: Record<number, { sum: number; count: number }> = {};
    for (let d = 0; d < 7; d++) {
      dayTotals[d] = { sum: 0, count: 0 };
    }

    for (const log of logs) {
      const dayOfWeek = new Date(log.log_date).getDay();
      dayTotals[dayOfWeek].sum += log.energy;
      dayTotals[dayOfWeek].count += 1;
    }

    let lowestDay = -1;
    let lowestAvg = Infinity;

    for (let d = 0; d < 7; d++) {
      if (dayTotals[d].count > 0) {
        const avg = dayTotals[d].sum / dayTotals[d].count;
        if (avg < lowestAvg) {
          lowestAvg = avg;
          lowestDay = d;
        }
      }
    }

    if (lowestDay >= 0) {
      prediction.personalNote = {
        key: 'symptom.personal_note',
        params: {
          dayName: DAY_NAMES[lowestDay],
          metric: 'energy',
          direction: 'lower',
        },
      };
    }
  }

  return prediction;
}
