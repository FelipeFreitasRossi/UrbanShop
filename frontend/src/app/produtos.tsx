import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Container, useGutter } from '../components/layout/Container';
import { Screen } from '../components/layout/Screen';
import { Section } from '../components/layout/Section';
import { ProductList } from '../components/product/ProductList';
import { UText } from '../components/ui/UText';
import { CATEGORIES, getCategory } from '../config/navigation';
import { Reveal } from '../motion/Reveal';
import { fonts, radius, spacing } from '../theme/tokens';
import { makeStyles, useColors } from '../theme/ThemeProvider';

const FILTERS = [{ slug: '', label: 'Todos' }, ...CATEGORIES.map((c) => ({ slug: c.slug, label: c.label }))];

/**
 * Todos os produtos, em duas colunas no celular e no tablet.
 * O filtro de categoria fica na URL (?categoria=tenis) para poder ser compartilhado.
 * Tocar em um produto abre o popup com os detalhes.
 */
export default function ProductsPage() {
  const styles = useStyles();
  const router = useRouter();
  const gutter = useGutter();
  const params = useLocalSearchParams<{ categoria?: string }>();
  const selected = getCategory(typeof params.categoria === 'string' ? params.categoria : undefined);

  return (
    <Screen
      title={selected ? `Produtos · ${selected.title}` : 'Produtos'}
      description="Todos os produtos UrbanShop: camisetas oversized, shorts, tênis, bonés, corta-ventos e calças."
    >
      <Section tight>
        <Container>
          <Reveal variant="fade">
            <UText variant="eyebrow">Catálogo</UText>
          </Reveal>
          <Reveal delay={80}>
            <UText variant="h1" style={styles.title}>
              {selected ? selected.title : 'Produtos'}
            </UText>
          </Reveal>
        </Container>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filters, { paddingHorizontal: gutter }]}
          style={styles.filtersScroll}
        >
          {FILTERS.map((f) => (
            <FilterChip
              key={f.slug || 'todos'}
              label={f.label}
              active={(selected?.slug ?? '') === f.slug}
              onPress={() => router.setParams({ categoria: f.slug || undefined })}
            />
          ))}
        </ScrollView>

        <Container>
          <ProductList
            key={selected?.slug ?? 'todos'}
            query={{ category: selected?.slug, size: 20 }}
            columns={{ mobile: 2, tablet: 2, desktop: 4 }}
            paginate
            showCount
            emptyTitle="Nenhum produto publicado ainda"
            emptyMessage="Assim que novas peças forem publicadas, elas aparecem aqui."
          />
        </Container>
      </Section>
    </Screen>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const colors = useColors();
  const styles = useStyles();
  const style = useAnimatedStyle(() => ({
    backgroundColor: withTiming(active ? colors.white : 'rgba(255,255,255,0)', { duration: 200 }),
    borderColor: withTiming(active ? colors.white : colors.lineStrong, { duration: 200 }),
  }));
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <Animated.View style={[styles.chip, style]}>
        <UText style={[styles.chipText, { color: active ? colors.black : colors.text }]}>{label}</UText>
      </Animated.View>
    </Pressable>
  );
}

const useStyles = makeStyles(() => ({
  title: { marginTop: spacing.sm },
  filtersScroll: { marginTop: spacing.lg, marginBottom: spacing.xl, flexGrow: 0 },
  filters: { gap: 8 },
  chip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontFamily: fonts.bodySemiBold, fontSize: 13, lineHeight: 16 },
}));
