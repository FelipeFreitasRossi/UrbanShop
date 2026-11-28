import { useCallback } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { easeOutQuart } from './easing';

/**
 * Estado animado de hover (desktop) e pressionado (toque/clique) para
 * microinterações. Use os handlers em um Pressable.
 */
export function useInteraction(pressScale = 0.97) {
  const hover = useSharedValue(0);
  const press = useSharedValue(0);

  const onHoverIn = useCallback(() => {
    hover.set(withTiming(1, { duration: 260, easing: easeOutQuart }));
  }, [hover]);
  const onHoverOut = useCallback(() => {
    hover.set(withTiming(0, { duration: 320, easing: easeOutQuart }));
  }, [hover]);
  const onPressIn = useCallback(() => {
    press.set(withSpring(1, { damping: 20, stiffness: 400 }));
  }, [press]);
  const onPressOut = useCallback(() => {
    press.set(withSpring(0, { damping: 16, stiffness: 260 }));
  }, [press]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * (1 - pressScale) }],
  }));

  return {
    hover,
    press,
    pressStyle,
    handlers: { onHoverIn, onHoverOut, onPressIn, onPressOut },
  };
}
