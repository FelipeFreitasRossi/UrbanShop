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
import { media, sized } from '../../config/media';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { easeInOut, easeOutExpo } from '../../motion/easing';
import { usePageScroll } from '../../motion/PageScroll';
import { OnDark, makeStyles, useColors } from '../../theme/ThemeProvider';
import { fonts, spacing } from '../../theme/tokens';
import { Container } from '../layout/Container';
import { useHeaderHeight } from '../layout/Header';
import { Button } from '../ui/Button';
import { UText } from '../ui/UText';

/**
 * Cinematic Hero:
 * - foto em tela cheia com movimento lento contínuo (Ken Burns) e parallax ao rolar;
 * - camadas de degradê (topo, base, laterais e um brilho dourado sutil);
 * - título "Vista a cidade" revelado linha a linha, como em abertura de filme;
 * - foto em moldura ao lado do título, com parallax próprio.
 * Fica sempre escura (texto claro sobre a foto), em qualquer tema.
 */
export function Hero() {
  return (
    <OnDark>
      <HeroContent />
    </OnDark>
  );
}

function HeroContent() {
  const colors = useColors();
  const styles = useStyles();
  const { height, isMobile, pick } = useBreakpoint();
  const { scrollY, scrollToAnchor, reduceMotion } = usePageScroll();
  const headerHeight = useHeaderHeight();

  const heroHeight = Math.max(pick(600, 660, 700), Math.min(height * (isMobile ? 0.92 : 1), 1100));
  const lineHeight = pick(46, 72, 102);

  // Entrada (0 → 1) e movimento contínuo da foto (Ken Burns).
  const intro = useSharedValue(reduceMotion ? 1 : 0);
  const kenBurns = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    intro.set(withDelay(150, withTiming(1, { duration: 2200, easing: easeOutExpo })));
    kenBurns.set(withRepeat(withTiming(1, { duration: 20000, easing: easeInOut }), -1, true));
  }, [intro, kenBurns, reduceMotion]);

  const imageStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    const y = scrollY.value;
    return {
      opacity: interpolate(intro.value, [0, 0.25], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(y, [0, heroHeight], [0, heroHeight * 0.35], Extrapolation.CLAMP) },
        { translateX: interpolate(kenBurns.value, [0, 1], [0, -18]) },
        {
          scale:
            interpolate(intro.value, [0, 1], [1.2, 1.04]) +
            kenBurns.value * 0.06 +
            interpolate(y, [0, heroHeight], [0, 0.1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    const y = scrollY.value;
    return {
      opacity: interpolate(y, [0, heroHeight * 0.55], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(y, [0, heroHeight], [0, -heroHeight * 0.18], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <View style={[styles.hero, { height: heroHeight }]} accessibilityRole="header">
      <Animated.View style={[StyleSheet.absoluteFill, imageStyle]}>
        <Image
          source={{ uri: sized(media.hero, pick(900, 1400, 2000)) }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={isMobile ? 'center' : 'top center'}
          priority="high"
          transition={600}
          accessibilityLabel="Homem vestindo jaqueta streetwear encostado em uma parede"
        />
      </Animated.View>

      {/* Camadas de degradê cinematográfico */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']}
        locations={[0, 0.32]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', '#000000']}
        locations={[0.45, 0.78, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.65)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0.7, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(200,167,94,0.22)', 'rgba(200,167,94,0)']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.45, y: 0.55 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <FeatureImage intro={intro} heroHeight={heroHeight} headerHeight={headerHeight} />

      <Animated.View style={[styles.content, { paddingTop: headerHeight }, contentStyle]}>
        <Container>
          <View style={{ maxWidth: pick(520, 420, 600) }}>
            <IntroItem index={0} intro={intro}>
              <View style={styles.eyebrowRow}>
                <View style={styles.eyebrowLine} />
                <UText variant="eyebrow">Nova temporada</UText>
              </View>
            </IntroItem>

            <View accessible accessibilityRole="header" accessibilityLabel="Vista a cidade.">
              <MaskLine intro={intro} start={0.12} height={lineHeight}>
                <UText variant="display">Vista a</UText>
              </MaskLine>
              <MaskLine intro={intro} start={0.22} height={lineHeight}>
                <UText variant="display">
                  cidade
                  <UText variant="display" color={colors.gold}>
                    .
                  </UText>
                </UText>
              </MaskLine>
              <GoldSweep intro={intro} />
            </View>

            <IntroItem index={2} intro={intro}>
              <UText variant="bodyLg" style={[styles.lead, { maxWidth: pick(360, 440, 500) }]}>
                A UrbanShop une streetwear essencial, corte preciso e materiais pensados para o ritmo da rua.
                Peças feitas para durar e para serem notadas.
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

/** Foto em moldura ao lado do título, com revelação de baixo para cima e parallax. */
function FeatureImage({
  intro,
  heroHeight,
  headerHeight,
}: {
  intro: SharedValue<number>;
  heroHeight: number;
  headerHeight: number;
}) {
  const styles = useStyles();
  const { isMobile, pick, height: screenHeight } = useBreakpoint();
  const { scrollY, reduceMotion } = usePageScroll();
  const width = pick(120, 220, 320);
  const imageHeight = width * 1.3;

  const frame = useAnimatedStyle(() => {
    const p = interpolate(intro.value, [0.3, 0.85], [0, 1], Extrapolation.CLAMP);
    const y = reduceMotion ? 0 : scrollY.value;
    return {
      opacity: p,
      transform: [
        { translateY: interpolate(p, [0, 1], [40, 0]) - y * 0.12 },
        { rotate: `${interpolate(p, [0, 1], [-4, 0])}deg` },
      ],
    };
  });
  const curtain = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: -interpolate(intro.value, [0.35, 0.95], [0, 1], Extrapolation.CLAMP) * (imageHeight + 4),
      },
    ],
  }));

  // No celular só aparece em telas altas, para não cobrir o título.
  if (isMobile && screenHeight < 800) return null;

  const position = isMobile
    ? { top: headerHeight + 16, right: 20 }
    : { top: Math.max(headerHeight + 40, heroHeight * 0.18), right: pick(20, 32, 64) };

  return (
    <Animated.View pointerEvents="none" style={[styles.feature, position, { width }, frame]}>
      <View style={[styles.featureOffset, { width, height: imageHeight }]} />
      <View style={[styles.featureImage, { width, height: imageHeight }]}>
        <Image
          source={{ uri: sized(media.heroFeature, width * 2) }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={500}
          accessibilityLabel="Jovem de boné em visual streetwear"
        />
        <Animated.View style={[StyleSheet.absoluteFill, styles.featureCurtain, curtain]} />
      </View>
      <View style={styles.featureCaption}>
        <View style={styles.captionDot} />
        <UText style={styles.captionText}>Coleção urbana</UText>
      </View>
    </Animated.View>
  );
}

/** Linha de título que sobe de dentro de uma "máscara" (abertura de filme). */
function MaskLine({
  intro,
  start,
  height,
  children,
}: {
  intro: SharedValue<number>;
  start: number;
  height: number;
  children: React.ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    const p = interpolate(intro.value, [start, start + 0.35], [0, 1], Extrapolation.CLAMP);
    return { transform: [{ translateY: (1 - p) * height * 1.1 }] };
  });
  return (
    <View style={{ overflow: 'hidden', height: height * 1.05 }}>
      <Animated.View style={style}>{children}</Animated.View>
    </View>
  );
}

/** Traço dourado que "varre" sob o título depois que ele aparece. */
function GoldSweep({ intro }: { intro: SharedValue<number> }) {
  const styles = useStyles();
  const style = useAnimatedStyle(() => ({
    transform: [{ scaleX: interpolate(intro.value, [0.45, 0.8], [0, 1], Extrapolation.CLAMP) }],
  }));
  return <Animated.View style={[styles.sweep, style]} />;
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
  const styles = useStyles();
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

const useStyles = makeStyles((colors) => ({
  hero: { width: '100%', overflow: 'hidden', backgroundColor: colors.black },
  content: { flex: 1, justifyContent: 'flex-end', paddingBottom: spacing.huge },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.lg },
  eyebrowLine: { width: 32, height: 1, backgroundColor: colors.gold },
  sweep: {
    height: 2,
    width: 120,
    marginTop: spacing.sm,
    backgroundColor: colors.gold,
    transformOrigin: 'left',
  },
  lead: { marginTop: spacing.lg, color: 'rgba(244,243,239,0.82)' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, flexWrap: 'wrap' },
  actionsMobile: { flexDirection: 'column', alignItems: 'stretch' },
  feature: { position: 'absolute' },
  featureOffset: {
    position: 'absolute',
    top: 14,
    left: 14,
    borderWidth: 1,
    borderColor: colors.goldLine,
    borderRadius: 4,
  },
  featureImage: { borderRadius: 4, overflow: 'hidden', backgroundColor: colors.surface },
  featureCurtain: { backgroundColor: colors.black },
  featureCaption: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22 },
  captionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold },
  captionText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  cue: {
    position: 'absolute',
    left: '50%',
    bottom: 28,
    marginLeft: -20,
    width: 40,
    alignItems: 'center',
    gap: 10,
  },
  cueText: { textTransform: 'uppercase', letterSpacing: 3 },
  cueTrack: { width: 1, height: 60, overflow: 'hidden', backgroundColor: colors.line },
  cueLine: { width: 1, height: 30, backgroundColor: colors.gold },
}));
