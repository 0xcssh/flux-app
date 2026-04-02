import {
  getCircadianValue,
  getCircadianCurve,
  getCurrentPhase,
  calculateVitalityScore,
  getSeasonalFactor,
  getContextualTipKey,
  detectInfradianCycle,
} from '../../lib/hormoneEngine';

describe('hormoneEngine', () => {
  // ── getCircadianValue ───────────────────────────────────────────────

  describe('getCircadianValue', () => {
    it('returns peak value around 6:30 AM (acrophase)', () => {
      const peak = getCircadianValue(6.5);
      // At acrophase, cos(0) = 1 → baseline + amplitude = 0.5 + 0.25 = 0.75
      expect(peak).toBeCloseTo(0.75, 2);
    });

    it('returns nadir around 6:30 PM (18.5h)', () => {
      const nadir = getCircadianValue(18.5);
      // 12 h from acrophase → cos(π) = -1 → 0.5 - 0.25 = 0.25
      expect(nadir).toBeCloseTo(0.25, 2);
    });

    it('returns ~0.5 at midpoints (midnight, noon)', () => {
      const noon = getCircadianValue(12.5);
      const midnight = getCircadianValue(0.5);
      // 6 h from acrophase → cos(π/2) = 0 → 0.5
      expect(noon).toBeCloseTo(0.5, 1);
      expect(midnight).toBeCloseTo(0.5, 1);
    });

    it('peak is higher than nadir', () => {
      const peak = getCircadianValue(6.5);
      const nadir = getCircadianValue(18.5);
      expect(peak).toBeGreaterThan(nadir);
    });

    it('all values are in [0, 1]', () => {
      for (let h = 0; h < 24; h += 0.5) {
        const v = getCircadianValue(h);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    });
  });

  // ── Age adjustment ──────────────────────────────────────────────────

  describe('age adjustment', () => {
    it('reduces amplitude for older individuals', () => {
      const currentYear = new Date().getFullYear();
      const youngPeak = getCircadianValue(6.5, currentYear - 30); // age 30
      const oldPeak = getCircadianValue(6.5, currentYear - 70); // age 70

      // Young: 0.5 + 0.25 = 0.75, Old: 0.5 + 0.10 = 0.60
      expect(youngPeak).toBeCloseTo(0.75, 2);
      expect(oldPeak).toBeCloseTo(0.60, 2);
      expect(youngPeak).toBeGreaterThan(oldPeak);
    });

    it('clamps amplitude for very young individuals', () => {
      const currentYear = new Date().getFullYear();
      const teenPeak = getCircadianValue(6.5, currentYear - 18);
      // amplitude clamped to 0.25, so same as default
      expect(teenPeak).toBeCloseTo(0.75, 2);
    });
  });

  // ── getCircadianCurve ───────────────────────────────────────────────

  describe('getCircadianCurve', () => {
    it('returns 96 data points', () => {
      const curve = getCircadianCurve();
      expect(curve).toHaveLength(96);
    });

    it('first point is hour 0, last is hour 23.75', () => {
      const curve = getCircadianCurve();
      expect(curve[0].hour).toBe(0);
      expect(curve[95].hour).toBe(23.75);
    });
  });

  // ── getCurrentPhase ─────────────────────────────────────────────────

  describe('getCurrentPhase', () => {
    it('returns rise phase at 6 AM', () => {
      const result = getCurrentPhase(6);
      expect(result.phase).toBe('rise');
      expect(result.progress).toBeCloseTo(0.5, 1);
    });

    it('returns peak phase at 10 AM', () => {
      const result = getCurrentPhase(10);
      expect(result.phase).toBe('peak');
      expect(result.progress).toBeCloseTo(0.5, 1);
    });

    it('returns decline phase at 3 PM (15h)', () => {
      const result = getCurrentPhase(15);
      expect(result.phase).toBe('decline');
    });

    it('returns recovery phase at 11 PM (23h)', () => {
      const result = getCurrentPhase(23);
      expect(result.phase).toBe('recovery');
    });

    it('returns recovery phase at 2 AM', () => {
      const result = getCurrentPhase(2);
      expect(result.phase).toBe('recovery');
    });

    it('progress is between 0 and 1', () => {
      for (let h = 0; h < 24; h++) {
        const { progress } = getCurrentPhase(h);
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(1);
      }
    });
  });

  // ── calculateVitalityScore ──────────────────────────────────────────

  describe('calculateVitalityScore', () => {
    it('returns 100 for maximum inputs', () => {
      const score = calculateVitalityScore({
        energy: 10,
        mood: 10,
        libido: 10,
        sleep_quality: 10,
        stress: 0, // (10 - 0) = 10
        training: 10,
        notes: '',
        nofap_checked: false,
      });
      expect(score).toBe(100);
    });

    it('returns low score for poor inputs', () => {
      const score = calculateVitalityScore({
        energy: 1,
        mood: 1,
        libido: 1,
        sleep_quality: 1,
        stress: 10, // (10 - 10) = 0
        training: 1,
        notes: '',
        nofap_checked: false,
      });
      // (1*0.2 + 1*0.2 + 1*0.15 + 1*0.2 + 0*0.15 + 1*0.1) / 10 * 100 = 8.5 → 9
      expect(score).toBeLessThan(15);
      expect(score).toBeGreaterThan(0);
    });

    it('returns ~50 for mid-range inputs', () => {
      const score = calculateVitalityScore({
        energy: 5,
        mood: 5,
        libido: 5,
        sleep_quality: 5,
        stress: 5, // (10-5) = 5
        training: 5,
        notes: '',
        nofap_checked: false,
      });
      expect(score).toBe(50);
    });
  });

  // ── getSeasonalFactor ───────────────────────────────────────────────

  describe('getSeasonalFactor', () => {
    it('peaks in September', () => {
      const sep = getSeasonalFactor(9);
      expect(sep).toBeCloseTo(1.0, 1);
    });

    it('is lowest around March', () => {
      const mar = getSeasonalFactor(3);
      expect(mar).toBeLessThan(0.15);
    });

    it('returns values in [0, 1]', () => {
      for (let m = 1; m <= 12; m++) {
        const v = getSeasonalFactor(m);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    });
  });

  // ── getContextualTipKey ─────────────────────────────────────────────

  describe('getContextualTipKey', () => {
    it('returns workout tip during peak morning', () => {
      expect(getContextualTipKey('peak', 9)).toBe('tip.peak_morning_workout');
    });

    it('returns wind-down tip during late decline', () => {
      expect(getContextualTipKey('decline', 18)).toBe('tip.decline_wind_down');
    });

    it('returns sleep tip during late recovery', () => {
      expect(getContextualTipKey('recovery', 23)).toBe('tip.recovery_sleep');
    });
  });

  // ── detectInfradianCycle ────────────────────────────────────────────

  describe('detectInfradianCycle', () => {
    it('returns null for fewer than 30 data points', () => {
      const result = detectInfradianCycle(new Array(20).fill(50));
      expect(result).toBeNull();
    });

    it('detects a synthetic 25-day cycle', () => {
      // Generate 90 days of sinusoidal data with period 25
      const scores: number[] = [];
      for (let d = 0; d < 90; d++) {
        scores.push(50 + 20 * Math.sin((2 * Math.PI * d) / 25));
      }
      const result = detectInfradianCycle(scores);
      expect(result).not.toBeNull();
      expect(result!.periodDays).toBe(25);
      expect(result!.confidence).toBeGreaterThan(0.3);
    });

    it('detects a synthetic 20-day cycle', () => {
      const scores: number[] = [];
      for (let d = 0; d < 80; d++) {
        scores.push(60 + 15 * Math.sin((2 * Math.PI * d) / 20));
      }
      const result = detectInfradianCycle(scores);
      expect(result).not.toBeNull();
      expect(result!.periodDays).toBe(20);
    });

    it('returns null for monotonically increasing data (no cycle)', () => {
      // Linear ramp has no periodicity
      const scores: number[] = [];
      for (let d = 0; d < 90; d++) {
        scores.push(d); // 0, 1, 2, ..., 89
      }
      const result = detectInfradianCycle(scores);
      expect(result).toBeNull();
    });

    it('returns null for constant data', () => {
      const result = detectInfradianCycle(new Array(60).fill(50));
      expect(result).toBeNull();
    });
  });
});
