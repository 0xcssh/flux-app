export interface DailyLogEntry {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  energy: number; // 1-10
  mood: number; // 1-10
  libido: number; // 1-10
  sleep_quality: number; // 1-10
  stress: number; // 1-10
  training: number; // 1-10
  notes?: string;
  nofap_checked: boolean;
  vitality_score: number; // 0-100
  log_time: string; // ISO timestamp
  synced: boolean;
  created_at: string;
  updated_at: string;
}

export type MetricKey =
  | 'energy'
  | 'mood'
  | 'libido'
  | 'sleep_quality'
  | 'stress'
  | 'training';

export type PhaseType = 'rise' | 'peak' | 'decline' | 'recovery';

export interface LogFormData {
  energy: number;
  mood: number;
  libido: number;
  sleep_quality: number;
  stress: number;
  training: number;
  notes: string;
  nofap_checked: boolean;
}
