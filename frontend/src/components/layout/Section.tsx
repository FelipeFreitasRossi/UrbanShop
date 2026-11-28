import { Link, type Href } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Reveal } from '../../motion/Reveal';
import { usePageScroll } from '../../motion/PageScroll';
import { useInteraction } from '../../motion/useInteraction';
import { colors, spacing } from '../../theme/tokens';
import { UText } from '../ui/UText';
import { Container } from './Container';

type SectionProps = {
  children: React.ReactNode;
  /** Nome para rolagem suave até a seção (ex.: "categorias"). */
  anchor?: string;
  style?: StyleProp<ViewStyle>;
  tight?: boolean;
};

/** Bloco vertical da página. Deve ser filho direto do Screen para âncoras funcionarem. */
export function Section({ children, anchor, style, tight = false }: SectionProps) {
  const { pick } = useBreakpoint();
  const { registerAnchor } = usePageScroll();
  const pad = tight ? pick(40, 56, 72) : pick(72, 96, 128);

  return (
    <View
      onLayout={anchor ? (e) => registerAnchor(anchor, e.nativeEvent.layout.y) : undefined}
      style={[{ paddingVertical: pad }, style]}
    >
      {children}
    </View>
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: Href };
};

/** Cabeçalho de seção: rótulo dourado, título, descrição e link "ver tudo". */
export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  const { isMobile } = useBreakpoint();
  return (
    <Container>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View style={styles.texts}>
          {eyebrow ? (
            <Reveal variant="fade">
              <UText variant="eyebrow">{eyebrow}</UText>
            </Reveal>
          ) : null}
          <Reveal delay={80}>
            <UText variant="h2" accessibilityRole="header">
              {title}
            </UText>
          </Reveal>
          {description ? (
            <Reveal delay={160}>
              <UText variant="body" style={styles.description}>
                {description}
              </UText>
            </Reveal>
          ) : null}
        </View>
        {action ? (
          <Reveal variant="fade" delay={200}>
            <TextLink label={action.label} href={action.href} />
          </Reveal>
        ) : null}
      </View>
    </Container>
  );
}

/** Link de texto com sublinhado dourado animado e seta. */
export function TextLink({ label, href }: { label: string; href: Href }) {
  const { hover, handlers } = useInteraction();
  const line = useAnimatedStyle(() => ({
    transform: [{ scaleX: interpolate(hover.value, [0, 1], [0.25, 1]) }],
    backgroundColor: interpolateColor(hover.value, [0, 1], [colors.lineStrong, colors.gold]),
  }));
  const arrow = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(hover.value, [0, 1], [0, 4]) }],
  }));
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" {...handlers} style={styles.link}>
        <View style={styles.linkRow}>
          <UText variant="label">{label}</UText>
          <Animated.View style={arrow}>
            <ArrowRight size={15} color={colors.gold} strokeWidth={2} />
          </Animated.View>
        </View>
        <Animated.View style={[styles.linkLine, line]} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  headerMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  texts: { gap: spacing.sm, flexShrink: 1, maxWidth: 720 },
  description: { marginTop: spacing.xxs, maxWidth: 560 },
  link: { paddingVertical: 6 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linkLine: {
    height: 1,
    marginTop: 6,
    width: '100%',
    transformOrigin: 'left',
  },
});
