import type { DailyLogEntry, MetricKey } from '@/types/log';
import { formatLocalDate } from '@/lib/dateUtils';

export interface WeeklyAction {
  iconName: string;
  text: string;
}

export interface WeeklyReport {
  weekStartDate: string;
  weekEndDate: string;
  avgScore: number;
  prevWeekAvgScore: number | null;
  trend: number; // percentage change
  bestDay: { date: string; score: number; dayName: string } | null;
  worstDay: { date: string; score: number; dayName: string } | null;
  topPattern: string | null;
  actions: WeeklyAction[];
  daysLogged: number;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const METRIC_LABELS: Record<MetricKey, string> = {
  energy: 'energy',
  mood: 'mood',
  libido: 'libido',
  sleep_quality: 'sleep quality',
  stress: 'stress',
  training: 'training',
};

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // getDay() returns 0 for Sunday, we want Monday=0
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return DAY_NAMES[d.getDay()];
}

export function generateWeeklyReport(logs: DailyLogEntry[]): WeeklyReport | null {
  const today = new Date();
  const thisMonday = getMonday(today);

  // Previous week: Mon-Sun before this Monday
  const prevWeekEnd = new Date(thisMonday);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 1); // Sunday
  const prevWeekStart = new Date(prevWeekEnd);
  prevWeekStart.setDate(prevWeekStart.getDate() - 6); // Monday

  // Week before that (for trend comparison)
  const olderWeekEnd = new Date(prevWeekStart);
  olderWeekEnd.setDate(olderWeekEnd.getDate() - 1);
  const olderWeekStart = new Date(olderWeekEnd);
  olderWeekStart.setDate(olderWeekStart.getDate() - 6);

  const prevWeekStartStr = formatLocalDate(prevWeekStart);
  const prevWeekEndStr = formatLocalDate(prevWeekEnd);
  const olderWeekStartStr = formatLocalDate(olderWeekStart);
  const olderWeekEndStr = formatLocalDate(olderWeekEnd);

  // Filter logs into each week
  const prevWeekLogs = logs.filter(
    (l) => l.log_date >= prevWeekStartStr && l.log_date <= prevWeekEndStr
  );
  const olderWeekLogs = logs.filter(
    (l) => l.log_date >= olderWeekStartStr && l.log_date <= olderWeekEndStr
  );

  // Need at least 3 days logged
  if (prevWeekLogs.length < 3) {
    return null;
  }

  // Average score
  const avgScore = Math.round(
    prevWeekLogs.reduce((sum, l) => sum + l.vitality_score, 0) / prevWeekLogs.length
  );

  // Previous week average for trend
  let prevWeekAvgScore: number | null = null;
  let trend = 0;
  if (olderWeekLogs.length >= 3) {
    prevWeekAvgScore = Math.round(
      olderWeekLogs.reduce((sum, l) => sum + l.vitality_score, 0) / olderWeekLogs.length
    );
    trend = prevWeekAvgScore > 0
      ? Math.round(((avgScore - prevWeekAvgScore) / prevWeekAvgScore) * 100)
      : 0;
  }

  // Best and worst day
  const sorted = [...prevWeekLogs].sort((a, b) => b.vitality_score - a.vitality_score);
  const bestLog = sorted[0];
  const worstLog = sorted[sorted.length - 1];

  const bestDay = bestLog
    ? { date: bestLog.log_date, score: bestLog.vitality_score, dayName: getDayName(bestLog.log_date) }
    : null;
  const worstDay = worstLog && worstLog.log_date !== bestLog?.log_date
    ? { date: worstLog.log_date, score: worstLog.vitality_score, dayName: getDayName(worstLog.log_date) }
    : null;

  // Compute metric averages (exclude stress which is inverted)
  const metrics: MetricKey[] = ['energy', 'mood', 'libido', 'sleep_quality', 'stress', 'training'];
  const metricAvgs: Record<string, number> = {};
  for (const metric of metrics) {
    metricAvgs[metric] =
      prevWeekLogs.reduce((sum, l) => sum + (l[metric] as number), 0) / prevWeekLogs.length;
  }

  // Top pattern: find weakest metric (lowest avg, but for stress highest = worst)
  let weakestMetric: MetricKey = 'energy';
  let weakestScore = 10;
  for (const metric of metrics) {
    // For stress, invert: high stress = weak
    const effective = metric === 'stress' ? 10 - metricAvgs[metric] : metricAvgs[metric];
    if (effective < weakestScore) {
      weakestScore = effective;
      weakestMetric = metric;
    }
  }

  const topPattern =
    weakestMetric === 'stress'
      ? `Your stress levels were elevated last week (avg ${metricAvgs[weakestMetric].toFixed(1)}/10)`
      : `Your ${METRIC_LABELS[weakestMetric]} was your weakest area last week (avg ${metricAvgs[weakestMetric].toFixed(1)}/10)`;

  // Generate actions based on weak metrics
  const actions: WeeklyAction[] = [];

  if (metricAvgs.sleep_quality < 6) {
    actions.push({ iconName: 'moon', text: 'Focus on sleep: aim for 7+ hours nightly' });
  }
  if (metricAvgs.stress > 6) {
    actions.push({ iconName: 'leaf', text: 'Try a 5-minute breathing exercise daily' });
  }
  if (metricAvgs.training < 3) {
    actions.push({ iconName: 'barbell', text: 'Add 2 training sessions this week' });
  }
  if (metricAvgs.energy < 5) {
    actions.push({ iconName: 'flash', text: 'Prioritize morning sunlight and hydration' });
  }
  if (metricAvgs.mood < 5) {
    actions.push({ iconName: 'happy', text: 'Schedule an activity you enjoy this week' });
  }

  // Default if no specific actions
  if (actions.length === 0) {
    actions.push({ iconName: 'trending-up', text: 'Keep up the consistency — your data is improving' });
  }

  // Limit to 3 actions
  const finalActions = actions.slice(0, 3);

  return {
    weekStartDate: prevWeekStartStr,
    weekEndDate: prevWeekEndStr,
    avgScore,
    prevWeekAvgScore,
    trend,
    bestDay,
    worstDay,
    topPattern,
    actions: finalActions,
    daysLogged: prevWeekLogs.length,
  };
}
