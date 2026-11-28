/**
 * UrbanShop — Design tokens
 * Preto predominante, branco para contraste e dourado apenas em detalhes.
 */

// As cores ficam em ./palettes.ts (tema escuro e claro) e são lidas com useColors().

export const fonts = {
  display: 'Archivo_900Black',
  heading: 'Archivo_800ExtraBold',
  headingBold: 'Archivo_700Bold',
  headingLight: 'Archivo_300Light',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemiBold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  huge: 96,
} as const;

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 14,
  xl: 22,
  pill: 999,
} as const;

/** Larguras mínimas de cada faixa. */
export const breakpoints = {
  tablet: 768,
  desktop: 1100,
  wide: 1440,
} as const;

export const layout = {
  maxWidth: 1360,
  headerHeightDesktop: 76,
  headerHeightMobile: 60,
  bottomNavHeight: 64,
} as const;

export const durations = {
  fast: 180,
  base: 320,
  slow: 650,
  reveal: 850,
} as const;
