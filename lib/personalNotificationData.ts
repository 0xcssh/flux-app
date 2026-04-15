import type { DailyLogEntry } from '@/types/log';

export interface PersonalNotificationData {
  energyDipHour?: number;
  bestTrainingDay?: string;
  avgSleepQuality?: number;
  lowestEnergyDay?: string;
}

export function computePersonalNotificationData(
  logs: DailyLogEntry[],
): PersonalNotificationData | undefined {
  if (logs.length < 7) return undefined;

  // Find lowest energy day of week
  const dayEnergy: Record<number, number[]> = {};
  logs.forEach(log => {
    const day = new Date(log.log_date).getDay();
    if (!dayEnergy[day]) dayEnergy[day] = [];
    dayEnergy[day].push(log.energy);
  });

  let lowestDay = 0;
  let lowestAvg = 10;
  Object.entries(dayEnergy).forEach(([day, values]) => {
    if (values.length === 0) return;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg < lowestAvg) { lowestAvg = avg; lowestDay = Number(day); }
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Find best training day (highest training score)
  const dayTraining: Record<number, number[]> = {};
  logs.forEach(log => {
    const day = new Date(log.log_date).getDay();
    if (!dayTraining[day]) dayTraining[day] = [];
    dayTraining[day].push(log.training);
  });
  let bestDay = 0;
  let bestAvg = 0;
  Object.entries(dayTraining).forEach(([day, values]) => {
    if (values.length === 0) return;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg > bestAvg) { bestAvg = avg; bestDay = Number(day); }
  });

  // Avg sleep quality from last 7 logs
  const recent = logs.slice(-7);
  if (recent.length === 0) return undefined;
  const avgSleep = recent.reduce((s, l) => s + l.sleep_quality, 0) / recent.length;

  return {
    lowestEnergyDay: dayNames[lowestDay],
    bestTrainingDay: dayNames[bestDay],
    avgSleepQuality: Math.round(avgSleep * 10) / 10,
    energyDipHour: 14, // Default 2 PM — could be refined with log_time analysis
  };
}
