import { Heart } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { measureRect, useFly } from '../../motion/FlyLayer';
import { useRequireAuth } from '../../state/authPrompt';
import { useFavorites, type FavoriteItem } from '../../state/favorites';
import { onDark } from '../../theme/palettes';
import { makeStyles, useColors } from '../../theme/ThemeProvider';

type HeartButtonProps = {
  product: FavoriteItem;
  /** "overlay": círculo escuro sobre a foto. "plain": só o ícone. */
  variant?: 'overlay' | 'plain';
  size?: number;
};

const PARTICLES = 8;

/**
 * Animated Wishlist: ao curtir, o coração pulsa, solta partículas douradas
 * e um coração voa até o ícone de favoritos. Exige cadastro.
 */
export function HeartButton({ product, variant = 'overlay', size = 18 }: HeartButtonProps) {
  const styles = useStyles();
  const colors = useColors();
  const favorites = useFavorites();
  const requireAuth = useRequireAuth();
  const fly = useFly();
  const reduce = useReducedMotion();
  const ref = useRef<View>(null);

  const fav = favorites.isFavorite(product.id);
  const pop = useSharedValue(0);
  const burst = useSharedValue(0);

  const onPress = () =>
    requireAuth('like', async () => {
      const liked = favorites.toggle(product);
      if (reduce) return;
      if (liked) {
        pop.set(withSequence(withSpring(1, { damping: 5, stiffness: 500 }), withSpring(0, { damping: 10 })));
        burst.set(0);
        burst.set(withTiming(1, { duration: 650 }));
        fly('wishlist', await measureRect(ref.current), { kind: 'heart' });
      } else {
        pop.set(withSequence(withTiming(-0.4, { duration: 90 }), withSpring(0)));
      }
    });

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pop.value * 0.45 }],
  }));

  const color = fav ? colors.gold : variant === 'overlay' ? onDark.white : colors.text;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={fav ? `Remover ${product.name} dos favoritos` : `Curtir ${product.name}`}
      accessibilityState={{ selected: fav }}
      hitSlop={8}
      style={variant === 'overlay' ? styles.overlay : styles.plain}
    >
      <View ref={ref} collapsable={false} style={styles.center}>
        {Array.from({ length: PARTICLES }, (_, i) => (
          <Particle key={i} index={i} burst={burst} color={colors.gold} />
        ))}
        <Animated.View style={iconStyle}>
          <Heart size={size} color={color} fill={fav ? colors.gold : 'transparent'} strokeWidth={1.8} />
        </Animated.View>
      </View>
    </Pressable>
  );
}

function Particle({ index, burst, color }: { index: number; burst: SharedValue<number>; color: string }) {
  const styles = useStyles();
  const angle = (index / PARTICLES) * Math.PI * 2;
  const style = useAnimatedStyle(() => {
    const d = interpolate(burst.value, [0, 1], [4, 22]);
    return {
      opacity: burst.value > 0 && burst.value < 1 ? interpolate(burst.value, [0, 0.2, 1], [0, 1, 0]) : 0,
      transform: [
        { translateX: Math.cos(angle) * d },
        { translateY: Math.sin(angle) * d },
        { scale: interpolate(burst.value, [0, 1], [1, 0.3]) },
      ],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.particle, { backgroundColor: color }, style]} />;
}

const useStyles = makeStyles(() => ({
  overlay: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  plain: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute', width: 5, height: 5, borderRadius: 3 },
}));
