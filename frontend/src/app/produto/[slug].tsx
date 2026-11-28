import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Heart, PackageSearch, RefreshCw } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Container } from '../../components/layout/Container';
import { Screen } from '../../components/layout/Screen';
import { Section } from '../../components/layout/Section';
import { EmptyState } from '../../components/ui/EmptyState';
import { UText } from '../../components/ui/UText';
import { getCategory } from '../../config/navigation';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useRequest } from '../../hooks/useRequest';
import { Reveal } from '../../motion/Reveal';
import { ApiError, friendlyError } from '../../services/api';
import { getProductBySlug } from '../../services/products';
import { useFavorites } from '../../state/favorites';
import { colors, fonts, radius, spacing } from '../../theme/tokens';
import { discountPercent, formatPrice } from '../../utils/format';

/**
 * Página do produto (versão inicial). Galeria completa, seleção de cor,
 * quantidade, produtos relacionados e "adicionar à sacola" chegam nas Etapas 3 e 6.
 */
export default function ProductPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const request = useRequest(() => getProductBySlug(String(slug)), [slug]);
  const { isDesktop } = useBreakpoint();
  const favorites = useFavorites();
  const [size, setSize] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  if (request.status === 'error') {
    const notFound = request.error instanceof ApiError && request.error.status === 404;
    return (
      <Screen title="Produto" noIndex>
        <Section>
          <Container>
            <EmptyState
              icon={notFound ? PackageSearch : RefreshCw}
              title={notFound ? 'Produto não encontrado' : 'Não foi possível carregar'}
              message={notFound ? 'Este produto pode ter sido removido.' : friendlyError(request.error)}
              action={
                notFound
                  ? { label: 'Ver novidades', href: '/novidades' }
                  : { label: 'Tentar novamente', onPress: request.reload }
              }
            />
          </Container>
        </Section>
      </Screen>
    );
  }

  if (request.status === 'loading') {
    return (
      <Screen title="Produto" noIndex>
        <Section>
          <Container>
            <View style={[styles.layout, { flexDirection: isDesktop ? 'row' : 'column' }]}>
              <View style={[styles.gallery, styles.placeholder, isDesktop && { flex: 1.2 }]} />
              <View style={[styles.info, isDesktop && { flex: 1 }]}>
                <View style={[styles.placeholder, { height: 14, width: '30%', borderRadius: 7 }]} />
                <View style={[styles.placeholder, { height: 34, width: '80%', borderRadius: 8 }]} />
                <View style={[styles.placeholder, { height: 20, width: '25%', borderRadius: 8 }]} />
              </View>
            </View>
          </Container>
        </Section>
      </Screen>
    );
  }

  const product = request.data;
  const fav = favorites.isFavorite(product.id);
  const sale = discountPercent(product.price, product.promotionalPrice);
  const images = product.images.length ? product.images : [];

  return (
    <Screen title={product.name} description={product.description.slice(0, 155)} image={images[0]}>
      <Section tight>
        <Container>
          <View style={[styles.layout, { flexDirection: isDesktop ? 'row' : 'column' }]}>
            <Reveal variant="fade" style={isDesktop ? { flex: 1.2 } : styles.fullWidth}>
              <View style={styles.gallery}>
                {images[imageIndex] ? (
                  <Image
                    source={{ uri: images[imageIndex] }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={300}
                    accessibilityLabel={product.name}
                  />
                ) : null}
              </View>
              {images.length > 1 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
                  {images.map((uri, i) => (
                    <Pressable
                      key={uri}
                      onPress={() => setImageIndex(i)}
                      accessibilityRole="button"
                      accessibilityLabel={`Foto ${i + 1}`}
                      style={[styles.thumb, i === imageIndex && styles.thumbActive]}
                    >
                      <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}
            </Reveal>

            <View style={[styles.info, isDesktop && { flex: 1 }]}>
              <Reveal variant="fade">
                <UText variant="eyebrow">{getCategory(product.category)?.title ?? product.category}</UText>
              </Reveal>
              <Reveal delay={80}>
                <UText variant="h2">{product.name}</UText>
              </Reveal>
              <Reveal delay={140}>
                <View style={styles.prices}>
                  {product.promotionalPrice && sale > 0 ? (
                    <>
                      <UText variant="h3" color={colors.gold}>
                        {formatPrice(product.promotionalPrice)}
                      </UText>
                      <UText variant="body" style={styles.strike}>
                        {formatPrice(product.price)}
                      </UText>
                      <UText variant="label" color={colors.gold}>
                        -{sale}%
                      </UText>
                    </>
                  ) : (
                    <UText variant="h3">{formatPrice(product.price)}</UText>
                  )}
                </View>
              </Reveal>

              {product.sizes.length > 0 ? (
                <Reveal delay={200}>
                  <UText variant="label" style={styles.groupLabel}>
                    Tamanho {size ? `· ${size}` : ''}
                  </UText>
                  <View style={styles.sizes}>
                    {product.sizes.map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => setSize(s)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: s === size }}
                        style={[styles.size, s === size && styles.sizeActive]}
                      >
                        <UText style={[styles.sizeText, s === size && { color: colors.black }]}>{s}</UText>
                      </Pressable>
                    ))}
                  </View>
                </Reveal>
              ) : null}

              <Reveal delay={260}>
                <Pressable
                  onPress={() => favorites.toggle(product)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: fav }}
                  style={styles.favorite}
                >
                  <Heart size={18} color={colors.gold} fill={fav ? colors.gold : 'transparent'} strokeWidth={1.7} />
                  <UText variant="label">{fav ? 'Nos seus favoritos' : 'Adicionar aos favoritos'}</UText>
                </Pressable>
              </Reveal>

              <Reveal delay={320}>
                <UText variant="body" style={styles.description}>
                  {product.description}
                </UText>
                <UText variant="caption" style={styles.sku}>
                  SKU {product.sku}
                </UText>
              </Reveal>
            </View>
          </View>
        </Container>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: { gap: spacing.xxl, alignItems: 'flex-start' },
  gallery: {
    aspectRatio: 4 / 5,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    width: '100%',
  },
  placeholder: { backgroundColor: colors.surfaceRaised },
  fullWidth: { width: '100%' },
  thumbs: { gap: 10, marginTop: 12 },
  thumb: {
    width: 64,
    height: 80,
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  thumbActive: { borderColor: colors.gold },
  info: { gap: spacing.md, width: '100%', maxWidth: 520 },
  prices: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  strike: { textDecorationLine: 'line-through', color: colors.textDim },
  groupLabel: { marginTop: spacing.md, marginBottom: spacing.sm },
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  size: {
    minWidth: 52,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeActive: { backgroundColor: colors.white, borderColor: colors.white },
  sizeText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.text },
  favorite: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, marginTop: spacing.sm },
  description: { marginTop: spacing.md },
  sku: { marginTop: spacing.md },
});
