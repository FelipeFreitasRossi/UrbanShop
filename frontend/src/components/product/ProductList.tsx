import { PackageOpen, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useRequest } from '../../hooks/useRequest';
import { ApiError, friendlyError } from '../../services/api';
import { listProducts, type ProductQuery } from '../../services/products';
import { spacing } from '../../theme/tokens';
import type { Product } from '../../types/product';
import { useGutter } from '../layout/Container';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { UText } from '../ui/UText';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from './ProductSkeleton';
import { makeStyles, useColors } from '../../theme/ThemeProvider';

type Columns = { mobile: number; tablet: number; desktop: number };

type ProductListProps = {
  query: ProductQuery;
  /** "carousel" no celular vira rolagem horizontal; no desktop sempre é grade. */
  layout?: 'grid' | 'carousel';
  /** Quantidade de colunas da grade em cada faixa de tela. */
  columns?: Columns;
  /** Mostra o botão "Carregar mais" quando houver mais páginas. */
  paginate?: boolean;
  /** Mostra "X produtos" acima da grade. */
  showCount?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
};

const DEFAULT_COLUMNS: Columns = { mobile: 2, tablet: 3, desktop: 4 };

/**
 * Busca produtos reais na API e exibe em grade ou carrossel,
 * com estados de carregamento, erro (com "tentar novamente") e vazio.
 */
export function ProductList({
  query,
  layout = 'grid',
  columns = DEFAULT_COLUMNS,
  paginate = false,
  showCount = false,
  emptyTitle = 'Nenhum produto por aqui ainda',
  emptyMessage = 'Novas peças são publicadas com frequência. Volte em breve.',
}: ProductListProps) {
  const colors = useColors();
  const styles = useStyles();
  const key = JSON.stringify(query);
  const request = useRequest(() => listProducts(query), [key]);
  const { isMobile } = useBreakpoint();
  const size = query.size ?? 12;

  // Páginas extras carregadas com "Carregar mais".
  const [extra, setExtra] = useState<Product[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

  useEffect(() => {
    setExtra([]);
    setNextPage(1);
    setMoreError(null);
  }, [key]);

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
    request.status === 'success'
      ? [...request.data.content, ...extra]
      : Array.from({ length: Math.min(size, 4) }, () => null);

  const total = request.status === 'success' ? request.data.totalElements : 0;
  const totalPages = request.status === 'success' ? request.data.totalPages : 0;
  const hasMore = paginate && request.status === 'success' && nextPage < totalPages;

  const loadMore = async () => {
    setLoadingMore(true);
    setMoreError(null);
    try {
      const page = await listProducts({ ...query, page: nextPage });
      setExtra((prev) => [...prev, ...page.content]);
      setNextPage((n) => n + 1);
    } catch (e) {
      setMoreError(friendlyError(e));
    } finally {
      setLoadingMore(false);
    }
  };

  if (layout === 'carousel' && isMobile) {
    return <Carousel items={items} />;
  }

  return (
    <View>
      {showCount && request.status === 'success' ? (
        <UText variant="small" style={styles.count}>
          {total === 1 ? '1 produto' : `${total.toLocaleString('pt-BR')} produtos`}
        </UText>
      ) : null}

      <Grid items={items} columns={columns} />

      {hasMore || moreError ? (
        <View style={styles.more}>
          {moreError ? (
            <UText variant="small" color={colors.danger} align="center">
              {moreError}
            </UText>
          ) : null}
          <Button
            label={moreError ? 'Tentar novamente' : 'Carregar mais'}
            variant="outline"
            onPress={loadMore}
            loading={loadingMore}
          />
        </View>
      ) : null}
    </View>
  );
}

function Grid({ items, columns }: { items: (Product | null)[]; columns: Columns }) {
  const styles = useStyles();
  const { pick } = useBreakpoint();
  const cols = pick(columns.mobile, columns.tablet, columns.desktop);
  const gap = pick(12, 20, 24);

  return (
    <View style={[styles.grid, { marginHorizontal: -gap / 2, rowGap: pick(24, 36, 48) }]}>
      {items.map((p, i) => (
        <View
          key={p?.id ?? `s${i}`}
          style={{ width: `${100 / cols}%` as `${number}%`, paddingHorizontal: gap / 2 }}
        >
          {p ? <ProductCard product={p} index={i % cols} /> : <ProductSkeleton />}
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
          {p ? <ProductCard product={p} index={Math.min(i, 3)} /> : <ProductSkeleton />}
        </View>
      ))}
    </ScrollView>
  );
}

const useStyles = makeStyles(() => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.xxs },
  count: { marginBottom: spacing.md },
  more: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxl },
}));
