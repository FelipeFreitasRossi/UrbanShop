import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { easeOutExpo } from '../../motion/easing';
import { Reveal } from '../../motion/Reveal';
import { colors, fonts, spacing } from '../../theme/tokens';
import type { ProductCollection } from '../../types/product';
import { Container } from '../layout/Container';
import { Section, SectionHeader } from '../layout/Section';
import { ProductList } from '../product/ProductList';

const TABS: { key: ProductCollection; label: string; empty: string }[] = [
  { key: 'best-sellers', label: 'Mais vendidos', empty: 'Os mais vendidos aparecem aqui assim que as primeiras vendas forem confirmadas.' },
  { key: 'new', label: 'Novidades', empty: 'Nenhuma novidade publicada no momento.' },
  { key: 'sale', label: 'Ofertas', empty: 'Nenhuma oferta ativa no momento.' },
  { key: 'recommended', label: 'Recomendados', empty: 'Ainda não há recomendações por aqui.' },
];

/** Produtos em destaque com abas. Os dados vêm da API — nada é inventado. */
export function FeaturedProducts() {
  const [active, setActive] = useState<ProductCollection>('best-sellers');
  const tab = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <Section anchor="destaques">
      <SectionHeader
        eyebrow="Em destaque"
        title="Escolhidos para você"
        action={{ label: 'Ver novidades', href: '/novidades' }}
      />
      <Container>
        <Reveal variant="fade">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
            accessibilityRole="tablist"
          >
            {TABS.map((t) => (
              <TabButton key={t.key} label={t.label} active={t.key === active} onPress={() => setActive(t.key)} />
            ))}
          </ScrollView>
        </Reveal>
        <View style={styles.list}>
          <ProductList
            key={active}
            query={{ collection: active, size: 8 }}
            layout="carousel"
            emptyTitle={`${tab.label}: em breve`}
            emptyMessage={tab.empty}
          />
        </View>
      </Container>
    </Section>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const line = useAnimatedStyle(() => ({
    transform: [{ scaleX: withTiming(active ? 1 : 0, { duration: 420, easing: easeOutExpo }) }],
  }));
  const text = useAnimatedStyle(() => ({
    color: withTiming(active ? colors.white : colors.textDim, { duration: 240 }),
  }));
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={styles.tab}
    >
      <Animated.Text style={[styles.tabLabel, text]}>{label}</Animated.Text>
      <Animated.View style={[styles.tabLine, line]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabs: {
    gap: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    flexGrow: 1,
  },
  tab: { paddingVertical: 14 },
  tabLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  tabLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -StyleSheet.hairlineWidth,
    height: 2,
    backgroundColor: colors.gold,
  },
  list: { marginTop: spacing.xl },
});
