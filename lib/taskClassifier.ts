import { supabase } from '@/lib/supabase';

export type TaskCategory =
  | 'deep_work'
  | 'creative'
  | 'admin'
  | 'physical'
  | 'strategic'
  | 'social'
  | 'recovery';

export type CategoryPhase = 'rise' | 'peak' | 'dip' | 'recovery';

export const CATEGORY_PHASES: Record<TaskCategory, CategoryPhase[]> = {
  deep_work: ['peak'],
  strategic: ['peak'],
  creative: ['rise', 'recovery'],
  physical: ['rise', 'peak'],
  social: ['rise', 'peak'],
  admin: ['dip'],
  recovery: ['recovery'],
};

interface ClassifyResponse {
  category: TaskCategory;
  source: 'llm' | 'fallback' | 'local';
}

const LOCAL_KEYWORDS: Record<TaskCategory, string[]> = {
  deep_work: ['code', 'develop', 'analyze', 'analyse', 'report', 'research', 'study', 'write', 'debug', 'implement', 'écrire', 'développer', 'analyser', 'coder', 'rédiger'],
  creative: ['design', 'sketch', 'brainstorm', 'prototype', 'ideate', 'mockup', 'créer', 'dessiner', 'maquette'],
  admin: ['email', 'reply', 'invoice', 'expense', 'paperwork', 'organize', 'mail', 'répondre', 'facture', 'classer', 'ranger'],
  physical: ['gym', 'workout', 'run', 'lift', 'training', 'exercise', 'walk', 'sport', 'muscu', 'courir', 'marcher', 'sport'],
  strategic: ['decision', 'negotiate', 'strategy', 'roadmap', 'goal', 'okr', 'décision', 'stratégie', 'négocier'],
  social: ['meeting', 'call', 'lunch', 'dinner', 'chat', 'interview', 'present', 'pitch', 'réunion', 'appel', 'présenter'],
  recovery: ['read', 'meditate', 'rest', 'nap', 'journal', 'reflect', 'lire', 'méditer', 'reposer'],
};

const ALL_CATEGORIES: TaskCategory[] = Object.keys(LOCAL_KEYWORDS) as TaskCategory[];

export function classifyLocally(title: string): { category: TaskCategory; confidence: number } {
  const lower = title.toLowerCase();
  let best: TaskCategory = 'deep_work';
  let bestScore = 0;
  for (const cat of ALL_CATEGORIES) {
    const score = LOCAL_KEYWORDS[cat].filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  }
  return { category: best, confidence: bestScore };
}

export async function classifyTask(title: string): Promise<ClassifyResponse> {
  const local = classifyLocally(title);
  if (local.confidence > 0) {
    return { category: local.category, source: 'local' };
  }

  if (!supabase) {
    return { category: 'deep_work', source: 'fallback' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('classify-task', {
      body: { title },
    });

    if (error || !data?.category) {
      console.warn('[taskClassifier] Edge function failed, using fallback:', error?.message);
      return { category: 'deep_work', source: 'fallback' };
    }

    return { category: data.category, source: data.source ?? 'llm' };
  } catch (e) {
    console.warn('[taskClassifier] Network error, using fallback:', e);
    return { category: 'deep_work', source: 'fallback' };
  }
}

export function suggestHourForCategory(
  category: TaskCategory,
  wakeUpHour: number,
): number {
  const phases = CATEGORY_PHASES[category];
  const primaryPhase = phases[0];
  const phaseHourMap: Record<CategoryPhase, number> = {
    rise: wakeUpHour + 1,
    peak: wakeUpHour + 4,
    dip: wakeUpHour + 7,
    recovery: Math.max(wakeUpHour + 13, 20),
  };
  const hour = phaseHourMap[primaryPhase];
  return Math.min(23, Math.max(0, hour));
}
