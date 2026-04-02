import { DailyLogEntry, MetricKey } from '@/types/log';
import { Correlation, InsightData, Pattern, Recommendation, UniversalInsight, EarlyPattern } from '@/types/insight';
import { NoFapStreak } from '@/types/nofap';

// All 6 tracked metrics
const ALL_METRICS: MetricKey[] = [
  'energy',
  'mood',
  'libido',
  'sleep_quality',
  'stress',
  'training',
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Utility ────────────────────────────────────────────────────────────

/**
 * Compute a rolling (simple moving) average.
 * Returns an array of the same length; positions with fewer than `window`
 * preceding values (inclusive) are null.
 */
export function rollingAverage(values: number[], window: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - window + 1; j <= i; j++) {
        sum += values[j];
      }
      result.push(sum / window);
    }
  }
  return result;
}

/**
 * Pearson correlation coefficient between two equal-length numeric arrays.
 */
export function pearsonCorrelation(
  x: number[],
  y: number[],
): { r: number; significance: 'low' | 'medium' | 'high' } {
  const n = x.length;
  if (n === 0 || n !== y.length) {
    return { r: 0, significance: 'low' };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return { r: 0, significance: 'low' };

  const r = numerator / denominator;
  const absR = Math.abs(r);

  let significance: 'low' | 'medium' | 'high';
  if (absR > 0.6) significance = 'high';
  else if (absR > 0.4) significance = 'medium';
  else significance = 'low';

  return { r: Math.round(r * 1000) / 1000, significance };
}

/**
 * Find the day of week that deviates most from the overall mean for a given metric.
 * Returns null if the largest deviation is less than 15%.
 */
export function detectDayOfWeekPattern(
  logs: DailyLogEntry[],
  metric: MetricKey,
): { day: number; avgDiff: number; dayName: string } | null {
  if (logs.length < 7) return null;

  const overallSum = logs.reduce((s, l) => s + l[metric], 0);
  const overallMean = overallSum / logs.length;
  if (overallMean === 0) return null;

  // Group by day of week (0 = Sunday)
  const daySums: number[] = new Array(7).fill(0);
  const dayCounts: number[] = new Array(7).fill(0);

  for (const log of logs) {
    const dow = new Date(log.log_date).getDay();
    daySums[dow] += log[metric];
    dayCounts[dow]++;
  }

  let bestDay = -1;
  let bestDiff = 0;

  for (let d = 0; d < 7; d++) {
    if (dayCounts[d] === 0) continue;
    const dayMean = daySums[d] / dayCounts[d];
    const diff = dayMean - overallMean;
    if (Math.abs(diff) > Math.abs(bestDiff)) {
      bestDiff = diff;
      bestDay = d;
    }
  }

  // Require at least 15% deviation
  if (bestDay === -1 || Math.abs(bestDiff / overallMean) < 0.15) return null;

  return {
    day: bestDay,
    avgDiff: Math.round(bestDiff * 100) / 100,
    dayName: DAY_NAMES[bestDay],
  };
}

/**
 * Compute Pearson correlations for all pairs of the 6 tracked metrics.
 * Returns correlations with |r| > 0.3, sorted by |r| descending.
 */
export function findTopCorrelations(logs: DailyLogEntry[], minDays = 14): Correlation[] {
  if (logs.length < minDays) return [];

  const correlations: Correlation[] = [];

  for (let i = 0; i < ALL_METRICS.length; i++) {
    for (let j = i + 1; j < ALL_METRICS.length; j++) {
      const metricA = ALL_METRICS[i];
      const metricB = ALL_METRICS[j];

      const xs = logs.map((l) => l[metricA]);
      const ys = logs.map((l) => l[metricB]);

      const { r, significance } = pearsonCorrelation(xs, ys);

      if (Math.abs(r) > 0.3) {
        correlations.push({
          metric_a: metricA,
          metric_b: metricB,
          r_value: r,
          significance,
          description_key: `insight.correlation.${metricA}_${metricB}`,
        });
      }
    }
  }

  correlations.sort((a, b) => Math.abs(b.r_value) - Math.abs(a.r_value));
  return correlations;
}

/**
 * Compute the correlation between NoFap streak length and vitality score.
 */
export function computeNoFapCorrelation(
  logs: DailyLogEntry[],
  streaks: NoFapStreak[],
): Correlation | null {
  if (logs.length < 7 || streaks.length === 0) return null;

  // Build a map: date → days into streak (0 if not in any streak)
  const streakDayMap = new Map<string, number>();

  for (const streak of streaks) {
    const start = new Date(streak.start_date);
    const end = streak.end_date ? new Date(streak.end_date) : new Date();
    let day = 1;
    const current = new Date(start);
    while (current <= end) {
      const key = current.toISOString().slice(0, 10);
      streakDayMap.set(key, day);
      day++;
      current.setDate(current.getDate() + 1);
    }
  }

  const xs: number[] = [];
  const ys: number[] = [];

  for (const log of logs) {
    const streakDay = streakDayMap.get(log.log_date) ?? 0;
    xs.push(streakDay);
    ys.push(log.vitality_score);
  }

  // Need some variance in streak days
  const uniqueXs = new Set(xs);
  if (uniqueXs.size < 3) return null;

  const { r, significance } = pearsonCorrelation(xs, ys);

  return {
    metric_a: 'nofap_streak_days',
    metric_b: 'vitality_score',
    r_value: r,
    significance,
    description_key: 'insight.correlation.nofap_vitality',
  };
}

// ── Insights Orchestrator ──────────────────────────────────────────────

/**
 * Run all analysis passes and produce a complete InsightData bundle.
 */
export function generateInsights(
  logs: DailyLogEntry[],
  streaks: NoFapStreak[],
): InsightData {
  const correlations: Correlation[] = findTopCorrelations(logs);

  // NoFap correlation
  const nofapCorr = computeNoFapCorrelation(logs, streaks);
  if (nofapCorr && Math.abs(nofapCorr.r_value) > 0.3) {
    correlations.push(nofapCorr);
  }

  // Patterns
  const patterns: Pattern[] = [];

  for (const metric of ALL_METRICS) {
    const dow = detectDayOfWeekPattern(logs, metric);
    if (dow) {
      patterns.push({
        type: 'day_of_week',
        metric,
        description_key: `insight.pattern.dow_${metric}`,
        params: { day: dow.day, dayName: dow.dayName, avgDiff: dow.avgDiff },
      });
    }
  }

  // Infradian cycle detection (import lazily to avoid circular deps)
  if (logs.length >= 30) {
    const { detectInfradianCycle } = require('./hormoneEngine');
    const scores = logs.map((l) => l.vitality_score);
    const cycle = detectInfradianCycle(scores);
    if (cycle) {
      patterns.push({
        type: 'infradian_cycle',
        metric: 'vitality_score',
        description_key: 'insight.pattern.infradian_cycle',
        params: { periodDays: cycle.periodDays, confidence: cycle.confidence },
      });
    }
  }

  // Recommendations
  const recommendations: Recommendation[] = generateRecommendations(logs, correlations, patterns);

  return { correlations, patterns, recommendations };
}

// ── Recommendation Generator ───────────────────────────────────────────

function generateRecommendations(
  logs: DailyLogEntry[],
  correlations: Correlation[],
  patterns: Pattern[],
): Recommendation[] {
  const recs: Recommendation[] = [];
  if (logs.length === 0) return recs;

  const recent = logs.slice(-7);

  // Average recent metrics
  const avgMetric = (key: MetricKey) =>
    recent.reduce((s, l) => s + l[key], 0) / recent.length;

  const avgSleep = avgMetric('sleep_quality');
  const avgStress = avgMetric('stress');
  const avgTraining = avgMetric('training');
  const avgEnergy = avgMetric('energy');

  if (avgSleep < 5) {
    recs.push({
      title_key: 'rec.sleep.title',
      body_key: 'rec.sleep.body',
      category: 'sleep',
      priority: 1,
    });
  }

  if (avgStress > 7) {
    recs.push({
      title_key: 'rec.stress.title',
      body_key: 'rec.stress.body',
      category: 'stress',
      priority: 1,
    });
  }

  if (avgTraining < 3) {
    recs.push({
      title_key: 'rec.training_low.title',
      body_key: 'rec.training_low.body',
      category: 'training',
      priority: 2,
    });
  }

  if (avgEnergy < 4) {
    recs.push({
      title_key: 'rec.energy_low.title',
      body_key: 'rec.energy_low.body',
      category: 'general',
      priority: 2,
    });
  }

  // If sleep and energy are strongly correlated, surface that
  const sleepEnergyCorr = correlations.find(
    (c) =>
      (c.metric_a === 'sleep_quality' && c.metric_b === 'energy') ||
      (c.metric_a === 'energy' && c.metric_b === 'sleep_quality'),
  );
  if (sleepEnergyCorr && sleepEnergyCorr.r_value > 0.5) {
    recs.push({
      title_key: 'rec.sleep_energy_link.title',
      body_key: 'rec.sleep_energy_link.body',
      category: 'sleep',
      priority: 2,
    });
  }

  // NoFap encouragement if streak correlation is positive
  const nofapCorr = correlations.find((c) => c.metric_a === 'nofap_streak_days');
  if (nofapCorr && nofapCorr.r_value > 0.3) {
    recs.push({
      title_key: 'rec.nofap_positive.title',
      body_key: 'rec.nofap_positive.body',
      category: 'nofap',
      priority: 3,
    });
  }

  // Sort by priority
  recs.sort((a, b) => a.priority - b.priority);
  return recs;
}

// ── Tiered Insight Helpers ────────────────────────────────────────────

/**
 * Returns 6 static science-based insights available from day 0.
 */
export function getUniversalInsights(): UniversalInsight[] {
  return [
    { id: 'circadian_cycle', icon: '☀️', category: 'circadian', titleKey: 'universal.circadian.title', bodyKey: 'universal.circadian.body' },
    { id: 'testosterone_peak', icon: '📈', category: 'hormone', titleKey: 'universal.peak.title', bodyKey: 'universal.peak.body' },
    { id: 'sleep_impact', icon: '😴', category: 'sleep', titleKey: 'universal.sleep.title', bodyKey: 'universal.sleep.body' },
    { id: 'exercise_timing', icon: '🏋️', category: 'training', titleKey: 'universal.exercise.title', bodyKey: 'universal.exercise.body' },
    { id: 'stress_cortisol', icon: '🧠', category: 'hormone', titleKey: 'universal.stress.title', bodyKey: 'universal.stress.body' },
    { id: 'seasonal', icon: '🌡️', category: 'circadian', titleKey: 'universal.seasonal.title', bodyKey: 'universal.seasonal.body' },
  ];
}

/**
 * Compute early patterns from 3+ days of logs.
 * For each metric: average, best/worst day, and trend direction.
 */
export function computeEarlyPatterns(logs: DailyLogEntry[]): EarlyPattern[] {
  if (logs.length < 3) return [];

  const metrics: MetricKey[] = ['energy', 'mood', 'libido', 'sleep_quality', 'stress', 'training'];
  const patterns: EarlyPattern[] = [];

  for (const metric of metrics) {
    const values = logs.map((l) => l[metric]);
    const sum = values.reduce((s, v) => s + v, 0);
    const average = Math.round((sum / values.length) * 10) / 10;

    // For stress, "best" = lowest, "worst" = highest
    const isStress = metric === 'stress';
    let bestIdx = 0;
    let worstIdx = 0;

    for (let i = 1; i < values.length; i++) {
      if (isStress) {
        if (values[i] < values[bestIdx]) bestIdx = i;
        if (values[i] > values[worstIdx]) worstIdx = i;
      } else {
        if (values[i] > values[bestIdx]) bestIdx = i;
        if (values[i] < values[worstIdx]) worstIdx = i;
      }
    }

    // Trend: compare first half avg vs second half avg
    const mid = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, mid);
    const secondHalf = values.slice(mid);
    const firstAvg = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;

    let trend: 'improving' | 'declining' | 'stable';
    if (firstAvg === 0) {
      trend = 'stable';
    } else {
      const pctChange = (secondAvg - firstAvg) / firstAvg;
      if (isStress) {
        // Lower stress = improving
        trend = pctChange < -0.1 ? 'improving' : pctChange > 0.1 ? 'declining' : 'stable';
      } else {
        trend = pctChange > 0.1 ? 'improving' : pctChange < -0.1 ? 'declining' : 'stable';
      }
    }

    patterns.push({
      metric,
      average,
      best: { date: logs[bestIdx].log_date, value: values[bestIdx] },
      worst: { date: logs[worstIdx].log_date, value: values[worstIdx] },
      trend,
    });
  }

  return patterns;
}

/**
 * Generate weekly-level insights from 7+ days of logs.
 * Runs day-of-week patterns and sleep→energy correlation.
 */
export function generateWeeklyInsights(
  logs: DailyLogEntry[],
  streaks: NoFapStreak[],
): InsightData {
  if (logs.length < 7) {
    return { correlations: [], patterns: [], recommendations: [] };
  }

  const correlations: Correlation[] = [];
  const patterns: Pattern[] = [];

  // Day-of-week patterns for all metrics
  for (const metric of ALL_METRICS) {
    const dow = detectDayOfWeekPattern(logs, metric);
    if (dow) {
      patterns.push({
        type: 'day_of_week',
        metric,
        description_key: `insight.pattern.dow_${metric}`,
        params: { day: dow.day, dayName: dow.dayName, avgDiff: dow.avgDiff },
      });
    }
  }

  // Sleep→energy correlation (the most impactful)
  const sleepValues = logs.map((l) => l.sleep_quality);
  const energyValues = logs.map((l) => l.energy);
  const { r, significance } = pearsonCorrelation(sleepValues, energyValues);

  if (Math.abs(r) > 0.3) {
    correlations.push({
      metric_a: 'sleep_quality',
      metric_b: 'energy',
      r_value: r,
      significance,
      description_key: 'insight.correlation.sleep_quality_energy',
    });
  }

  // Generate 1-2 basic recommendations from weekly data
  const recommendations: Recommendation[] = [];
  const recent = logs.slice(-7);
  const avgSleep = recent.reduce((s, l) => s + l.sleep_quality, 0) / recent.length;
  const avgStress = recent.reduce((s, l) => s + l.stress, 0) / recent.length;

  if (avgSleep < 5) {
    recommendations.push({
      title_key: 'rec.sleep.title',
      body_key: 'rec.sleep.body',
      category: 'sleep',
      priority: 1,
    });
  }

  if (avgStress > 7) {
    recommendations.push({
      title_key: 'rec.stress.title',
      body_key: 'rec.stress.body',
      category: 'stress',
      priority: 1,
    });
  }

  return { correlations, patterns, recommendations };
}
