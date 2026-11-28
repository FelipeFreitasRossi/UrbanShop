import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { CATEGORIES, type Category } from '../../config/navigation';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { ParallaxImage } from '../../motion/ParallaxImage';
import { Reveal } from '../../motion/Reveal';
import { useInteraction } from '../../motion/useInteraction';
import { colors, radius, spacing } from '../../theme/tokens';
import { Container, useGutter } from '../layout/Container';
import { Section, SectionHeader } from '../layout/Section';
import { UText } from '../ui/UText';

/** Seção de categorias: grade no desktop, carrossel com "snap" no celular. */
export function CategoryGrid() {
  const { isMobile, pick, width } = useBreakpoint();
  const gutter = useGutter();

  return (
    <Section anchor="categorias">
      <SectionHeader
        eyebrow="Categorias"
        title="Encontre o seu estilo"
        description="Do básico impecável às peças de impacto. Escolha por categoria e monte o seu visual."
      />

      {isMobile ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={Math.round(width * 0.72) + 12}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: gutter, gap: 12 }}
        >
          {CATEGORIES.map((c, i) => (
            <View key={c.slug} style={{ width: Math.round(width * 0.72) }}>
              <Reveal variant="left" delay={Math.min(i, 2) * 100}>
                <CategoryCard category={c} index={i} aspect={3 / 4} />
              </Reveal>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Container>
          <View style={[styles.grid, { marginHorizontal: -pick(6, 8, 10) }]}>
            {CATEGORIES.map((c, i) => (
              <View key={c.slug} style={[styles.cell, { padding: pick(6, 8, 10) }]}>
                <Reveal delay={(i % 3) * 110} variant="up">
                  <CategoryCard category={c} index={i} aspect={i < 3 ? 4 / 5 : 4 / 3.4} />
                </Reveal>
              </View>
            ))}
          </View>
        </Container>
      )}
    </Section>
  );
}

function CategoryCard({ category, index, aspect }: { category: Category; index: number; aspect: number }) {
  const { hover, pressStyle, handlers } = useInteraction(0.985);
  const { isMobile } = useBreakpoint();
  // Em telas de toque não existe hover: a descrição fica sempre visível.
  const showText = Platform.OS !== 'web' || isMobile;

  const border = useAnimatedStyle(() => ({
    borderColor: interpolateColor(hover.value, [0, 1], ['rgba(200,167,94,0)', colors.goldLine]),
  }));
  const arrow = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(hover.value, [0, 1], [0, 6]) }],
  }));
  const description = useAnimatedStyle(() => {
    if (showText) return { opacity: 1 };
    return {
      opacity: hover.value,
      transform: [{ translateY: interpolate(hover.value, [0, 1], [8, 0]) }],
    };
  });

  return (
    <Link href={`/categoria/${category.slug}`} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={`Ver ${category.title}`} {...handlers}>
        <Animated.View style={[styles.card, pressStyle]}>
          <ParallaxImage
            uri={category.image}
            hover={hover}
            strength={24}
            style={{ aspectRatio: aspect, borderRadius: radius.md }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <Animated.View style={[StyleSheet.absoluteFill, styles.border, border]} pointerEvents="none" />
            <View style={styles.overlay} pointerEvents="none">
              <UText variant="caption" color={colors.gold} style={styles.number}>
                {String(index + 1).padStart(2, '0')}
              </UText>
              <View>
                <UText variant="h3">{category.title}</UText>
                <Animated.View style={description}>
                  <UText variant="small" numberOfLines={2} style={styles.desc}>
                    {category.description}
                  </UText>
                </Animated.View>
                <View style={styles.explore}>
                  <UText variant="label">Explorar</UText>
                  <Animated.View style={arrow}>
                    <ArrowRight size={15} color={colors.gold} strokeWidth={2} />
                  </Animated.View>
                </View>
              </View>
            </View>
          </ParallaxImage>
        </Animated.View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '33.333%' },
  card: { borderRadius: radius.md, overflow: 'hidden' },
  border: { borderWidth: 1, borderRadius: radius.md },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  number: { letterSpacing: 2 },
  desc: { marginTop: 4, maxWidth: 300 },
  explore: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.sm },
});
