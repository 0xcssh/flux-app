import type { DailyLogEntry } from '@/types/log';
import { formatLocalDate } from '@/lib/dateUtils';
import i18n from '@/i18n';

export interface ReminderTemplate {
  templateKey: string;
  params: Record<string, string | number>;
  hour: number;
  minute: number;
  type: 'phase' | 'pattern' | 'streak' | 'nofap' | 'logging';
}

export interface GenerateSmartRemindersParams {
  logs: DailyLogEntry[];
  streakDays: number;
  nofapStreakDays: number;
  wakeUpHour: number;
  isPremium: boolean;
}

const MAX_CONDITIONAL = 3;

function clampHour(h: number): number {
  if (h < 0) return 0;
  if (h > 23) return 23;
  return h;
}

function sortedLogsAsc(logs: DailyLogEntry[]): DailyLogEntry[] {
  return [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date));
}

function getYesterdaysLog(logs: DailyLogEntry[]): DailyLogEntry | null {
  const sorted = sortedLogsAsc(logs);
  if (sorted.length === 0) return null;
  const last = sorted[sorted.length - 1];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (last.log_date === formatLocalDate(yesterday)) return last;
  return null;
}

function getLastNLogs(logs: DailyLogEntry[], n: number): DailyLogEntry[] {
  const sorted = sortedLogsAsc(logs);
  return sorted.slice(-n);
}

function isMonotonicallyIncreasing(values: number[]): boolean {
  if (values.length < 2) return false;
  for (let i = 1; i < values.length; i++) {
    if (values[i] <= values[i - 1]) return false;
  }
  return true;
}

function getLowestDayOfWeek(
  logs: DailyLogEntry[],
): { dayIndex: number; count: number } | null {
  const dayScores: Record<number, number[]> = {};
  logs.forEach((log) => {
    const day = new Date(log.log_date + 'T00:00:00').getDay();
    if (!dayScores[day]) dayScores[day] = [];
    dayScores[day].push(log.vitality_score);
  });

  let lowestDay = -1;
  let lowestAvg = Infinity;
  let lowestCount = 0;

  Object.entries(dayScores).forEach(([day, values]) => {
    if (values.length === 0) return;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      lowestDay = Number(day);
      lowestCount = values.length;
    }
  });

  if (lowestDay === -1) return null;
  return { dayIndex: lowestDay, count: lowestCount };
}

export function generateSmartReminders(
  params: GenerateSmartRemindersParams,
): ReminderTemplate[] {
  const { logs, streakDays, nofapStreakDays, wakeUpHour, isPremium } = params;

  if (!isPremium) {
    return [
      {
        templateKey: 'logging.daily_reminder',
        params: {},
        hour: 20,
        minute: 0,
        type: 'logging',
      },
    ];
  }

  const reminders: ReminderTemplate[] = [];

  reminders.push(
    {
      templateKey: 'phase.rise',
      params: { hours: 4 },
      hour: clampHour(wakeUpHour),
      minute: 0,
      type: 'phase',
    },
    {
      templateKey: 'phase.peak',
      params: {},
      hour: clampHour(wakeUpHour + 4),
      minute: 0,
      type: 'phase',
    },
    {
      templateKey: 'phase.dip',
      params: {},
      hour: clampHour(wakeUpHour + 7),
      minute: 0,
      type: 'phase',
    },
    {
      templateKey: 'phase.recovery',
      params: {},
      hour: clampHour(Math.max(wakeUpHour + 14, 20)),
      minute: 0,
      type: 'phase',
    },
  );

  const conditional: ReminderTemplate[] = [];
  const yesterdaysLog = getYesterdaysLog(logs);
  const last3 = getLastNLogs(logs, 3);
  const todayDayIdx = new Date().getDay();

  if (yesterdaysLog && yesterdaysLog.sleep_quality <= 4) {
    conditional.push({
      templateKey: 'pattern.poor_sleep',
      params: { quality: yesterdaysLog.sleep_quality },
      hour: clampHour(wakeUpHour + 1),
      minute: 0,
      type: 'pattern',
    });
  }

  if (nofapStreakDays === 7) {
    conditional.push({
      templateKey: 'nofap.day_7_libido',
      params: { days: 7 },
      hour: clampHour(wakeUpHour + 2),
      minute: 0,
      type: 'nofap',
    });
  }

  if (nofapStreakDays >= 8 && nofapStreakDays <= 10) {
    conditional.push({
      templateKey: 'nofap.day_9_fog',
      params: { days: nofapStreakDays },
      hour: clampHour(wakeUpHour + 2),
      minute: 0,
      type: 'nofap',
    });
  }

  if (nofapStreakDays === 14) {
    conditional.push({
      templateKey: 'nofap.day_14_focus',
      params: { days: 14 },
      hour: clampHour(wakeUpHour + 3),
      minute: 0,
      type: 'nofap',
    });
  }

  if ([21, 30, 60, 90].includes(nofapStreakDays)) {
    conditional.push({
      templateKey: 'nofap.milestone',
      params: { days: nofapStreakDays },
      hour: clampHour(wakeUpHour + 2),
      minute: 0,
      type: 'nofap',
    });
  }

  if (last3.length >= 3) {
    const stressAvg = last3.reduce((s, l) => s + l.stress, 0) / last3.length;
    if (stressAvg > 7) {
      conditional.push({
        templateKey: 'pattern.high_stress_3d',
        params: {},
        hour: 15,
        minute: 0,
        type: 'pattern',
      });
    }
  }

  if (last3.length >= 3) {
    const trainingAvg = last3.reduce((s, l) => s + l.training, 0) / last3.length;
    if (trainingAvg < 3) {
      conditional.push({
        templateKey: 'pattern.no_training_3d',
        params: {},
        hour: 10,
        minute: 0,
        type: 'pattern',
      });
    }
  }

  const lowestDay = getLowestDayOfWeek(logs);
  if (lowestDay && lowestDay.count >= 2 && lowestDay.dayIndex === todayDayIdx) {
    const dayName = i18n.t(`notifications:days.${todayDayIdx}`);
    conditional.push({
      templateKey: 'pattern.low_day_of_week',
      params: { dayName },
      hour: clampHour(wakeUpHour + 1),
      minute: 0,
      type: 'pattern',
    });
  }

  if (last3.length >= 3) {
    const scores = last3.map((l) => l.vitality_score);
    if (isMonotonicallyIncreasing(scores) && scores[scores.length - 1] > 70) {
      conditional.push({
        templateKey: 'pattern.improving_trend',
        params: { days: 3 },
        hour: 20,
        minute: 0,
        type: 'pattern',
      });
    }
  }

  if (streakDays >= 3) {
    conditional.push({
      templateKey: 'streak.active',
      params: { days: streakDays },
      hour: 20,
      minute: 0,
      type: 'streak',
    });
  }

  if (streakDays === 0 && logs.length >= 3) {
    const sorted = sortedLogsAsc(logs);
    const lastLog = sorted[sorted.length - 1];
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    if (lastLog.log_date === formatLocalDate(twoDaysAgo)) {
      conditional.push({
        templateKey: 'streak.broken',
        params: {},
        hour: clampHour(wakeUpHour + 1),
        minute: 0,
        type: 'streak',
      });
    }
  }

  reminders.push(...conditional.slice(0, MAX_CONDITIONAL));

  return reminders;
}
