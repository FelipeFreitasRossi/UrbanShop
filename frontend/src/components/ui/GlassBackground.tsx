import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type GlassBackgroundProps = {
  /** Opacidade da cor de fundo por cima do desfoque (0–1). */
  tint?: number;
  intensity?: number;
};

/**
 * Fundo translúcido com desfoque (blur), preto no tema escuro e claro no tema claro.
 * No Android o desfoque em tempo real pesa muito, então usamos uma cor quase
 * sólida — visualmente parecida e bem mais leve.
 */
export function GlassBackground({ tint = 0.62, intensity = 40 }: GlassBackgroundProps) {
  const { colors, scheme } = useTheme();

  if (Platform.OS === 'android') {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(${colors.glassRgb},0.94)` }]} />;
  }
  return (
    <>
      <BlurView
        intensity={intensity}
        tint={scheme === 'light' ? 'light' : 'dark'}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(${colors.glassRgb},${tint})` }]} />
    </>
  );
}
