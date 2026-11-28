/**
 * UrbanShop — Design tokens
 * Preto predominante, branco para contraste e dourado apenas em detalhes.
 */

export const colors = {
  black: '#000000',
  ink: '#070707',
  surface: '#0F0F0F',
  surfaceRaised: '#151515',
  surfaceHover: '#1C1C1C',

  line: 'rgba(255,255,255,0.09)',
  lineStrong: 'rgba(255,255,255,0.2)',

  white: '#FFFFFF',
  text: '#F4F3EF',
  textMuted: 'rgba(244,243,239,0.64)',
  textDim: 'rgba(244,243,239,0.42)',

  gold: '#C8A75E',
  goldLight: '#E2C98F',
  goldDeep: '#8E7339',
  goldSoft: 'rgba(200,167,94,0.12)',
  goldLine: 'rgba(200,167,94,0.42)',

  danger: '#E5484D',
  success: '#4CC38A',

  overlay: 'rgba(0,0,0,0.55)',
} as const;

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
