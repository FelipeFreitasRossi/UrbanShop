import { Image, type ImageContentFit } from 'expo-image';
import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { colors } from '../theme/tokens';
import { easeOutExpo } from './easing';
import { usePageScroll } from './PageScroll';

type ParallaxImageProps = {
  uri: string;
  /** Deslocamento máximo em px durante a rolagem (parallax). */
  strength?: number;
  /** Zoom extra aplicado quando o elemento entra na tela (zoom on scroll). */
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
 * A imagem é um pouco maior que o quadro para o movimento não mostrar bordas.
 */
export function ParallaxImage({
  uri,
  strength = 36,
  zoom = 0.08,
  hover,
  reveal = true,
  contentFit = 'cover',
  accessibilityLabel,
  style,
  children,
  priority = 'normal',
}: ParallaxImageProps) {
  const { subscribe, reduceMotion, active } = usePageScroll();
  const still = reduceMotion || !active;

  const ref = useRef<View>(null);
  /** 0 = entrando por baixo, 1 = saindo por cima. */
  const pos = useSharedValue(0.5);
  const shown = useSharedValue(still || !reveal ? 1 : 0);
  const revealed = useRef(still || !reveal);

  const update = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.measureInWindow((_x, y, _w, h) => {
      if (h === 0) return;
      const vh = Dimensions.get('window').height;
      const p = Math.min(1, Math.max(0, (vh - y) / (vh + h)));
      pos.set(p);
      if (!revealed.current && y < vh * 0.95 && y + h > 0) {
        revealed.current = true;
        shown.set(withDelay(60, withTiming(1, { duration: 1200, easing: easeOutExpo })));
      }
    });
  }, [pos, shown]);

  useEffect(() => {
    if (still) return;
    const unsub = subscribe(update);
    const t = setTimeout(update, 60);
    return () => {
      clearTimeout(t);
      unsub();
    };
  }, [still, subscribe, update]);

  const imageStyle = useAnimatedStyle(() => {
    const h = hover ? hover.value : 0;
    if (still) {
      return { transform: [{ scale: 1 + h * 0.05 }] };
    }
    const translateY = interpolate(pos.value, [0, 1], [-strength, strength]);
    const scrollZoom = interpolate(pos.value, [0, 0.5, 1], [zoom, 0, zoom * 0.5]);
    const revealZoom = interpolate(shown.value, [0, 1], [0.14, 0]);
    return {
      opacity: interpolate(shown.value, [0, 1], [0, 1]),
      transform: [{ translateY }, { scale: 1 + scrollZoom + revealZoom + h * 0.05 }],
    };
  });

  return (
    <View
      ref={ref}
      collapsable={false}
      onLayout={still ? undefined : update}
      style={[styles.frame, style]}
    >
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
          transition={400}
          cachePolicy="memory-disk"
          priority={priority}
          accessibilityLabel={accessibilityLabel}
          accessible={!!accessibilityLabel}
        />
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
});
