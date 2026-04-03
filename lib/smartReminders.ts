import type { DailyLogEntry } from '@/types/log';

export interface SmartReminder {
  type: 'phase' | 'pattern' | 'streak';
  title: string;
  body: string;
  hour: number;
  minute: number;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Generates contextual notification reminders based on user patterns.
 * Free users get 1 basic reminder. Premium users get up to 6 smart reminders.
 */
export function generateSmartReminders(
  logs: DailyLogEntry[],
  streakDays: number,
  isPremium: boolean,
): SmartReminder[] {
  // Free users: single phase reminder
  if (!isPremium) {
    return [
      {
        type: 'phase',
        title: 'Rise Phase',
        body: 'Your testosterone is climbing. Peak energy in ~2h.',
        hour: 6,
        minute: 30,
      },
    ];
  }

  // Premium users: phase + pattern + streak reminders
  const reminders: SmartReminder[] = [];

  // Phase-based (always, 4 reminders)
  reminders.push(
    {
      type: 'phase',
      title: 'Rise Phase',
      body: 'Your testosterone is climbing. Peak energy in ~2h.',
      hour: 6,
      minute: 30,
    },
    {
      type: 'phase',
      title: 'Peak Performance',
      body: 'Performance window open. Best time for training or decisions.',
      hour: 9,
      minute: 0,
    },
    {
      type: 'phase',
      title: 'Natural Slowdown',
      body: 'Energy naturally dropping. Switch to lighter tasks.',
      hour: 14,
      minute: 0,
    },
    {
      type: 'phase',
      title: 'Recovery Time',
      body: 'Quality sleep tonight = better testosterone tomorrow.',
      hour: 21,
      minute: 0,
    },
  );

  // Pattern-based (after 7+ logs, add up to 2)
  if (logs.length >= 7) {
    const patternReminders = getPatternReminders(logs);
    // Limit to 2 pattern reminders max
    reminders.push(...patternReminders.slice(0, 2));
  }

  // Streak-based (always 1)
  if (streakDays > 0) {
    reminders.push({
      type: 'streak',
      title: 'Keep your streak!',
      body: `You're on a ${streakDays}-day streak. Don't break it -- log today.`,
      hour: 20,
      minute: 0,
    });
  } else {
    reminders.push({
      type: 'streak',
      title: 'Get back on track',
      body: 'You missed yesterday. Quick 60-second log to restart.',
      hour: 9,
      minute: 30,
    });
  }

  return reminders;
}

function getPatternReminders(logs: DailyLogEntry[]): SmartReminder[] {
  const reminders: SmartReminder[] = [];
  const todayDayOfWeek = new Date().getDay();

  // Analyze day-of-week energy patterns
  const dayEnergy: Record<number, number[]> = {};
  logs.forEach((log) => {
    const day = new Date(log.log_date + 'T00:00:00').getDay();
    if (!dayEnergy[day]) dayEnergy[day] = [];
    dayEnergy[day].push(log.energy);
  });

  let lowestDay = 0;
  let lowestAvg = 10;
  Object.entries(dayEnergy).forEach(([day, values]) => {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      lowestDay = Number(day);
    }
  });

  if (todayDayOfWeek === lowestDay) {
    reminders.push({
      type: 'pattern',
      title: 'Heads up',
      body: `Your energy is usually lower on ${DAY_NAMES[todayDayOfWeek]}. Plan lighter tasks.`,
      hour: 8,
      minute: 0,
    });
  }

  // Check training in last 3 days
  const sorted = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date));
  const last3 = sorted.slice(-3);
  if (last3.length >= 3) {
    const trainingAvg = last3.reduce((s, l) => s + l.training, 0) / last3.length;
    if (trainingAvg < 3) {
      reminders.push({
        type: 'pattern',
        title: 'Move your body',
        body: "You haven't trained in 3 days. Your score improves on training days.",
        hour: 10,
        minute: 0,
      });
    }
  }

  // Check stress in last 3 days
  if (last3.length >= 3) {
    const stressAvg = last3.reduce((s, l) => s + l.stress, 0) / last3.length;
    if (stressAvg > 7) {
      reminders.push({
        type: 'pattern',
        title: 'Stress alert',
        body: 'Your stress has been high. Try a breathing exercise today.',
        hour: 15,
        minute: 0,
      });
    }
  }

  return reminders;
}
