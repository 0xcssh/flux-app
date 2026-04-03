import type { DailyLogEntry, PhaseType } from '@/types/log';

export interface ActionItem {
  iconName: string;
  text: string;
  reason?: string;
}

export interface TimeBlock {
  label: string;
  timeRange: string;
  phase: PhaseType;
  actions: ActionItem[];
}

export interface DailyActionPlan {
  timeBlocks: TimeBlock[];
  personalizedCount: number;
}

// ── Default action blocks ────────────────────────────────────────────

function getDefaultBlocks(wakeUpHour: number): TimeBlock[] {
  const offset = wakeUpHour - 6; // shift relative to default 6 AM wake

  const fmt = (h: number): string => {
    const normalized = ((h % 24) + 24) % 24;
    const period = normalized >= 12 ? 'PM' : 'AM';
    const display = normalized === 0 ? 12 : normalized > 12 ? normalized - 12 : normalized;
    return `${display} ${period}`;
  };

  const morningStart = ((6 + offset) % 24 + 24) % 24;
  const middayStart = ((10 + offset) % 24 + 24) % 24;
  const afternoonStart = ((14 + offset) % 24 + 24) % 24;
  const eveningStart = ((20 + offset) % 24 + 24) % 24;

  return [
    {
      label: 'Morning',
      timeRange: `${fmt(morningStart)} - ${fmt(middayStart)}`,
      phase: 'rise',
      actions: [
        { iconName: 'water', text: 'Hydrate within 30 min of waking', reason: 'Dehydration after sleep lowers cortisol regulation and energy' },
        { iconName: 'barbell', text: 'Best time for strength training', reason: 'Testosterone peaks in the morning, maximizing muscle protein synthesis' },
        { iconName: 'clipboard', text: 'Plan your most important task', reason: 'Morning cortisol supports focus and decision-making' },
        { iconName: 'sunny', text: 'Get 10 min of sunlight', reason: 'Morning light resets your circadian clock and boosts serotonin' },
      ],
    },
    {
      label: 'Midday',
      timeRange: `${fmt(middayStart)} - ${fmt(afternoonStart)}`,
      phase: 'peak',
      actions: [
        { iconName: 'flash', text: 'Tackle your hardest challenge now', reason: 'Peak testosterone and cortisol alignment means maximum drive' },
        { iconName: 'people', text: 'Important meetings or decisions', reason: 'Confidence and assertiveness peak with testosterone levels' },
        { iconName: 'restaurant', text: 'High protein meal', reason: 'Protein intake during peak supports muscle recovery and satiety' },
        { iconName: 'bulb', text: 'Peak cognitive performance', reason: 'Working memory and processing speed are highest around midday' },
      ],
    },
    {
      label: 'Afternoon',
      timeRange: `${fmt(afternoonStart)} - ${fmt(eveningStart)}`,
      phase: 'decline',
      actions: [
        { iconName: 'color-palette', text: 'Switch to creative or lighter tasks', reason: 'As analytical focus drops, divergent thinking improves' },
        { iconName: 'cafe', text: 'Avoid caffeine after 2 PM', reason: 'Caffeine has a 6-hour half-life and disrupts deep sleep cycles' },
        { iconName: 'walk', text: '30-min walk to maintain energy', reason: 'Light movement in the afternoon prevents the cortisol crash' },
        { iconName: 'list', text: "Prepare tomorrow's priorities", reason: 'Planning now reduces evening rumination and improves sleep onset' },
      ],
    },
    {
      label: 'Evening',
      timeRange: `${fmt(eveningStart)} - ${fmt(morningStart)}`,
      phase: 'recovery',
      actions: [
        { iconName: 'phone-portrait', text: 'No screens 1h before bed', reason: 'Blue light suppresses melatonin by up to 50%' },
        { iconName: 'fitness', text: 'Light stretching or meditation', reason: 'Activates parasympathetic nervous system for deeper sleep' },
        { iconName: 'thermometer', text: 'Cool bedroom (18-20 C)', reason: 'Core temperature drop triggers sleep onset and growth hormone release' },
        { iconName: 'bed', text: 'Consistent bedtime for hormone reset', reason: 'Irregular sleep disrupts testosterone and cortisol rhythms' },
      ],
    },
  ];
}

// ── Personalization logic ────────────────────────────────────────────

function personalizeBlocks(
  blocks: TimeBlock[],
  logs: DailyLogEntry[],
): { blocks: TimeBlock[]; personalizedCount: number } {
  let personalizedCount = 0;

  // Compute averages from recent logs
  const recent = logs.slice(-14); // last 14 logs
  if (recent.length < 7) return { blocks, personalizedCount: 0 };

  const avg = (key: keyof DailyLogEntry) => {
    const values = recent.map((l) => Number(l[key])).filter((v) => !isNaN(v));
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 5;
  };

  const avgSleepQuality = avg('sleep_quality');
  const avgStress = avg('stress');
  const avgTraining = avg('training');

  // Clone blocks to avoid mutation
  const result = blocks.map((block) => ({
    ...block,
    actions: [...block.actions],
  }));

  // Poor sleep → evening recommendation
  if (avgSleepQuality < 5) {
    const eveningBlock = result.find((b) => b.phase === 'recovery');
    if (eveningBlock) {
      eveningBlock.actions.unshift({
        iconName: 'alert-circle',
        text: 'Your sleep has been poor -- prioritize rest tonight',
        reason: `Your average sleep quality is ${avgSleepQuality.toFixed(1)}/10 over the last ${recent.length} days`,
      });
      personalizedCount++;
    }
  }

  // High stress → afternoon breathing exercise
  if (avgStress > 7) {
    const afternoonBlock = result.find((b) => b.phase === 'decline');
    if (afternoonBlock) {
      afternoonBlock.actions.unshift({
        iconName: 'leaf',
        text: 'Your stress is high -- consider a breathing exercise',
        reason: `Your average stress level is ${avgStress.toFixed(1)}/10. Box breathing (4-4-4-4) lowers cortisol`,
      });
      personalizedCount++;
    }
  }

  // Low training → replace morning workout action
  if (avgTraining < 3) {
    const morningBlock = result.find((b) => b.phase === 'rise');
    if (morningBlock) {
      const workoutIdx = morningBlock.actions.findIndex((a) =>
        a.text.includes('strength training'),
      );
      if (workoutIdx >= 0) {
        morningBlock.actions[workoutIdx] = {
          iconName: 'walk',
          text: 'Even a 15-min walk helps -- your training has been low',
          reason: `Your average training is ${avgTraining.toFixed(1)}/10. Light movement still boosts testosterone`,
        };
        personalizedCount++;
      }
    }
  }

  return { blocks: result, personalizedCount };
}

// ── Main export ──────────────────────────────────────────────────────

export function generateDailyPlan(
  hour: number,
  logs?: DailyLogEntry[],
  wakeUpHour?: number,
): DailyActionPlan {
  const wake = wakeUpHour ?? 6;
  const blocks = getDefaultBlocks(wake);

  if (logs && logs.length >= 7) {
    const { blocks: personalized, personalizedCount } = personalizeBlocks(blocks, logs);
    return { timeBlocks: personalized, personalizedCount };
  }

  return { timeBlocks: blocks, personalizedCount: 0 };
}
