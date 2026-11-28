import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { getCategory } from '../../config/navigation';
import { useRevealProgress } from '../../motion/Reveal';
import { useInteraction } from '../../motion/useInteraction';
import { useQuickAdd } from '../../state/quickAdd';
import { useQuickView, type QuickViewProduct } from '../../state/quickView';
import { onDark } from '../../theme/palettes';
import { makeStyles, useColors } from '../../theme/ThemeProvider';
import { fonts, radius, spacing } from '../../theme/tokens';
import { discountPercent, formatPrice } from '../../utils/format';
import { UText } from '../ui/UText';
import { HeartButton } from './HeartButton';

type ProductCardProps = {
  product: QuickViewProduct;
  style?: StyleProp<ViewStyle>;
  /** Posição na lista: cria o efeito escalonado (stagger) da entrada. */
  index?: number;
};

/**
 * Card de produto com:
 * - Product Reveal: uma cortina sobe revelando a foto, que desce de um leve zoom;
 * - troca para a segunda foto no hover (desktop);
 * - coração animado (curtir) e botão "+" de compra rápida — ambos exigem cadastro;
 * - toque no card abre o popup do produto.
 */
export function ProductCard({ product, style, index = 0 }: ProductCardProps) {
  const colors = useColors();
  const styles = useStyles();
  const { hover, pressStyle, handlers } = useInteraction(0.985);
  const quickView = useQuickView();
  const quickAdd = useQuickAdd();
  const reveal = useRevealProgress({ delay: (index % 4) * 110, duration: 1000 });

  const [cover, alt] = product.images;
  const sale = discountPercent(product.price, product.promotionalPrice);
  const soldOut = product.stock !== undefined && product.stock <= 0;
  const categoryLabel = getCategory(product.category)?.label ?? product.category;

  // ---- Entrada (Product Reveal) ----
  const mediaHeight = useSharedValue(400);
  const curtain = useAnimatedStyle(() => ({
    transform: [{ translateY: -reveal.progress.value * (mediaHeight.value + 4) }],
  }));
  const imageIn = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(reveal.progress.value, [0, 1], [1.18, 1]) }],
  }));
  const infoIn = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.progress.value, [0.35, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(reveal.progress.value, [0.35, 1], [14, 0], Extrapolation.CLAMP) }],
  }));
  const actionsIn = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.progress.value, [0.6, 1], [0, 1], Extrapolation.CLAMP),
  }));

  // ---- Hover ----
  const coverStyle = useAnimatedStyle(() => ({
    opacity: alt ? interpolate(hover.value, [0, 1], [1, 0]) : 1,
    transform: [{ scale: interpolate(hover.value, [0, 1], [1, 1.04]) }],
  }));
  const altStyle = useAnimatedStyle(() => ({
    opacity: hover.value,
    transform: [{ scale: interpolate(hover.value, [0, 1], [1.06, 1.02]) }],
  }));

  return (
    <View ref={reveal.ref} collapsable={false} onLayout={reveal.onLayout} style={[styles.card, style]}>
      <Pressable
        onPress={() => quickView.open(product)}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${formatPrice(product.promotionalPrice ?? product.price)}`}
        accessibilityHint="Abre os detalhes do produto"
        {...handlers}
      >
        <Animated.View style={pressStyle}>
          <View style={styles.media} onLayout={(e) => mediaHeight.set(e.nativeEvent.layout.height)}>
            <Animated.View style={[StyleSheet.absoluteFill, imageIn]}>
              {cover ? (
                <Animated.View style={[StyleSheet.absoluteFill, coverStyle]}>
                  <Image
                    source={{ uri: cover }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                    recyclingKey={cover}
                  />
                </Animated.View>
              ) : null}
              {alt ? (
                <Animated.View style={[StyleSheet.absoluteFill, altStyle]}>
                  <Image source={{ uri: alt }} style={StyleSheet.absoluteFill} contentFit="cover" />
                </Animated.View>
              ) : null}
            </Animated.View>

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

            {!soldOut ? (
              <Animated.View style={[styles.quickAddWrap, actionsIn]}>
                <Pressable
                  onPress={() => quickAdd(product)}
                  accessibilityRole="button"
                  accessibilityLabel={`Adicionar ${product.name} à sacola`}
                  hitSlop={6}
                  style={styles.quickAdd}
                >
                  <Plus size={18} color={onDark.black} strokeWidth={2.4} />
                </Pressable>
              </Animated.View>
            ) : null}

            {/* Cortina que sobe na entrada */}
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.curtain, curtain]}>
              <View style={styles.curtainLine} />
            </Animated.View>
          </View>

          <Animated.View style={[styles.info, infoIn]}>
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
          </Animated.View>
        </Animated.View>
      </Pressable>

      <Animated.View style={[styles.heart, actionsIn]}>
        <HeartButton product={product} />
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: { position: 'relative' },
  media: {
    aspectRatio: 4 / 5,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  curtain: { backgroundColor: colors.surfaceRaised, justifyContent: 'flex-end' },
  curtainLine: { height: 2, backgroundColor: colors.gold },
  badges: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 6 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  badgeGold: { backgroundColor: colors.gold },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    lineHeight: 13,
    color: onDark.white,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  badgeTextDark: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    lineHeight: 13,
    color: colors.black,
    letterSpacing: 0.6,
  },
  heart: { position: 'absolute', top: 8, right: 8 },
  quickAddWrap: { position: 'absolute', right: 10, bottom: 10 },
  quickAdd: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: onDark.white,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  info: { paddingTop: spacing.sm, gap: 4 },
  category: { textTransform: 'uppercase', letterSpacing: 1.4 },
  prices: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 2 },
  strike: { textDecorationLine: 'line-through', color: colors.textDim },
}));
