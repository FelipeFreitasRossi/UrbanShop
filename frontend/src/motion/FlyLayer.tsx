import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useColors } from '../theme/ThemeProvider';

/**
 * Animação "voar até o destino":
 * - Add to Cart: a foto do produto voa até o ícone da sacola.
 * - Wishlist: um coração voa até o ícone de favoritos.
 * O ícone de destino dá um "pulo" quando a peça chega.
 */
export type FlyTargetName = 'cart' | 'wishlist';
export type Rect = { x: number; y: number; width: number; height: number };
type Visual = { kind: 'image'; uri?: string } | { kind: 'heart' };

type Target = { ref: React.RefObject<View | null>; priority: number; bump: () => void };

type FlyContextValue = {
  /** Registra um ícone de destino. Retorna a função para remover o registro. */
  register: (name: FlyTargetName, target: Target) => () => void;
  /** Faz a peça voar de `from` até o destino registrado com maior prioridade. */
  fly: (name: FlyTargetName, from: Rect | null, visual: Visual) => void;
};

type Flight = { id: number; from: Rect; to: Rect; visual: Visual; onArrive: () => void };

const FlyContext = createContext<FlyContextValue | null>(null);
const DURATION = 700;

export function FlyProvider({ children }: { children: React.ReactNode }) {
  const targets = useRef(new Map<FlyTargetName, Set<Target>>());
  const [flights, setFlights] = useState<Flight[]>([]);
  const nextId = useRef(1);
  const reduce = useReducedMotion();

  const register = useCallback((name: FlyTargetName, target: Target) => {
    const set = targets.current.get(name) ?? new Set<Target>();
    set.add(target);
    targets.current.set(name, set);
    return () => {
      set.delete(target);
    };
  }, []);

  const fly = useCallback(
    (name: FlyTargetName, from: Rect | null, visual: Visual) => {
      const candidates = [...(targets.current.get(name) ?? [])].sort((a, b) => b.priority - a.priority);
      const target = candidates[0];
      if (!target) return;
      if (reduce || !from) {
        target.bump();
        return;
      }
      target.ref.current?.measureInWindow((x, y, width, height) => {
        if (!width && !height) {
          target.bump();
          return;
        }
        const id = nextId.current++;
        setFlights((prev) => [
          ...prev,
          { id, from, to: { x, y, width, height }, visual, onArrive: target.bump },
        ]);
        setTimeout(() => setFlights((prev) => prev.filter((f) => f.id !== id)), DURATION + 50);
      });
    },
    [reduce],
  );

  const value = useMemo(() => ({ register, fly }), [register, fly]);

  return (
    <FlyContext.Provider value={value}>
      {children}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {flights.map((f) => (
          <FlightView key={f.id} flight={f} />
        ))}
      </View>
    </FlyContext.Provider>
  );
}

function FlightView({ flight }: { flight: Flight }) {
  const colors = useColors();
  const p = useSharedValue(0);
  const size = flight.visual.kind === 'heart' ? 34 : Math.min(84, Math.max(flight.from.width, 56));
  const startX = flight.from.x + flight.from.width / 2 - size / 2;
  const startY = flight.from.y + flight.from.height / 2 - size / 2;
  const endX = flight.to.x + flight.to.width / 2 - size / 2;
  const endY = flight.to.y + flight.to.height / 2 - size / 2;

  useEffect(() => {
    p.set(withTiming(1, { duration: DURATION, easing: Easing.bezier(0.5, 0, 0.2, 1) }));
    const t = setTimeout(flight.onArrive, DURATION - 40);
    return () => clearTimeout(t);
  }, [p, flight.onArrive]);

  const style = useAnimatedStyle(() => {
    const t = p.value;
    // Trajetória em arco: sobe um pouco antes de descer até o destino.
    const arc = Math.sin(t * Math.PI) * -90;
    return {
      opacity: interpolate(t, [0, 0.1, 0.85, 1], [0, 1, 1, 0]),
      transform: [
        { translateX: startX + (endX - startX) * t },
        { translateY: startY + (endY - startY) * t + arc },
        { scale: interpolate(t, [0, 0.2, 1], [0.6, 1, 0.3]) },
        { rotate: `${interpolate(t, [0, 1], [0, flight.visual.kind === 'heart' ? -12 : 18])}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.flight, { width: size, height: size }, style]}>
      {flight.visual.kind === 'heart' ? (
        <Heart size={size} color={colors.gold} fill={colors.gold} />
      ) : flight.visual.uri ? (
        <Image
          source={{ uri: flight.visual.uri }}
          style={[styles.image, { borderColor: colors.gold }]}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.image, { backgroundColor: colors.gold, borderColor: colors.gold }]} />
      )}
    </Animated.View>
  );
}

export function useFly() {
  const ctx = useContext(FlyContext);
  if (!ctx) throw new Error('useFly precisa estar dentro de <FlyProvider>.');
  return ctx.fly;
}

/**
 * Transforma um ícone em destino de voo.
 * Retorna a ref (coloque em um View em volta do ícone) e o estilo de "pulo".
 */
export function useFlyTarget(name: FlyTargetName, priority: number) {
  const ctx = useContext(FlyContext);
  const ref = useRef<View>(null);
  const bumpValue: SharedValue<number> = useSharedValue(0);

  useEffect(() => {
    if (!ctx) return;
    return ctx.register(name, {
      ref,
      priority,
      bump: () => {
        bumpValue.set(
          withSequence(withSpring(1, { damping: 6, stiffness: 400 }), withSpring(0, { damping: 12 })),
        );
      },
    });
  }, [ctx, name, priority, bumpValue]);

  const bumpStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + bumpValue.value * 0.28 }, { rotate: `${bumpValue.value * -8}deg` }],
  }));

  return { ref, bumpStyle };
}

/** Mede um elemento na tela (origem do voo). */
export function measureRect(view: View | null): Promise<Rect | null> {
  return new Promise((resolve) => {
    if (!view) return resolve(null);
    view.measureInWindow((x, y, width, height) => resolve(width || height ? { x, y, width, height } : null));
  });
}

const styles = StyleSheet.create({
  flight: { position: 'absolute', left: 0, top: 0 },
  image: { width: '100%', height: '100%', borderRadius: 999, borderWidth: 2 },
});
