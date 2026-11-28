import { Image, type ImageContentFit } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { easeOutExpo } from './easing';
import { usePageScroll } from './PageScroll';
import { useContentPosition } from './useContentPosition';
import { makeStyles } from '../theme/ThemeProvider';

type ParallaxImageProps = {
  uri: string;
  /** Deslocamento máximo em px durante a rolagem (parallax). */
  strength?: number;
  /** Zoom extra aplicado nas bordas da tela (zoom on scroll). */
  zoom?: number;
  /** Valor 0–1 de hover do card pai, para zoom no desktop. */
  hover?: SharedValue<number>;
  /** Revela a imagem com fade + zoom-out ao aparecer. */
  reveal?: boolean;
  contentFit?: ImageContentFit;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  priority?: 'low' | 'normal' | 'high';
};

/**
 * Imagem com Parallax, Zoom on Scroll, Image Reveal e zoom no hover.
 * Todo o movimento é calculado na UI thread a partir da posição de rolagem.
 */
export function ParallaxImage({
  uri,
  strength = 32,
  zoom = 0.08,
  hover,
  reveal = true,
  contentFit = 'cover',
  accessibilityLabel,
  style,
  children,
  priority = 'normal',
}: ParallaxImageProps) {
  const styles = useStyles();
  const { scrollY, viewportH, reduceMotion, active } = usePageScroll();
  const still = reduceMotion || !active;
  const { ref, top, height, measure } = useContentPosition(!still);
  const shown = useSharedValue(still || !reveal ? 1 : 0);

  useAnimatedReaction(
    () => top.value >= 0 && viewportH.value > 0 && scrollY.value + viewportH.value * 0.95 > top.value,
    (visible) => {
      if (visible && shown.get() === 0) {
        shown.set(withTiming(1, { duration: 1100, easing: easeOutExpo }));
      }
    },
  );

  // Segurança: se a medição falhar, a imagem aparece mesmo assim.
  useEffect(() => {
    if (still) return;
    const t = setTimeout(() => {
      if (top.get() < 0 && shown.get() === 0) shown.set(withTiming(1, { duration: 300 }));
    }, 2500);
    return () => clearTimeout(t);
  }, [still, top, shown]);

  const imageStyle = useAnimatedStyle(() => {
    const h = hover ? hover.value : 0;
    if (still || top.value < 0) {
      return { opacity: shown.value, transform: [{ scale: 1 + h * 0.05 }] };
    }
    const vh = viewportH.value;
    // 0 = entrando por baixo da tela, 1 = saindo por cima.
    const p = interpolate(
      scrollY.value + vh - top.value,
      [0, vh + height.value],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(p, [0, 1], [-strength, strength]);
    const scrollZoom = interpolate(p, [0, 0.5, 1], [zoom, 0, zoom * 0.5]);
    const revealZoom = (1 - shown.value) * 0.12;
    return {
      opacity: shown.value,
      transform: [{ translateY }, { scale: 1 + scrollZoom + revealZoom + h * 0.05 }],
    };
  });

  return (
    <View ref={ref} collapsable={false} onLayout={still ? undefined : measure} style={[styles.frame, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { top: still ? 0 : -strength, bottom: still ? 0 : -strength },
          imageStyle,
        ]}
      >
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          transition={300}
          cachePolicy="memory-disk"
          priority={priority}
          recyclingKey={uri}
          accessibilityLabel={accessibilityLabel}
          accessible={!!accessibilityLabel}
        />
      </Animated.View>
      {children}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  frame: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
}));
