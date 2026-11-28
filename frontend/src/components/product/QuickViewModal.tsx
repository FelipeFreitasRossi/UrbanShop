import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCategory } from '../../config/navigation';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useRequest } from '../../hooks/useRequest';
import { easeOutExpo } from '../../motion/easing';
import { getProductBySlug } from '../../services/products';
import { measureRect, useFly } from '../../motion/FlyLayer';
import { useAuth } from '../../state/auth';
import { useRequireAuth } from '../../state/authPrompt';
import { useCart } from '../../state/cart';
import { useFavorites } from '../../state/favorites';
import type { QuickViewProduct } from '../../state/quickView';
import { fonts, radius, spacing } from '../../theme/tokens';
import { discountPercent, formatPrice } from '../../utils/format';
import { Button } from '../ui/Button';
import { UText } from '../ui/UText';
import { onDark } from '../../theme/palettes';
import { makeStyles, useColors } from '../../theme/ThemeProvider';

type QuickViewModalProps = {
  product: QuickViewProduct;
  visible: boolean;
  onClose: () => void;
  /** Chamado quando a animação de saída termina. */
  onClosed: () => void;
};

/**
 * Popup do produto: no celular sobe de baixo (bottom sheet);
 * no tablet/desktop aparece centralizado com foto ao lado das informações.
 */
export function QuickViewModal({ product, visible, onClose, onClosed }: QuickViewModalProps) {
  const styles = useStyles();
  const reduce = useReducedMotion();
  const { isMobile, width, height } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.set(withTiming(1, { duration: reduce ? 0 : 420, easing: easeOutExpo }));
      return;
    }
    progress.set(withTiming(0, { duration: reduce ? 0 : 240 }));
    const t = setTimeout(onClosed, reduce ? 0 : 250);
    return () => clearTimeout(t);
  }, [visible, reduce, progress, onClosed]);

  const backdrop = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheet = useAnimatedStyle(() =>
    isMobile
      ? { transform: [{ translateY: interpolate(progress.value, [0, 1], [height * 0.6, 0]) }] }
      : {
          opacity: progress.value,
          transform: [{ scale: interpolate(progress.value, [0, 1], [0.96, 1]) }],
        },
  );

  const sheetWidth = isMobile ? width : Math.min(960, width - 64);
  const galleryWidth = isMobile ? sheetWidth : Math.round(sheetWidth * 0.5);
  const galleryHeight = isMobile
    ? Math.min(galleryWidth * 1.15, height * 0.48)
    : Math.min(galleryWidth * 1.25, height * 0.84);

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.root, isMobile ? styles.rootMobile : styles.rootCenter]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fechar" />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            isMobile ? styles.sheetMobile : styles.sheetDesktop,
            { width: sheetWidth, maxHeight: isMobile ? height * 0.92 : height * 0.86 },
            sheet,
          ]}
          accessibilityViewIsModal
        >
          {isMobile ? <View style={styles.handle} /> : null}

          {/* No celular: foto em cima e informações roláveis embaixo. No desktop: lado a lado. */}
          <View style={isMobile ? styles.columnLayout : [styles.rowLayout, { height: galleryHeight }]}>
            <Gallery
              images={product.images}
              width={galleryWidth}
              height={galleryHeight}
              name={product.name}
            />
            <Details
              product={product}
              onClose={onClose}
              bottomInset={isMobile ? insets.bottom : 0}
              wide={!isMobile}
            />
          </View>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            hitSlop={8}
            style={styles.close}
          >
            <X size={20} color={onDark.white} />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Gallery({
  images,
  width,
  height,
  name,
}: {
  images: string[];
  width: number;
  height: number;
  name: string;
}) {
  const colors = useColors();
  const styles = useStyles();
  const [index, setIndex] = useState(0);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={{ width, height, backgroundColor: colors.surface }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onEnd}
        onScroll={onEnd}
        scrollEventThrottle={200}
      >
        {images.map((uri, i) => (
          <Image
            key={uri}
            source={{ uri }}
            style={{ width, height }}
            contentFit="cover"
            transition={250}
            accessibilityLabel={`${name}, foto ${i + 1}`}
          />
        ))}
      </ScrollView>
      {images.length > 1 ? (
        <View style={styles.dots} pointerEvents="none">
          {images.map((uri, i) => (
            <View key={uri} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Details({
  product: initial,
  onClose,
  bottomInset,
  wide,
}: {
  product: QuickViewProduct;
  onClose: () => void;
  bottomInset: number;
  wide: boolean;
}) {
  const colors = useColors();
  const styles = useStyles();
  const router = useRouter();
  const favorites = useFavorites();
  const cart = useCart();
  const fly = useFly();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const addRef = useRef<View>(null);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  // Se o card trouxe dados resumidos (ex.: favoritos), busca o produto completo.
  const needsFetch = initial.sizes === undefined || initial.description === undefined;
  const request = useRequest(
    () => (needsFetch ? getProductBySlug(initial.slug) : Promise.resolve(initial)),
    [initial.slug],
  );
  const product: QuickViewProduct = request.status === 'success' ? { ...initial, ...request.data } : initial;

  const fav = favorites.isFavorite(product.id);
  const sale = discountPercent(product.price, product.promotionalPrice);
  const soldOut = product.stock !== undefined && product.stock <= 0;
  const lowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;

  const goToProduct = () => {
    onClose();
    router.push(`/produto/${product.slug}`);
  };

  // Visitante: fecha o popup e mostra o convite de cadastro (comprar/curtir exige conta).
  const askToSignUp = (reason: 'buy' | 'like') => {
    onClose();
    setTimeout(() => requireAuth(reason, () => {}), 280);
  };

  const addToCart = async () => {
    if (!user) return askToSignUp('buy');
    const sizes = product.sizes ?? [];
    if (sizes.length > 0 && !size) {
      setSizeError('Escolha um tamanho.');
      return;
    }
    const from = await measureRect(addRef.current);
    const unitPrice =
      product.promotionalPrice && product.promotionalPrice < product.price
        ? product.promotionalPrice
        : product.price;
    cart.add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      unitPrice,
      size,
      quantity: 1,
      maxQuantity: Math.max(1, Math.min(10, product.stock ?? 1)),
    });
    onClose();
    // Add to Cart Animation: a foto voa até a sacola depois que o popup fecha.
    setTimeout(() => fly('cart', from, { kind: 'image', uri: product.images[0] }), 280);
  };

  const toggleFavorite = () => {
    if (!user) return askToSignUp('like');
    favorites.toggle(product);
  };

  return (
    <ScrollView
      style={wide ? styles.detailsWide : styles.detailsNarrow}
      contentContainerStyle={[styles.detailsContent, { paddingBottom: spacing.lg + bottomInset }]}
      showsVerticalScrollIndicator={false}
    >
      <UText variant="eyebrow">{getCategory(product.category)?.title ?? product.category}</UText>
      <UText variant="h3" style={styles.name}>
        {product.name}
      </UText>

      <View style={styles.prices}>
        {product.promotionalPrice && sale > 0 ? (
          <>
            <UText variant="price" color={colors.gold} style={styles.priceBig}>
              {formatPrice(product.promotionalPrice)}
            </UText>
            <UText variant="small" style={styles.strike}>
              {formatPrice(product.price)}
            </UText>
            <View style={styles.saleBadge}>
              <UText style={styles.saleText}>-{sale}%</UText>
            </View>
          </>
        ) : (
          <UText variant="price" style={styles.priceBig}>
            {formatPrice(product.price)}
          </UText>
        )}
      </View>

      {soldOut ? (
        <UText variant="small" color={colors.danger}>
          Esgotado no momento
        </UText>
      ) : lowStock ? (
        <UText variant="small" color={colors.gold}>
          Últimas unidades
        </UText>
      ) : null}

      {product.sizes && product.sizes.length > 0 ? (
        <View>
          <UText variant="label" style={styles.groupLabel}>
            Tamanho{size ? ` · ${size}` : ''}
          </UText>
          <View style={styles.chips}>
            {product.sizes.map((s) => (
              <Pressable
                key={s}
                onPress={() => {
                  setSize(s);
                  setSizeError(null);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: s === size }}
                style={[styles.size, s === size && styles.sizeActive]}
              >
                <UText style={[styles.sizeText, s === size && { color: colors.black }]}>{s}</UText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {product.colors && product.colors.length > 0 ? (
        <View>
          <UText variant="label" style={styles.groupLabel}>
            Cores
          </UText>
          <View style={styles.chips}>
            {product.colors.map((c) => (
              <View key={c.name} style={styles.colorItem} accessible accessibilityLabel={c.name}>
                <View style={[styles.swatch, { backgroundColor: c.hex }]} />
                <UText variant="small">{c.name}</UText>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {product.description ? (
        <UText variant="body" numberOfLines={4} style={styles.description}>
          {product.description}
        </UText>
      ) : request.status === 'loading' ? (
        <View style={styles.loadingLines}>
          <View style={[styles.loadingLine, { width: '90%' }]} />
          <View style={[styles.loadingLine, { width: '70%' }]} />
        </View>
      ) : null}

      {sizeError ? (
        <UText variant="small" color={colors.danger}>
          {sizeError}
        </UText>
      ) : null}

      <View style={styles.actions}>
        <View ref={addRef} collapsable={false}>
          <Button
            label={soldOut ? 'Esgotado' : 'Adicionar à sacola'}
            onPress={addToCart}
            variant="gold"
            fullWidth
            disabled={soldOut}
          />
        </View>
        <View style={styles.secondaryRow}>
          <Pressable
            onPress={toggleFavorite}
            accessibilityRole="button"
            accessibilityState={{ selected: fav }}
            style={styles.favButton}
          >
            <Heart size={18} color={colors.gold} fill={fav ? colors.gold : 'transparent'} strokeWidth={1.7} />
            <UText variant="label">{fav ? 'Nos favoritos' : 'Curtir'}</UText>
          </Pressable>
          <Button label="Ver detalhes" onPress={goToProduct} variant="ghost" arrow />
        </View>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1 },
  rootMobile: { justifyContent: 'flex-end' },
  rootCenter: { justifyContent: 'center', alignItems: 'center' },
  backdrop: { backgroundColor: 'rgba(0,0,0,0.72)' },
  sheet: {
    backgroundColor: colors.ink,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  sheetMobile: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  sheetDesktop: { borderRadius: radius.lg },
  handle: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: 2,
  },
  close: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: colors.gold, width: 16 },
  columnLayout: { flexDirection: 'column', flexShrink: 1 },
  rowLayout: { flexDirection: 'row' },
  detailsNarrow: { flexGrow: 0, flexShrink: 1 },
  detailsWide: { flex: 1 },
  detailsContent: { padding: spacing.lg, gap: spacing.sm },
  name: { marginTop: 2 },
  prices: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  priceBig: { fontSize: 20, lineHeight: 26 },
  strike: { textDecorationLine: 'line-through', color: colors.textDim },
  saleBadge: {
    backgroundColor: colors.gold,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saleText: { fontFamily: fonts.bodyBold, fontSize: 11, lineHeight: 14, color: colors.black },
  groupLabel: { marginTop: spacing.sm, marginBottom: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  size: {
    minWidth: 48,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeActive: { backgroundColor: colors.white, borderColor: colors.white },
  sizeText: { fontFamily: fonts.bodySemiBold, fontSize: 13, lineHeight: 16, color: colors.text },
  colorItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 8 },
  swatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.lineStrong },
  description: { marginTop: spacing.sm },
  loadingLines: { gap: 8, marginTop: spacing.sm },
  loadingLine: { height: 10, borderRadius: 5, backgroundColor: colors.surfaceRaised },
  actions: { marginTop: spacing.md, gap: spacing.xs },
  secondaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  favButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
}));
