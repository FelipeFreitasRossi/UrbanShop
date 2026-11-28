import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { easeInOut, easeOutExpo } from '../../motion/easing';
import { colors } from '../../theme/tokens';
import { Logo } from './Logo';

type SplashOverlayProps = {
  /** true quando fontes e recursos essenciais terminaram de carregar. */
  ready: boolean;
  onFinish: () => void;
};

const LINE_WIDTH = 180;

/**
 * Tela de carregamento: fundo preto, logo com entrada suave e linha dourada.
 * A linha acompanha o carregamento real — não há espera artificial.
 * Quando tudo está pronto, a linha se completa e a tela sai com fade.
 */
export function SplashOverlay({ ready, onFinish }: SplashOverlayProps) {
  const reduce = useReducedMotion();
  const logo = useSharedValue(0);
  const line = useSharedValue(0);
  const exit = useSharedValue(0);
  const finishing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // Entrada da logo e avanço da linha enquanto carrega.
  useEffect(() => {
    logo.set(withTiming(1, { duration: reduce ? 0 : 700, easing: easeOutExpo }));
    line.set(withTiming(0.75, { duration: reduce ? 0 : 1600, easing: easeOutExpo }));
  }, [logo, line, reduce]);

  // Saída assim que estiver pronto.
  useEffect(() => {
    if (!ready || finishing.current) return;
    finishing.current = true;
    const delay = reduce ? 0 : 300;
    const duration = reduce ? 120 : 520;
    line.set(withTiming(1, { duration: reduce ? 0 : 280, easing: easeInOut }));
    exit.set(withDelay(delay, withTiming(1, { duration, easing: easeInOut })));
    // Remove a camada quando a animação de saída termina.
    timer.current = setTimeout(() => onFinishRef.current(), delay + duration + 40);
  }, [ready, reduce, line, exit]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      finishing.current = false;
    },
    [],
  );

  const container = useAnimatedStyle(() => ({ opacity: 1 - exit.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logo.value * (1 - exit.value),
    transform: [
      { translateY: interpolate(logo.value, [0, 1], [14, 0]) },
      { scale: interpolate(exit.value, [0, 1], [1, 1.06]) },
    ],
  }));
  const lineStyle = useAnimatedStyle(() => ({ width: line.value * LINE_WIDTH }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, container]} accessibilityLabel="Carregando UrbanShop">
      <Animated.View style={logoStyle}>
        <Logo size={34} />
      </Animated.View>
      <View style={styles.track}>
        <Animated.View style={[styles.line, lineStyle]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  track: {
    width: LINE_WIDTH,
    height: 1,
    marginTop: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  line: { height: 1, backgroundColor: colors.gold },
});
