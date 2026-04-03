import { LogFormData, PhaseType } from '@/types/log';

// ── Constants ──────────────────────────────────────────────────────────
const ACROPHASE = 6.5; // 6:30 AM — peak testosterone
const PERIOD = 24; // circadian period in hours
const TWO_PI = 2 * Math.PI;

// Phase boundaries (hour of day)
const PHASE_BOUNDARIES: { phase: PhaseType; start: number; end: number; labelKey: string }[] = [
  { phase: 'rise', start: 4, end: 8, labelKey: 'phase.rise' },
  { phase: 'peak', start: 8, end: 12, labelKey: 'phase.peak' },
  { phase: 'decline', start: 12, end: 20, labelKey: 'phase.decline' },
  { phase: 'recovery', start: 20, end: 28, labelKey: 'phase.recovery' }, // 28 = 4 AM next day
];

// Vitality score weights
const WEIGHTS: Record<string, number> = {
  energy: 0.2,
  mood: 0.2,
  libido: 0.15,
  sleep_quality: 0.2,
  stress: 0.15, // inverted: (10 - stress)
  training: 0.1,
};

// ── Helpers ────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Compute amplitude based on age. Younger men (~30) have amplitude ~0.25,
 * declining linearly to ~0.10 by age 70.
 */
function amplitudeForAge(birthYear?: number): number {
  if (birthYear == null) return 0.25; // default to young-adult amplitude
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  // amplitude = 0.25 - (age - 30) * 0.00375  →  0.25 at 30, 0.10 at 70
  const raw = 0.25 - (age - 30) * 0.00375;
  return clamp(raw, 0.1, 0.25);
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Get circadian testosterone value at a given fractional hour (0-24).
 * Returns normalised 0-1 where 1 = daily peak.
 */
export function getCircadianValue(
  hour: number,
  birthYear?: number,
  options?: { acrophase?: number },
): number {
  const amplitude = amplitudeForAge(birthYear);
  const baseline = 0.5;
  const acrophase = options?.acrophase ?? ACROPHASE;
  // Cosine model: peak at acrophase, trough 12 h later
  const raw = baseline + amplitude * Math.cos((TWO_PI * (hour - acrophase)) / PERIOD);
  return clamp(raw, 0, 1);
}

/**
 * Generate a smooth circadian curve — 96 points (every 15 min).
 */
export function getCircadianCurve(
  birthYear?: number,
  options?: { acrophase?: number },
): { hour: number; value: number }[] {
  const points: { hour: number; value: number }[] = [];
  for (let i = 0; i < 96; i++) {
    const hour = i * 0.25;
    points.push({ hour, value: getCircadianValue(hour, birthYear, options) });
  }
  return points;
}

/**
 * Determine the current circadian phase and progress within it.
 */
export function getCurrentPhase(
  hour: number,
  options?: { acrophase?: number },
): { phase: PhaseType; progress: number; labelKey: string } {
  // Compute offset from the default acrophase to shift phase boundaries
  const offset = (options?.acrophase ?? ACROPHASE) - ACROPHASE;

  // Normalise hour to handle wrap-around for recovery
  let h = hour;
  const recoveryEnd = 4 + offset;
  if (h < recoveryEnd) h += 24;

  for (const pb of PHASE_BOUNDARIES) {
    const start = pb.start + offset;
    const end = pb.end + offset;
    if (h >= start && h < end) {
      const duration = end - start;
      const progress = clamp((h - start) / duration, 0, 1);
      return { phase: pb.phase, progress, labelKey: pb.labelKey };
    }
  }

  // Fallback (should not happen with correct boundaries)
  return { phase: 'recovery', progress: 0, labelKey: 'phase.recovery' };
}

/**
 * Calculate the vitality score (0-100) from a log form.
 */
export function calculateVitalityScore(log: LogFormData): number {
  const weighted =
    log.energy * WEIGHTS.energy +
    log.mood * WEIGHTS.mood +
    log.libido * WEIGHTS.libido +
    log.sleep_quality * WEIGHTS.sleep_quality +
    (10 - log.stress) * WEIGHTS.stress +
    log.training * WEIGHTS.training;

  // Each metric is 1-10, max weighted sum = 10 * 1.0 = 10
  const normalised = (weighted / 10) * 100;
  return Math.round(clamp(normalised, 0, 100));
}

/**
 * Seasonal testosterone modifier (0-1 scale).
 * Peak in late summer / early autumn (Aug-Oct), nadir late winter (Feb-Mar).
 * Modelled as a cosine with peak at month 9 (September).
 */
export function getSeasonalFactor(month: number): number {
  // month: 1 = January … 12 = December
  // Cosine peaks when argument = 0, so shift so month 9 → 0
  const raw = 0.5 + 0.5 * Math.cos((TWO_PI * (month - 9)) / 12);
  return clamp(raw, 0, 1);
}

/**
 * Return an i18n key for a contextual tip based on phase and hour.
 */
export function getContextualTipKey(phase: PhaseType, hour: number): string {
  switch (phase) {
    case 'rise':
      return hour < 6 ? 'tip.rise_early_hydrate' : 'tip.rise_plan_day';
    case 'peak':
      return hour < 10 ? 'tip.peak_morning_workout' : 'tip.peak_focus_work';
    case 'decline':
      return hour < 16 ? 'tip.decline_light_activity' : 'tip.decline_wind_down';
    case 'recovery':
      return hour >= 22 || hour < 2 ? 'tip.recovery_sleep' : 'tip.recovery_relax';
  }
}

/**
 * Detect an infradian (multi-day) testosterone cycle using autocorrelation.
 *
 * @param scores Array of daily vitality scores, chronologically ordered.
 * @returns Detected period and confidence, or null if no significant cycle.
 */
export function detectInfradianCycle(
  scores: number[],
): { periodDays: number; confidence: number } | null {
  const n = scores.length;
  if (n < 30) return null;

  // Remove linear trend (least-squares detrend)
  let sumT = 0;
  let sumV = 0;
  let sumTV = 0;
  let sumT2 = 0;
  for (let i = 0; i < n; i++) {
    sumT += i;
    sumV += scores[i];
    sumTV += i * scores[i];
    sumT2 += i * i;
  }
  const slope = (n * sumTV - sumT * sumV) / (n * sumT2 - sumT * sumT);
  const intercept = (sumV - slope * sumT) / n;
  const detrended = scores.map((v, i) => v - (slope * i + intercept));

  // Compute variance (autocorrelation at lag 0)
  const variance = detrended.reduce((s, v) => s + v * v, 0);
  if (variance === 0) return null;

  let bestLag = 0;
  let bestR = -Infinity;

  // Test lags 15–35 days
  const minLag = 15;
  const maxLag = Math.min(35, Math.floor(n / 2));

  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
      sum += detrended[i] * detrended[i + lag];
    }
    const r = sum / variance;
    if (r > bestR) {
      bestR = r;
      bestLag = lag;
    }
  }

  const confidence = clamp(bestR, 0, 1);
  if (confidence < 0.3) return null;

  return { periodDays: bestLag, confidence: Math.round(confidence * 100) / 100 };
}
