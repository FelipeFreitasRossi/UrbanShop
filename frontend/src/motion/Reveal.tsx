import React, { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { durations } from '../theme/tokens';
import { easeOutExpo } from './easing';
import { usePageScroll } from './PageScroll';
import { useContentPosition } from './useContentPosition';

export type RevealVariant = 'fade' | 'up' | 'down' | 'left' | 'right' | 'zoom';

/**
 * Progresso 0 → 1 de um elemento quando ele entra na área visível.
 * A verificação roda na UI thread (sem custo de JavaScript durante a rolagem).
 * Com "reduzir movimento" (ou fora de uma página), começa em 1.
 */
export function useRevealProgress({
  delay = 0,
  duration = durations.reveal,
  threshold = 0.92,
}: { delay?: number; duration?: number; threshold?: number } = {}) {
  const { scrollY, viewportH, reduceMotion, active } = usePageScroll();
  const skip = reduceMotion || !active;
  const { ref, top, measure } = useContentPosition(!skip);
  const progress = useSharedValue(skip ? 1 : 0);
  const done = useSharedValue(skip ? 1 : 0);

  useAnimatedReaction(
    () => top.value >= 0 && viewportH.value > 0 && scrollY.value + viewportH.value * threshold > top.value,
    (visible) => {
      if (visible && done.get() === 0) {
        done.set(1);
        progress.set(withDelay(delay, withTiming(1, { duration, easing: easeOutExpo })));
      }
    },
  );

  // Segurança: se a medição falhar, o conteúdo aparece mesmo assim.
  useEffect(() => {
    if (skip) return;
    const t = setTimeout(() => {
      if (top.get() < 0 && done.get() === 0) {
        done.set(1);
        progress.set(withTiming(1, { duration: 300 }));
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [skip, top, done, progress]);

  return { ref, onLayout: skip ? undefined : measure, progress, skip };
}

type RevealProps = {
  children: React.ReactNode;
  variant?: RevealVariant;
  /** Atraso em ms. Para efeito "stagger", use index * 80. */
  delay?: number;
  duration?: number;
  /** Distância do deslocamento inicial em px. */
  distance?: number;
  /** Fração da altura da tela em que o elemento começa a aparecer (0–1). */
  threshold?: number;
  style?: StyleProp<ViewStyle>;
};

/** Reveal on Scroll: o conteúdo aparece quando entra na área visível. */
export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  duration = durations.reveal,
  distance = 28,
  threshold = 0.92,
  style,
}: RevealProps) {
  const { ref, onLayout, progress, skip } = useRevealProgress({ delay, duration, threshold });

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const d = (1 - p) * distance;
    switch (variant) {
      case 'up':
        return { opacity: p, transform: [{ translateY: d }] };
      case 'down':
        return { opacity: p, transform: [{ translateY: -d }] };
      case 'left':
        return { opacity: p, transform: [{ translateX: d }] };
      case 'right':
        return { opacity: p, transform: [{ translateX: -d }] };
      case 'zoom':
        return { opacity: p, transform: [{ scale: interpolate(p, [0, 1], [0.94, 1]) }] };
      default:
        return { opacity: p };
    }
  });

  if (skip) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View ref={ref} collapsable={false} onLayout={onLayout} style={style}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </View>
  );
}
