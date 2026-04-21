// ── Types ──────────────────────────────────────────────────────────────

export type ProfileType = 'early_riser' | 'night_owl' | 'balanced';
export type GoalType = 'energy' | 'performance' | 'mood' | 'sleep';

export interface QuizAnswers {
  age: number;
  wakeUpHour: number;
  activityLevel: number;
  sleepQuality: number;
  goal: GoalType;
}

export interface HormonalProfile {
  profileType: ProfileType;
  wakeUpHour: number; // 5-11
  activityLevel: number; // 1-5
  sleepQuality: number; // 1-5
  goal: GoalType;
  age: number;
  adjustedAcrophase: number; // shifted peak hour
  peakWindowStart: number; // hour
  peakWindowEnd: number; // hour
}

// ── Profile descriptions ──────────────────────────────────────────────

export const PROFILE_DESCRIPTIONS: Record<ProfileType, string> = {
  early_riser:
    'Your hormones peak early. You are built for morning productivity and evening rest.',
  night_owl:
    'Your cycle is shifted later. Your peak performance comes mid-morning to early afternoon.',
  balanced:
    'You follow the classic hormonal rhythm. Mornings are your power zone.',
};

// ── Compute profile ───────────────────────────────────────────────────

export function computeProfile(answers: QuizAnswers): HormonalProfile {
  let profileType: ProfileType;

  if (answers.wakeUpHour < 7) {
    profileType = 'early_riser';
  } else if (answers.wakeUpHour > 9) {
    profileType = 'night_owl';
  } else {
    profileType = 'balanced';
  }

  const adjustedAcrophase = answers.wakeUpHour + 0.5;
  const peakWindowStart = answers.wakeUpHour + 4;
  const peakWindowEnd = answers.wakeUpHour + 8;

  return {
    profileType,
    wakeUpHour: answers.wakeUpHour,
    activityLevel: answers.activityLevel,
    sleepQuality: answers.sleepQuality,
    goal: answers.goal,
    age: answers.age,
    adjustedAcrophase,
    peakWindowStart,
    peakWindowEnd,
  };
}
