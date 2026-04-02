export interface NoFapStreak {
  id: string;
  user_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string | null; // null if active
  streak_days: number;
  is_active: boolean;
}

export interface NoFapMilestone {
  days: number;
  title_key: string;
  achieved: boolean;
  achieved_date: string | null;
}

export const MILESTONE_DAYS = [7, 14, 30, 60, 90] as const;
