import { Link, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUpRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { media, sized } from '../../config/media';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { ParallaxImage } from '../../motion/ParallaxImage';
import { Reveal } from '../../motion/Reveal';
import { useInteraction } from '../../motion/useInteraction';
import { radius, spacing } from '../../theme/tokens';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { Button } from '../ui/Button';
import { UText } from '../ui/UText';
import { OnDark, makeStyles, useColors } from '../../theme/ThemeProvider';

/** Coleções editoriais com fotos grandes, parallax e textos que surgem com a rolagem. */
export function Collections() {
  const styles = useStyles();
  const { pick, isMobile } = useBreakpoint();

  return (
    <>
      {/* Coleção masculina — imagem de borda a borda (sempre escura, texto sobre foto) */}
      <OnDark>
        <ParallaxImage
          uri={sized(media.collections.masculino, pick(900, 1400, 2000))}
          strength={pick(50, 70, 90)}
          zoom={0.1}
          style={{ height: pick(560, 680, 800) }}
          accessibilityLabel="Homem em jaqueta marrom e calça preta"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.0)']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0.9, y: 0.2 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.fullOverlay}>
            <Container>
              <View style={{ maxWidth: pick(420, 560, 640) }}>
                <Reveal variant="fade">
                  <UText variant="eyebrow">Coleção masculina</UText>
                </Reveal>
                <Reveal delay={100}>
                  <UText variant="h1" style={styles.title}>
                    Linhas retas.{'\n'}Atitude própria.
                  </UText>
                </Reveal>
                <Reveal delay={200}>
                  <UText variant="bodyLg" style={styles.copy}>
                    Modelagens amplas, tons sóbrios e detalhes que só quem entende percebe.
                  </UText>
                </Reveal>
                <Reveal delay={300}>
                  <Button label="Ver masculino" href="/masculino" arrow style={styles.cta} />
                </Reveal>
              </View>
            </Container>
          </View>
        </ParallaxImage>
      </OnDark>

      {/* Duas coleções lado a lado */}
      <Section>
        <Container>
          <View style={[styles.pair, { flexDirection: isMobile ? 'column' : 'row', gap: pick(16, 20, 28) }]}>
            <CollectionTile
              eyebrow="Coleção feminina"
              title="Força em cada detalhe"
              href="/feminino"
              image={media.collections.feminino}
              alt="Mulher de moletom em frente a uma parede clara"
              delay={0}
              offset={0}
            />
            <CollectionTile
              eyebrow="Acabou de chegar"
              title="Novidades da semana"
              href="/novidades"
              image={media.collections.novidades}
              alt="Homem de jaqueta laranja sentado na calçada"
              delay={140}
              offset={isMobile ? 0 : pick(0, 48, 96)}
            />
          </View>
        </Container>
      </Section>
    </>
  );
}

type CollectionTileProps = {
  eyebrow: string;
  title: string;
  href: Href;
  image: string;
  alt: string;
  delay: number;
  offset: number;
};

/** O card fica sempre escuro (texto claro sobre foto), em qualquer tema. */
function CollectionTile(props: CollectionTileProps) {
  return (
    <OnDark>
      <CollectionTileContent {...props} />
    </OnDark>
  );
}

function CollectionTileContent({ eyebrow, title, href, image, alt, delay, offset }: CollectionTileProps) {
  const colors = useColors();
  const styles = useStyles();
  const { hover, pressStyle, handlers } = useInteraction(0.99);
  const { isMobile } = useBreakpoint();
  const icon = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(hover.value, [0, 1], [0, 3]) },
      { translateY: interpolate(hover.value, [0, 1], [0, -3]) },
    ],
  }));

  return (
    <View style={[isMobile ? styles.tileFull : styles.tileHalf, { marginTop: offset }]}>
      <Reveal delay={delay} distance={48}>
        <Link href={href} asChild>
          <Pressable accessibilityRole="link" accessibilityLabel={title} {...handlers}>
            <Animated.View style={pressStyle}>
              <ParallaxImage
                uri={image}
                hover={hover}
                strength={40}
                accessibilityLabel={alt}
                style={{ aspectRatio: 4 / 5, borderRadius: radius.md }}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
                  locations={[0.5, 1]}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
                <View style={styles.tileOverlay} pointerEvents="none">
                  <View style={styles.tileText}>
                    <UText variant="eyebrow">{eyebrow}</UText>
                    <UText variant="h2" style={styles.tileTitle}>
                      {title}
                    </UText>
                  </View>
                  <Animated.View style={[styles.tileIcon, icon]}>
                    <ArrowUpRight size={20} color={colors.black} strokeWidth={2} />
                  </Animated.View>
                </View>
              </ParallaxImage>
            </Animated.View>
          </Pressable>
        </Link>
      </Reveal>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingBottom: spacing.huge,
  },
  title: { marginTop: spacing.md },
  copy: { marginTop: spacing.md, color: 'rgba(244,243,239,0.8)' },
  cta: { marginTop: spacing.xl, alignSelf: 'flex-start' },
  pair: { alignItems: 'flex-start' },
  tileHalf: { flex: 1 },
  tileFull: { width: '100%' },
  tileOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  tileText: { flexShrink: 1, gap: spacing.xs },
  tileTitle: { maxWidth: 380 },
  tileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
