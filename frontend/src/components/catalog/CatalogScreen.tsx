import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { ParallaxImage } from '../../motion/ParallaxImage';
import { Reveal } from '../../motion/Reveal';
import type { ProductQuery } from '../../services/products';
import { colors, spacing } from '../../theme/tokens';
import { Container } from '../layout/Container';
import { useHeaderHeight } from '../layout/Header';
import { Screen } from '../layout/Screen';
import { Section } from '../layout/Section';
import { ProductList } from '../product/ProductList';
import { UText } from '../ui/UText';

type CatalogScreenProps = {
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  query: ProductQuery;
  emptyMessage?: string;
};

/**
 * Página de listagem (categoria, masculino, feminino, ofertas, novidades):
 * banner com parallax e grade de produtos carregados da API.
 * Filtros, ordenação e paginação completos chegam na Etapa 3.
 */
export function CatalogScreen({ title, eyebrow, description, image, query, emptyMessage }: CatalogScreenProps) {
  const { pick } = useBreakpoint();
  const headerHeight = useHeaderHeight();

  return (
    <Screen overlayHeader title={title} description={description} image={image}>
      <ParallaxImage uri={image} strength={60} style={{ height: pick(380, 460, 540) }} priority="high">
        <LinearGradient
          colors={['rgba(0,0,0,0.65)', 'rgba(0,0,0,0.25)', colors.black]}
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
                <UText variant="caption" color={colors.text}>
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

const styles = StyleSheet.create({
  bannerContent: { flex: 1, justifyContent: 'flex-end', paddingBottom: spacing.xxl },
  breadcrumb: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  title: { marginTop: spacing.sm },
  description: { marginTop: spacing.sm, maxWidth: 560 },
});
