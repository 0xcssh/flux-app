export const fontFamilies = {
  mono: 'SpaceMono',
  regular: 'System',
  medium: 'System',
  bold: 'System',
} as const;

export const fontConfig = {
  SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
} as const;

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
  '4xl': 34,
} as const;

export const lineHeights = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 30,
  '3xl': 36,
  '4xl': 42,
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
