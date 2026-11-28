import { Link, type Href } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { useInteraction } from '../../motion/useInteraction';
import { fonts, radius } from '../../theme/tokens';
import { makeStyles, useColors } from '../../theme/ThemeProvider';
import type { Palette } from '../../theme/palettes';

type Variant = 'primary' | 'outline' | 'ghost' | 'gold';
type Size = 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  /** Quando informado, vira um link real (âncora no navegador). */
  href?: Href;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

type Pair = [string, string];

/** Cores [normal, hover] de cada variante, a partir do tema atual. */
const buttonPalette = (colors: Palette): Record<Variant, { bg: Pair; fg: Pair; border: Pair }> => ({
  primary: {
    bg: [colors.white, colors.gold],
    fg: [colors.black, colors.black],
    border: [colors.white, colors.gold],
  },
  gold: {
    bg: [colors.gold, colors.goldLight],
    fg: [colors.black, colors.black],
    border: [colors.gold, colors.goldLight],
  },
  outline: {
    bg: ['rgba(128,128,128,0)', colors.white],
    fg: [colors.white, colors.black],
    border: [colors.lineStrong, colors.white],
  },
  ghost: {
    bg: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'],
    fg: [colors.text, colors.gold],
    border: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'],
  },
});

/** Botão com microinterações: troca de cor no hover, escala ao pressionar e seta animada. */
export function Button({
  label,
  onPress,
  href,
  variant = 'primary',
  size = 'md',
  arrow = false,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const colors = useColors();
  const styles = useStyles();
  const { hover, pressStyle, handlers } = useInteraction();
  const p = buttonPalette(colors)[variant];
  const isGhost = variant === 'ghost';

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(hover.value, [0, 1], p.bg),
    borderColor: interpolateColor(hover.value, [0, 1], p.border),
  }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(hover.value, [0, 1], p.fg),
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(hover.value, [0, 1], [0, 5]) }],
  }));

  const inactive = disabled || loading;

  const pressable = (
    <Pressable
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      accessibilityRole={href ? 'link' : 'button'}
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityHint={accessibilityHint}
      {...handlers}
      // O <Link asChild> do Expo Router não aceita lista de estilos: precisa ser um objeto só.
      style={StyleSheet.flatten([fullWidth && styles.fullWidth, style])}
    >
      <Animated.View
        style={[
          styles.base,
          isGhost ? styles.ghost : size === 'lg' ? styles.lg : styles.md,
          containerStyle,
          pressStyle,
          inactive && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={p.fg[0]} />
        ) : (
          <View style={styles.row}>
            <Animated.Text style={[styles.label, size === 'lg' && styles.labelLg, labelStyle]}>
              {label}
            </Animated.Text>
            {arrow ? (
              <Animated.View style={arrowStyle}>
                <ArrowRight size={16} color={isGhost ? colors.gold : p.fg[0]} strokeWidth={2} />
              </Animated.View>
            ) : null}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );

  if (href && !inactive) {
    return (
      <Link href={href} asChild>
        {pressable}
      </Link>
    );
  }
  return pressable;
}

const useStyles = makeStyles(() => ({
  base: {
    borderWidth: 1,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  md: { height: 46, paddingHorizontal: 24 },
  lg: { height: 56, paddingHorizontal: 32 },
  ghost: { height: 40, paddingHorizontal: 0, borderWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  labelLg: { fontSize: 13.5, letterSpacing: 1.8 },
  disabled: { opacity: 0.45 },
  fullWidth: { alignSelf: 'stretch' },
}));
