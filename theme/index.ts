import { lightPalette, darkPalette, type ColorPalette } from './colors';
import { fontFamilies, fontSizes, lineHeights, fontWeights, fontConfig } from './fonts';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  h1: {
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights['4xl'],
    fontWeight: fontWeights.bold,
  },
  h2: {
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights['3xl'],
    fontWeight: fontWeights.bold,
  },
  h3: {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights['2xl'],
    fontWeight: fontWeights.semibold,
  },
  body: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.regular,
  },
  bodySmall: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: fontWeights.regular,
  },
  caption: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.regular,
  },
  label: {
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: fontWeights.medium,
  },
} as const;

export interface Theme {
  colors: ColorPalette;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  fonts: typeof fontFamilies;
}

export const lightTheme: Theme = {
  colors: lightPalette,
  spacing,
  borderRadius,
  typography,
  fonts: fontFamilies,
};

export const darkTheme: Theme = {
  colors: darkPalette,
  spacing,
  borderRadius,
  typography,
  fonts: fontFamilies,
};

export { lightPalette, darkPalette, fontFamilies, fontSizes, lineHeights, fontWeights, fontConfig };
export type { ColorPalette };
