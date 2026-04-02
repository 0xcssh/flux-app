// Dark masculine palette — primary theme
export const darkPalette = {
  primary: '#3B82F6',       // Electric blue
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',
  secondary: '#22C55E',     // Neon green (positive/success)
  secondaryLight: '#4ADE80',
  secondaryDark: '#16A34A',
  accent: '#F59E0B',        // Amber (alerts, streaks)
  accentLight: '#FBBF24',
  accentDark: '#D97706',
  background: '#0A0A0F',    // Deep black
  surface: '#1A1A2E',       // Dark card
  surfaceElevated: '#252540', // Elevated card
  surfaceVariant: '#16162A',
  text: '#FFFFFF',
  textSecondary: '#8B8BA3',
  textTertiary: '#5A5A7A',
  border: '#2A2A45',
  borderLight: '#1E1E38',
  error: '#EF4444',
  errorLight: '#7F1D1D',
  warning: '#F59E0B',
  warningLight: '#78350F',
  success: '#22C55E',
  successLight: '#064E3B',
  overlay: 'rgba(0, 0, 0, 0.8)',
  // Glow effects
  glowPrimary: 'rgba(59, 130, 246, 0.3)',
  glowSuccess: 'rgba(34, 197, 94, 0.3)',
  glowAccent: 'rgba(245, 158, 11, 0.3)',
  // Metric colors
  energy: '#F59E0B',
  mood: '#A78BFA',
  libido: '#EF4444',
  sleep: '#6366F1',
  stress: '#F97316',
  training: '#22C55E',
};

// Light palette kept for potential future use
export const lightPalette = darkPalette;

export type ColorPalette = typeof darkPalette;
