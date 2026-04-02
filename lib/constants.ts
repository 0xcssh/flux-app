export const Colors = {
  primary: '#3B82F6',
  secondary: '#22C55E',
  accent: '#F59E0B',
  background: '#0A0A0F',
  surface: '#1A1A2E',
  surfaceElevated: '#252540',
  surfaceVariant: '#16162A',
  text: '#FFFFFF',
  textSecondary: '#8B8BA3',
  border: '#2A2A45',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',
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
