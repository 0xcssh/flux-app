export const Colors = {
  primary: '#2563EB',
  secondary: '#10B981',
  accent: '#0D9488',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
} as const;

export const FREE_HISTORY_DAYS = 7;
export const PREMIUM_TRIAL_DAYS = 7;

export const SliderConfig = {
  min: 1,
  max: 10,
  step: 1,
} as const;

export const MetricKeys = [
  'energy',
  'mood',
  'libido',
  'sleep_quality',
  'stress',
  'training',
] as const;

export type MetricKey = (typeof MetricKeys)[number];
