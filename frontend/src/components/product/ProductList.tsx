import { PackageOpen, RefreshCw } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useRequest } from '../../hooks/useRequest';
import { Reveal } from '../../motion/Reveal';
import { ApiError, friendlyError } from '../../services/api';
import { listProducts, type ProductQuery } from '../../services/products';
import { spacing } from '../../theme/tokens';
import type { Product } from '../../types/product';
import { useGutter } from '../layout/Container';
import { EmptyState } from '../ui/EmptyState';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from './ProductSkeleton';

type ProductListProps = {
  query: ProductQuery;
  /** "carousel" no celular vira rolagem horizontal; no desktop sempre é grade. */
  layout?: 'grid' | 'carousel';
  emptyTitle?: string;
  emptyMessage?: string;
};

/**
 * Busca produtos reais na API e exibe em grade ou carrossel,
 * com estados de carregamento, erro (com "tentar novamente") e vazio.
 */
export function ProductList({
  query,
  layout = 'grid',
  emptyTitle = 'Nenhum produto por aqui ainda',
  emptyMessage = 'Novas peças são publicadas com frequência. Volte em breve.',
}: ProductListProps) {
  const key = JSON.stringify(query);
  const request = useRequest(() => listProducts(query), [key]);
  const { isMobile } = useBreakpoint();
  const size = query.size ?? 12;

  if (request.status === 'error') {
    const notConfigured = request.error instanceof ApiError && request.error.code === 'NOT_CONFIGURED';
    return (
      <EmptyState
        compact
        icon={notConfigured ? PackageOpen : RefreshCw}
        title={notConfigured ? 'Catálogo em preparação' : 'Não foi possível carregar'}
        message={friendlyError(request.error)}
        action={notConfigured ? undefined : { label: 'Tentar novamente', onPress: request.reload }}
      />
    );
  }

  if (request.status === 'success' && request.data.content.length === 0) {
    return <EmptyState compact icon={PackageOpen} title={emptyTitle} message={emptyMessage} />;
  }

  const items: (Product | null)[] =
    request.status === 'success' ? request.data.content : Array.from({ length: Math.min(size, 4) }, () => null);

  if (layout === 'carousel' && isMobile) {
    return <Carousel items={items} />;
  }
  return <Grid items={items} />;
}

function Grid({ items }: { items: (Product | null)[] }) {
  const { pick } = useBreakpoint();
  const cols = pick(2, 3, 4);
  const gap = pick(12, 20, 24);

  return (
    <View style={[styles.grid, { marginHorizontal: -gap / 2, rowGap: pick(28, 36, 48) }]}>
      {items.map((p, i) => (
        <View key={p?.id ?? `s${i}`} style={{ width: `${100 / cols}%` as `${number}%`, paddingHorizontal: gap / 2 }}>
          {p ? (
            <Reveal delay={(i % cols) * 90}>
              <ProductCard product={p} />
            </Reveal>
          ) : (
            <ProductSkeleton />
          )}
        </View>
      ))}
    </View>
  );
}

function Carousel({ items }: { items: (Product | null)[] }) {
  const { width } = useBreakpoint();
  const gutter = useGutter();
  const itemWidth = Math.round(width * 0.66);
  const gap = 14;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemWidth + gap}
      decelerationRate="fast"
      // O carrossel vai até a borda da tela, apesar da margem do Container.
      style={{ marginHorizontal: -gutter }}
      contentContainerStyle={{ paddingHorizontal: gutter, gap }}
    >
      {items.map((p, i) => (
        <View key={p?.id ?? `s${i}`} style={{ width: itemWidth }}>
          {p ? (
            <Reveal variant="left" delay={Math.min(i, 3) * 90}>
              <ProductCard product={p} />
            </Reveal>
          ) : (
            <ProductSkeleton />
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.xxs },
});
