import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { durations } from '../theme/tokens';
import { easeOutExpo } from './easing';
import { usePageScroll } from './PageScroll';

export type RevealVariant = 'fade' | 'up' | 'down' | 'left' | 'right' | 'zoom';

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

/**
 * Reveal on Scroll: o conteúdo aparece quando entra na área visível.
 * Respeita "reduzir movimento" (aparece direto, sem deslocamento).
 */
export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  duration = durations.reveal,
  distance = 32,
  threshold = 0.9,
  style,
}: RevealProps) {
  const { subscribe, reduceMotion, active } = usePageScroll();
  const skip = reduceMotion || !active;

  const ref = useRef<View>(null);
  const revealed = useRef(skip);
  const shown = useSharedValue(skip ? 1 : 0);
  const unsubscribe = useRef<() => void>(() => {});

  const check = useCallback(() => {
    if (revealed.current) return;
    const node = ref.current;
    if (!node) return;
    node.measureInWindow((_x, y, w, h) => {
      if (revealed.current) return;
      if (w === 0 && h === 0) return; // ainda não posicionado
      const vh = Dimensions.get('window').height;
      if (y < vh * threshold && y + h > 0) {
        revealed.current = true;
        unsubscribe.current();
        shown.set(withDelay(delay, withTiming(1, { duration, easing: easeOutExpo })));
      }
    });
  }, [delay, duration, threshold, shown]);

  useEffect(() => {
    if (revealed.current) return;
    unsubscribe.current = subscribe(check);
    const t = setTimeout(check, 60);
    return () => {
      clearTimeout(t);
      unsubscribe.current();
    };
  }, [subscribe, check]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = shown.value;
    const d = interpolate(p, [0, 1], [distance, 0]);
    switch (variant) {
      case 'fade':
        return { opacity: p };
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

  return (
    <View ref={ref} collapsable={false} onLayout={check} style={style}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </View>
  );
}
