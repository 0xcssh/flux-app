import {
  rollingAverage,
  pearsonCorrelation,
  findTopCorrelations,
  detectDayOfWeekPattern,
} from '../../lib/correlations';
import { DailyLogEntry, MetricKey } from '../../types/log';

// ── Helper: create a synthetic log entry ──────────────────────────────

function makeLog(
  date: string,
  overrides: Partial<Record<MetricKey, number>> & { vitality_score?: number } = {},
): DailyLogEntry {
  return {
    id: `log-${date}`,
    user_id: 'user-1',
    log_date: date,
    energy: overrides.energy ?? 5,
    mood: overrides.mood ?? 5,
    libido: overrides.libido ?? 5,
    sleep_quality: overrides.sleep_quality ?? 5,
    stress: overrides.stress ?? 5,
    training: overrides.training ?? 5,
    notes: '',
    nofap_checked: false,
    vitality_score: overrides.vitality_score ?? 50,
    log_time: `${date}T08:00:00Z`,
    synced: true,
    created_at: `${date}T08:00:00Z`,
    updated_at: `${date}T08:00:00Z`,
  };
}

function makeDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('correlations', () => {
  // ── pearsonCorrelation ────────────────────────────────────────────

  describe('pearsonCorrelation', () => {
    it('returns r ≈ 1 for perfect positive correlation', () => {
      const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const y = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
      const { r, significance } = pearsonCorrelation(x, y);
      expect(r).toBeCloseTo(1.0, 3);
      expect(significance).toBe('high');
    });

    it('returns r ≈ -1 for perfect negative correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [10, 8, 6, 4, 2];
      const { r } = pearsonCorrelation(x, y);
      expect(r).toBeCloseTo(-1.0, 3);
    });

    it('returns r ≈ 0 for uncorrelated data', () => {
      // Orthogonal patterns
      const x = [1, 0, -1, 0, 1, 0, -1, 0];
      const y = [0, 1, 0, -1, 0, 1, 0, -1];
      const { r, significance } = pearsonCorrelation(x, y);
      expect(Math.abs(r)).toBeLessThan(0.1);
      expect(significance).toBe('low');
    });

    it('handles constant arrays (zero variance)', () => {
      const x = [5, 5, 5, 5];
      const y = [1, 2, 3, 4];
      const { r } = pearsonCorrelation(x, y);
      expect(r).toBe(0);
    });

    it('handles empty arrays', () => {
      const { r } = pearsonCorrelation([], []);
      expect(r).toBe(0);
    });

    it('classifies significance correctly', () => {
      // Medium correlation
      const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const y = [2, 1, 4, 3, 6, 5, 8, 7, 10, 9]; // slightly noisy positive
      const { r, significance } = pearsonCorrelation(x, y);
      expect(Math.abs(r)).toBeGreaterThan(0.4);
      // Depending on noise, could be medium or high
      expect(['medium', 'high']).toContain(significance);
    });
  });

  // ── rollingAverage ────────────────────────────────────────────────

  describe('rollingAverage', () => {
    it('returns nulls for positions before window is full', () => {
      const result = rollingAverage([1, 2, 3, 4, 5], 3);
      expect(result[0]).toBeNull();
      expect(result[1]).toBeNull();
      expect(result[2]).toBeCloseTo(2, 5);
    });

    it('computes correct averages', () => {
      const result = rollingAverage([10, 20, 30, 40, 50], 3);
      expect(result[2]).toBeCloseTo(20, 5); // (10+20+30)/3
      expect(result[3]).toBeCloseTo(30, 5); // (20+30+40)/3
      expect(result[4]).toBeCloseTo(40, 5); // (30+40+50)/3
    });

    it('window of 1 returns the original values', () => {
      const values = [3, 7, 1, 9];
      const result = rollingAverage(values, 1);
      expect(result).toEqual([3, 7, 1, 9]);
    });

    it('handles empty array', () => {
      expect(rollingAverage([], 3)).toEqual([]);
    });
  });

  // ── findTopCorrelations ───────────────────────────────────────────

  describe('findTopCorrelations', () => {
    it('returns empty for insufficient data', () => {
      const logs = [makeLog('2025-01-01')];
      expect(findTopCorrelations(logs)).toEqual([]);
    });

    it('finds strong correlations in synthetic data', () => {
      // Create 30 logs where energy perfectly tracks mood
      const logs: DailyLogEntry[] = [];
      for (let i = 0; i < 30; i++) {
        const day = makeDateString(2025, 1, i + 1);
        const val = (i % 9) + 1; // cycles 1-9
        logs.push(
          makeLog(day, {
            energy: val,
            mood: val, // perfect correlation with energy
            libido: 5,
            sleep_quality: 5,
            stress: 5,
            training: 5,
          }),
        );
      }

      const correlations = findTopCorrelations(logs);
      expect(correlations.length).toBeGreaterThan(0);

      // energy-mood should be at the top with r ≈ 1
      const energyMood = correlations.find(
        (c) =>
          (c.metric_a === 'energy' && c.metric_b === 'mood') ||
          (c.metric_a === 'mood' && c.metric_b === 'energy'),
      );
      expect(energyMood).toBeDefined();
      expect(energyMood!.r_value).toBeCloseTo(1.0, 2);
    });

    it('sorts by |r| descending', () => {
      const logs: DailyLogEntry[] = [];
      for (let i = 0; i < 30; i++) {
        const day = makeDateString(2025, 1, i + 1);
        const val = (i % 9) + 1;
        logs.push(
          makeLog(day, {
            energy: val,
            mood: val,
            libido: 10 - val, // negative correlation with energy
            sleep_quality: 5,
            stress: 5,
            training: 5,
          }),
        );
      }

      const correlations = findTopCorrelations(logs);
      for (let i = 1; i < correlations.length; i++) {
        expect(Math.abs(correlations[i - 1].r_value)).toBeGreaterThanOrEqual(
          Math.abs(correlations[i].r_value),
        );
      }
    });
  });

  // ── detectDayOfWeekPattern ────────────────────────────────────────

  describe('detectDayOfWeekPattern', () => {
    it('returns null for insufficient data', () => {
      const logs = [makeLog('2025-01-01')];
      expect(detectDayOfWeekPattern(logs, 'energy')).toBeNull();
    });

    it('detects a day with high deviation', () => {
      // Create 4 weeks of logs. Mondays (day 1) have energy=10, all others energy=5
      const logs: DailyLogEntry[] = [];
      const start = new Date('2025-01-06'); // Monday
      for (let i = 0; i < 28; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = d.toISOString().slice(0, 10);
        const dow = d.getDay();
        logs.push(makeLog(dateStr, { energy: dow === 1 ? 10 : 5 }));
      }

      const result = detectDayOfWeekPattern(logs, 'energy');
      expect(result).not.toBeNull();
      expect(result!.day).toBe(1); // Monday
      expect(result!.dayName).toBe('Monday');
      expect(result!.avgDiff).toBeGreaterThan(0);
    });
  });
});
