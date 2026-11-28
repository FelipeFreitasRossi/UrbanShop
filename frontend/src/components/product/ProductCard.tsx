import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { getCategory } from '../../config/navigation';
import { useInteraction } from '../../motion/useInteraction';
import { useFavorites } from '../../state/favorites';
import { colors, fonts, radius, spacing } from '../../theme/tokens';
import type { Product } from '../../types/product';
import { discountPercent, formatPrice } from '../../utils/format';
import { UText } from '../ui/UText';

type ProductCardProps = {
  product: Pick<Product, 'id' | 'slug' | 'name' | 'images' | 'price' | 'promotionalPrice' | 'category'> & {
    stock?: number;
  };
  style?: StyleProp<ViewStyle>;
};

/**
 * Card de produto: troca para a segunda foto no hover, zoom suave,
 * selo de desconto e botão de favoritar.
 */
export function ProductCard({ product, style }: ProductCardProps) {
  const { hover, pressStyle, handlers } = useInteraction(0.985);
  const favorites = useFavorites();
  const fav = favorites.isFavorite(product.id);

  const [cover, alt] = product.images;
  const sale = discountPercent(product.price, product.promotionalPrice);
  const soldOut = product.stock !== undefined && product.stock <= 0;
  const categoryLabel = getCategory(product.category)?.label ?? product.category;

  const coverStyle = useAnimatedStyle(() => ({
    opacity: alt ? interpolate(hover.value, [0, 1], [1, 0]) : 1,
    transform: [{ scale: interpolate(hover.value, [0, 1], [1, 1.04]) }],
  }));
  const altStyle = useAnimatedStyle(() => ({
    opacity: hover.value,
    transform: [{ scale: interpolate(hover.value, [0, 1], [1.06, 1.02]) }],
  }));

  return (
    <View style={[styles.card, style]}>
      <Link href={`/produto/${product.slug}`} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${product.name}, ${formatPrice(product.promotionalPrice ?? product.price)}`}
          {...handlers}
        >
          <Animated.View style={pressStyle}>
            <View style={styles.media}>
              {cover ? (
                <Animated.View style={[StyleSheet.absoluteFill, coverStyle]}>
                  <Image
                    source={{ uri: cover }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                  />
                </Animated.View>
              ) : null}
              {alt ? (
                <Animated.View style={[StyleSheet.absoluteFill, altStyle]}>
                  <Image source={{ uri: alt }} style={StyleSheet.absoluteFill} contentFit="cover" />
                </Animated.View>
              ) : null}

              <View style={styles.badges}>
                {sale > 0 ? (
                  <View style={[styles.badge, styles.badgeGold]}>
                    <UText style={styles.badgeTextDark}>-{sale}%</UText>
                  </View>
                ) : null}
                {soldOut ? (
                  <View style={styles.badge}>
                    <UText style={styles.badgeText}>Esgotado</UText>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.info}>
              <UText variant="caption" style={styles.category}>
                {categoryLabel}
              </UText>
              <UText variant="title" numberOfLines={2}>
                {product.name}
              </UText>
              <View style={styles.prices}>
                {product.promotionalPrice && sale > 0 ? (
                  <>
                    <UText variant="price" color={colors.gold}>
                      {formatPrice(product.promotionalPrice)}
                    </UText>
                    <UText variant="small" style={styles.strike}>
                      {formatPrice(product.price)}
                    </UText>
                  </>
                ) : (
                  <UText variant="price">{formatPrice(product.price)}</UText>
                )}
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </Link>

      <Pressable
        onPress={() =>
          favorites.toggle({
            id: product.id,
            slug: product.slug,
            name: product.name,
            images: product.images,
            price: product.price,
            promotionalPrice: product.promotionalPrice,
            category: product.category,
          })
        }
        accessibilityRole="button"
        accessibilityLabel={fav ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
        accessibilityState={{ selected: fav }}
        hitSlop={6}
        style={styles.favButton}
      >
        <Heart size={18} color={fav ? colors.gold : colors.white} fill={fav ? colors.gold : 'transparent'} strokeWidth={1.7} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { position: 'relative' },
  media: {
    aspectRatio: 4 / 5,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  badges: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 6 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  badgeGold: { backgroundColor: colors.gold },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 10.5, lineHeight: 13, color: colors.white, letterSpacing: 0.6, textTransform: 'uppercase' },
  badgeTextDark: { fontFamily: fonts.bodyBold, fontSize: 10.5, lineHeight: 13, color: colors.black, letterSpacing: 0.6 },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  info: { paddingTop: spacing.sm, gap: 4 },
  category: { textTransform: 'uppercase', letterSpacing: 1.4 },
  prices: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 2 },
  strike: { textDecorationLine: 'line-through', color: colors.textDim },
});
