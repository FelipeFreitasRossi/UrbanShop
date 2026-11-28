import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { makeStyles } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/tokens';

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'eyebrow'
  | 'bodyLg'
  | 'body'
  | 'small'
  | 'label'
  | 'caption'
  | 'price';

type Scale = { m: TextStyle; t: TextStyle; d: TextStyle };

const sizes: Record<TextVariant, Scale> = {
  display: {
    m: { fontSize: 46, lineHeight: 46, letterSpacing: -1 },
    t: { fontSize: 76, lineHeight: 72, letterSpacing: -2 },
    d: { fontSize: 112, lineHeight: 102, letterSpacing: -3 },
  },
  h1: {
    m: { fontSize: 34, lineHeight: 36, letterSpacing: -0.8 },
    t: { fontSize: 48, lineHeight: 50, letterSpacing: -1.2 },
    d: { fontSize: 64, lineHeight: 64, letterSpacing: -1.8 },
  },
  h2: {
    m: { fontSize: 28, lineHeight: 32, letterSpacing: -0.6 },
    t: { fontSize: 36, lineHeight: 40, letterSpacing: -0.8 },
    d: { fontSize: 46, lineHeight: 50, letterSpacing: -1.2 },
  },
  h3: {
    m: { fontSize: 20, lineHeight: 26 },
    t: { fontSize: 22, lineHeight: 28 },
    d: { fontSize: 24, lineHeight: 30 },
  },
  title: {
    m: { fontSize: 15, lineHeight: 21 },
    t: { fontSize: 16, lineHeight: 22 },
    d: { fontSize: 16, lineHeight: 22 },
  },
  eyebrow: {
    m: { fontSize: 11, lineHeight: 16 },
    t: { fontSize: 11, lineHeight: 16 },
    d: { fontSize: 12, lineHeight: 16 },
  },
  bodyLg: {
    m: { fontSize: 16, lineHeight: 26 },
    t: { fontSize: 17, lineHeight: 28 },
    d: { fontSize: 18, lineHeight: 30 },
  },
  body: {
    m: { fontSize: 15, lineHeight: 24 },
    t: { fontSize: 15, lineHeight: 24 },
    d: { fontSize: 15, lineHeight: 25 },
  },
  small: {
    m: { fontSize: 13, lineHeight: 20 },
    t: { fontSize: 13, lineHeight: 20 },
    d: { fontSize: 13, lineHeight: 20 },
  },
  label: {
    m: { fontSize: 12, lineHeight: 16 },
    t: { fontSize: 12, lineHeight: 16 },
    d: { fontSize: 12, lineHeight: 16 },
  },
  caption: {
    m: { fontSize: 11, lineHeight: 16 },
    t: { fontSize: 11, lineHeight: 16 },
    d: { fontSize: 11, lineHeight: 16 },
  },
  price: {
    m: { fontSize: 15, lineHeight: 20 },
    t: { fontSize: 15, lineHeight: 20 },
    d: { fontSize: 16, lineHeight: 22 },
  },
};

const useBase = makeStyles((colors) => ({
  display: { fontFamily: fonts.display, color: colors.text, textTransform: 'uppercase' },
  h1: { fontFamily: fonts.heading, color: colors.text },
  h2: { fontFamily: fonts.heading, color: colors.text },
  h3: { fontFamily: fonts.headingBold, color: colors.text },
  title: { fontFamily: fonts.bodySemiBold, color: colors.text },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  bodyLg: { fontFamily: fonts.body, color: colors.textMuted },
  body: { fontFamily: fonts.body, color: colors.textMuted },
  small: { fontFamily: fonts.body, color: colors.textMuted },
  label: {
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  caption: { fontFamily: fonts.bodyMedium, color: colors.textDim, letterSpacing: 0.4 },
  price: { fontFamily: fonts.bodyBold, color: colors.text },
}));

export type UTextProps = TextProps & {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
};

/** Texto tipográfico da UrbanShop, com tamanhos responsivos por variante. */
export function UText({ variant = 'body', color, align, style, ...rest }: UTextProps) {
  const { bp } = useBreakpoint();
  const base = useBase();
  const key = bp === 'desktop' ? 'd' : bp === 'tablet' ? 't' : 'm';
  const bigHeading = variant === 'display' || variant === 'h1' || variant === 'h2';

  return (
    <Text
      maxFontSizeMultiplier={bigHeading ? 1.2 : 1.6}
      {...rest}
      style={[
        base[variant],
        sizes[variant][key],
        color ? { color } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
