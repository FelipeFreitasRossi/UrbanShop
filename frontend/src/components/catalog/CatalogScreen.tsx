import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { sized } from '../../config/media';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { ParallaxImage } from '../../motion/ParallaxImage';
import { Reveal } from '../../motion/Reveal';
import type { ProductQuery } from '../../services/products';
import { spacing } from '../../theme/tokens';
import { Container } from '../layout/Container';
import { useHeaderHeight } from '../layout/Header';
import { Screen } from '../layout/Screen';
import { Section } from '../layout/Section';
import { ProductList } from '../product/ProductList';
import { UText } from '../ui/UText';
import { onDark } from '../../theme/palettes';
import { OnDark, makeStyles } from '../../theme/ThemeProvider';

type CatalogScreenProps = {
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  query: ProductQuery;
  emptyMessage?: string;
};

export function CatalogScreen({
  title,
  eyebrow,
  description,
  image,
  query,
  emptyMessage,
}: CatalogScreenProps) {
  const styles = useStyles();
  const { pick } = useBreakpoint();
  const headerHeight = useHeaderHeight();

  return (
    <Screen overlayHeader title={title} description={description} image={image}>
      {/* Banner sempre escuro (texto claro sobre foto), em qualquer tema. */}
      <OnDark>
        <ParallaxImage
          uri={sized(image, pick(900, 1400, 1800))}
          strength={60}
          style={{ height: pick(380, 460, 540) }}
          priority="high"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.65)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.92)']}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={[styles.bannerContent, { paddingTop: headerHeight }]}>
            <Container>
              <Reveal variant="fade">
                <View style={styles.breadcrumb}>
                  <Link href="/" asChild>
                    <Pressable accessibilityRole="link">
                      <UText variant="caption">Início</UText>
                    </Pressable>
                  </Link>
                  <UText variant="caption">/</UText>
                  <UText variant="caption" color={onDark.text}>
                    {title}
                  </UText>
                </View>
              </Reveal>
              <Reveal delay={60}>
                <UText variant="eyebrow">{eyebrow}</UText>
              </Reveal>
              <Reveal delay={140}>
                <UText variant="h1" accessibilityRole="header" style={styles.title}>
                  {title}
                </UText>
              </Reveal>
              <Reveal delay={220}>
                <UText variant="bodyLg" style={styles.description}>
                  {description}
                </UText>
              </Reveal>
            </Container>
          </View>
        </ParallaxImage>
      </OnDark>

      <Section tight>
        <Container>
          <ProductList
            query={query}
            emptyTitle="Nenhum produto publicado ainda"
            emptyMessage={emptyMessage ?? 'Assim que novas peças forem publicadas, elas aparecem aqui.'}
          />
        </Container>
      </Section>
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  bannerContent: { flex: 1, justifyContent: 'flex-end', paddingBottom: spacing.xxl },
  breadcrumb: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  title: { marginTop: spacing.sm },
  description: { marginTop: spacing.sm, maxWidth: 560 },
}));
