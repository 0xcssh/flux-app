// Supabase Edge Function: classify-task
// Receives a task title in any language and returns the predicted category
// + suggested time slot based on phase preferences.
//
// Auth: requires user JWT (from Supabase Auth) to prevent anonymous abuse.
// Rate limiting: 50 classifications per user per day, enforced via RPC.
//
// Anthropic API key is stored as a Supabase secret (ANTHROPIC_API_KEY),
// never exposed to the client.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_KEY');
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const MAX_TITLE_LENGTH = 200;
const DAILY_LIMIT = 50;

type Category =
  | 'deep_work'
  | 'creative'
  | 'admin'
  | 'physical'
  | 'strategic'
  | 'social'
  | 'recovery';

const ALL_CATEGORIES: Category[] = [
  'deep_work',
  'creative',
  'admin',
  'physical',
  'strategic',
  'social',
  'recovery',
];

const CLASSIFICATION_PROMPT = `You classify productivity tasks into exactly one category. The task title may be in any language (English, French, Spanish, Italian, German, Portuguese, Dutch).

Categories:
- deep_work: focused single-person work requiring concentration (coding, writing reports, analysis, research)
- creative: ideation, design, brainstorming, prototyping, sketching, drafting concepts
- admin: low-cognitive routine work (emails, paperwork, invoices, file organizing, scheduling)
- physical: exercise, workouts, sports, walking, gym sessions
- strategic: high-stakes decisions, planning, negotiations, roadmapping, OKRs
- social: meetings, calls, presentations, networking, interviews, dinners
- recovery: rest, reading for pleasure, meditation, journaling, reflection

Respond with ONLY the category name. No explanation, no punctuation, no quotes.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function fallbackKeywordClassify(title: string): Category {
  const lower = title.toLowerCase();
  const matches: Record<Category, string[]> = {
    deep_work: ['code', 'develop', 'analyze', 'report', 'research', 'study', 'write', 'debug', 'implement'],
    creative: ['design', 'sketch', 'brainstorm', 'prototype', 'ideate', 'mockup', 'illustration'],
    admin: ['email', 'reply', 'invoice', 'expense', 'paperwork', 'organize', 'file', 'mail'],
    physical: ['gym', 'workout', 'run', 'lift', 'training', 'exercise', 'walk', 'sport'],
    strategic: ['decision', 'negotiate', 'strategy', 'roadmap', 'goal', 'okr', 'review'],
    social: ['meeting', 'call', 'lunch', 'dinner', 'chat', 'interview', 'present', 'pitch'],
    recovery: ['read', 'meditate', 'rest', 'nap', 'journal', 'reflect'],
  };
  let best: Category = 'deep_work';
  let bestScore = 0;
  for (const cat of ALL_CATEGORIES) {
    const score = matches[cat].filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  }
  return best;
}

async function classifyWithAnthropic(title: string): Promise<Category | null> {
  if (!ANTHROPIC_API_KEY) return null;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 16,
        system: CLASSIFICATION_PROMPT,
        messages: [{ role: 'user', content: title }],
      }),
    });

    if (!response.ok) {
      console.error('[classify-task] Anthropic error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const text: string = data?.content?.[0]?.text?.trim().toLowerCase() ?? '';
    const cleaned = text.replace(/[^a-z_]/g, '');
    if (ALL_CATEGORIES.includes(cleaned as Category)) {
      return cleaned as Category;
    }
    console.warn('[classify-task] Unexpected Anthropic response:', text);
    return null;
  } catch (e) {
    console.error('[classify-task] Anthropic call failed:', e);
    return null;
  }
}

async function checkAndIncrementRateLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('classify_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (error) {
    console.warn('[classify-task] Rate limit check error (allowing):', error.message);
    return true;
  }

  const currentCount = data?.count ?? 0;
  if (currentCount >= DAILY_LIMIT) return false;

  await supabase.from('classify_usage').upsert(
    { user_id: userId, date: today, count: currentCount + 1 },
    { onConflict: 'user_id,date' },
  );
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const allowed = await checkAndIncrementRateLimit(supabase, userData.user.id);
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Daily quota exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const body = await req.json();
    const rawTitle: unknown = body?.title;
    if (typeof rawTitle !== 'string' || rawTitle.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Missing title' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }
    const title = rawTitle.trim().slice(0, MAX_TITLE_LENGTH);

    let category = await classifyWithAnthropic(title);
    let source: 'llm' | 'fallback' = 'llm';
    if (!category) {
      category = fallbackKeywordClassify(title);
      source = 'fallback';
    }

    return new Response(
      JSON.stringify({ category, source }),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } },
    );
  } catch (e) {
    console.error('[classify-task] Unexpected error:', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});
