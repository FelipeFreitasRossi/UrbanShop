import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { media } from '../../config/media';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { easeInOut, easeOutExpo } from '../../motion/easing';
import { usePageScroll } from '../../motion/PageScroll';
import { colors, spacing } from '../../theme/tokens';
import { Container } from '../layout/Container';
import { useHeaderHeight } from '../layout/Header';
import { Button } from '../ui/Button';
import { UText } from '../ui/UText';

/**
 * Hero da home: foto em tela cheia com parallax e zoom, gradiente escuro,
 * título com entrada escalonada e indicador de rolagem.
 */
export function Hero() {
  const { height, isMobile, pick } = useBreakpoint();
  const { scrollY, scrollToAnchor, reduceMotion } = usePageScroll();
  const headerHeight = useHeaderHeight();

  const heroHeight = Math.max(pick(560, 640, 680), Math.min(height * (isMobile ? 0.9 : 1), 1100));

  // Entrada: imagem faz "zoom out" e os textos sobem em sequência.
  const intro = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (!reduceMotion) intro.set(withDelay(150, withTiming(1, { duration: 1800, easing: easeOutExpo })));
  }, [intro, reduceMotion]);

  const imageStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    const y = scrollY.value;
    return {
      transform: [
        { translateY: interpolate(y, [0, heroHeight], [0, heroHeight * 0.35], Extrapolation.CLAMP) },
        {
          scale:
            interpolate(intro.value, [0, 1], [1.18, 1.04]) +
            interpolate(y, [0, heroHeight], [0, 0.12], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    const y = scrollY.value;
    return {
      opacity: interpolate(y, [0, heroHeight * 0.55], [1, 0], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(y, [0, heroHeight], [0, -heroHeight * 0.18], Extrapolation.CLAMP) }],
    };
  });

  return (
    <View style={[styles.hero, { height: heroHeight }]} accessibilityRole="header">
      <Animated.View style={[styles.imageWrap, imageStyle]}>
        <Image
          source={{ uri: media.hero }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={isMobile ? 'center' : 'top center'}
          priority="high"
          transition={600}
          accessibilityLabel="Homem vestindo jaqueta streetwear encostado em uma parede"
        />
      </Animated.View>

      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.55)', colors.black]}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Animated.View style={[styles.content, { paddingTop: headerHeight }, contentStyle]}>
        <Container>
          <View style={{ maxWidth: pick(520, 680, 860) }}>
            <IntroItem index={0} intro={intro}>
              <View style={styles.eyebrowRow}>
                <View style={styles.eyebrowLine} />
                <UText variant="eyebrow">Nova temporada</UText>
              </View>
            </IntroItem>

            <IntroItem index={1} intro={intro}>
              <UText variant="display" accessibilityRole="header">
                Vista a{'\n'}cidade
                <UText variant="display" color={colors.gold}>
                  .
                </UText>
              </UText>
            </IntroItem>

            <IntroItem index={2} intro={intro}>
              <UText variant="bodyLg" style={[styles.lead, { maxWidth: pick(360, 480, 520) }]}>
                A UrbanShop une streetwear essencial, corte preciso e materiais pensados para o ritmo
                da rua. Peças feitas para durar e para serem notadas.
              </UText>
            </IntroItem>

            <IntroItem index={3} intro={intro}>
              <View style={[styles.actions, isMobile && styles.actionsMobile]}>
                <Button
                  label="Explorar coleção"
                  size="lg"
                  arrow
                  fullWidth={isMobile}
                  onPress={() => scrollToAnchor('categorias')}
                  accessibilityHint="Rola a página até as categorias"
                />
                <Button
                  label="Ver novidades"
                  size="lg"
                  variant="outline"
                  fullWidth={isMobile}
                  href="/novidades"
                />
              </View>
            </IntroItem>
          </View>
        </Container>
      </Animated.View>

      {!isMobile ? <ScrollCue /> : null}
    </View>
  );
}

function IntroItem({
  index,
  intro,
  children,
}: {
  index: number;
  intro: SharedValue<number>;
  children: React.ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    const start = 0.08 + index * 0.1;
    const p = interpolate(intro.value, [start, start + 0.45], [0, 1], Extrapolation.CLAMP);
    return { opacity: p, transform: [{ translateY: interpolate(p, [0, 1], [28, 0]) }] };
  });
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** Indicador "role para baixo" com linha dourada em movimento. */
function ScrollCue() {
  const { reduceMotion } = usePageScroll();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    t.set(
      withRepeat(
        withSequence(withTiming(1, { duration: 1400, easing: easeInOut }), withTiming(0, { duration: 0 })),
        -1,
      ),
    );
  }, [t, reduceMotion]);

  const line = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(t.value, [0, 1], [-40, 40]) }],
    opacity: interpolate(t.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
  }));

  return (
    <View style={styles.cue} pointerEvents="none">
      <UText variant="caption" style={styles.cueText}>
        Role
      </UText>
      <View style={styles.cueTrack}>
        <Animated.View style={[styles.cueLine, line]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', overflow: 'hidden', backgroundColor: colors.black },
  imageWrap: { ...StyleSheet.absoluteFillObject },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.huge,
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.lg },
  eyebrowLine: { width: 32, height: 1, backgroundColor: colors.gold },
  lead: { marginTop: spacing.lg, color: 'rgba(244,243,239,0.78)' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, flexWrap: 'wrap' },
  actionsMobile: { flexDirection: 'column', alignItems: 'stretch' },
  cue: { position: 'absolute', right: 48, bottom: 48, alignItems: 'center', gap: 12 },
  cueText: { textTransform: 'uppercase', letterSpacing: 3 },
  cueTrack: { width: 1, height: 80, overflow: 'hidden', backgroundColor: colors.line },
  cueLine: { width: 1, height: 40, backgroundColor: colors.gold },
});
