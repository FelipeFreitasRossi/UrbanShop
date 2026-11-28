import { Image } from 'expo-image';
import { Minus, Plus, X } from 'lucide-react-native';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Button } from '../components/ui/Button';
import { UText } from '../components/ui/UText';
import { getCategory } from '../config/navigation';
import { useRequest } from '../hooks/useRequest';
import { measureRect, useFly } from '../motion/FlyLayer';
import { friendlyError } from '../services/api';
import { getProductBySlug } from '../services/products';
import { makeStyles, useColors } from '../theme/ThemeProvider';
import { fonts, radius, spacing } from '../theme/tokens';
import { formatPrice } from '../utils/format';
import { useRequireAuth } from './authPrompt';
import { useCart } from './cart';
import type { QuickViewProduct } from './quickView';

type QuickAddValue = {
  /** Abre o painel de compra rápida (pede cadastro se for visitante). */
  open: (product: QuickViewProduct) => void;
};

const QuickAddContext = createContext<QuickAddValue | null>(null);

/**
 * Quick Add Bottom Sheet: escolhe tamanho e quantidade e adiciona à sacola
 * sem sair da página. A foto do produto "voa" até o ícone da sacola.
 */
export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const requireAuth = useRequireAuth();
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  const [visible, setVisible] = useState(false);

  const open = useCallback(
    (p: QuickViewProduct) =>
      requireAuth('buy', () => {
        setProduct(p);
        setVisible(true);
      }),
    [requireAuth],
  );
  const close = useCallback(() => setVisible(false), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <QuickAddContext.Provider value={value}>
      {children}
      <BottomSheet visible={visible} onClose={close} accessibilityLabel="Adicionar à sacola" maxWidth={480}>
        {product ? <QuickAddContent key={product.id} initial={product} onClose={close} /> : null}
      </BottomSheet>
    </QuickAddContext.Provider>
  );
}

function QuickAddContent({ initial, onClose }: { initial: QuickViewProduct; onClose: () => void }) {
  const styles = useStyles();
  const colors = useColors();
  const cart = useCart();
  const fly = useFly();
  const imageRef = useRef<View>(null);

  // Se vier resumido (sem tamanhos/estoque), busca o produto completo.
  const needsFetch = initial.sizes === undefined || initial.stock === undefined;
  const request = useRequest(
    () => (needsFetch ? getProductBySlug(initial.slug) : Promise.resolve(initial)),
    [initial.slug],
  );
  const product: QuickViewProduct = request.status === 'success' ? { ...initial, ...request.data } : initial;

  const sizes = product.sizes ?? [];
  const stock = product.stock ?? 0;
  const unitPrice =
    product.promotionalPrice && product.promotionalPrice < product.price
      ? product.promotionalPrice
      : product.price;
  const maxQty = Math.max(1, Math.min(10, stock));

  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sizes.length === 1) setSize(sizes[0]);
  }, [sizes]);

  const soldOut = request.status === 'success' && stock <= 0;
  const loading = request.status === 'loading';

  const add = async () => {
    if (sizes.length > 0 && !size) {
      setError('Escolha um tamanho.');
      return;
    }
    const from = await measureRect(imageRef.current);
    cart.add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      unitPrice,
      size,
      quantity: qty,
      maxQuantity: maxQty,
    });
    onClose();
    // O voo começa enquanto o painel fecha.
    setTimeout(() => fly('cart', from, { kind: 'image', uri: product.images[0] }), 120);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View ref={imageRef} collapsable={false} style={styles.thumb}>
          {product.images[0] ? (
            <Image
              source={{ uri: product.images[0] }}
              style={styles.thumbImage}
              contentFit="cover"
              transition={200}
            />
          ) : null}
        </View>
        <View style={styles.headerText}>
          <UText variant="caption" style={styles.category}>
            {getCategory(product.category)?.label ?? product.category}
          </UText>
          <UText variant="title" numberOfLines={2}>
            {product.name}
          </UText>
          <UText variant="price" color={colors.gold}>
            {formatPrice(unitPrice)}
          </UText>
        </View>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={10}>
          <X size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      {request.status === 'error' ? (
        <UText variant="small" color={colors.danger}>
          {friendlyError(request.error)}
        </UText>
      ) : null}

      {sizes.length > 0 ? (
        <View>
          <UText variant="label" style={styles.groupLabel}>
            Tamanho{size ? ` · ${size}` : ''}
          </UText>
          <View style={styles.chips}>
            {sizes.map((s) => (
              <Pressable
                key={s}
                onPress={() => {
                  setSize(s);
                  setError(null);
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

      <View style={styles.qtyRow}>
        <UText variant="label">Quantidade</UText>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            accessibilityRole="button"
            accessibilityLabel="Diminuir quantidade"
            style={[styles.stepBtn, qty <= 1 && styles.disabled]}
          >
            <Minus size={16} color={colors.text} />
          </Pressable>
          <UText variant="title" style={styles.qty}>
            {qty}
          </UText>
          <Pressable
            onPress={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={qty >= maxQty}
            accessibilityRole="button"
            accessibilityLabel="Aumentar quantidade"
            style={[styles.stepBtn, qty >= maxQty && styles.disabled]}
          >
            <Plus size={16} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {error ? (
        <UText variant="small" color={colors.danger}>
          {error}
        </UText>
      ) : null}

      <Button
        label={soldOut ? 'Esgotado' : `Adicionar à sacola · ${formatPrice(unitPrice * qty)}`}
        variant="gold"
        size="lg"
        fullWidth
        onPress={add}
        loading={loading}
        disabled={soldOut || request.status === 'error'}
      />
      <UText variant="caption" align="center">
        Preço e estoque são confirmados no fechamento do pedido.
      </UText>
    </ScrollView>
  );
}

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext);
  if (!ctx) throw new Error('useQuickAdd precisa estar dentro de <QuickAddProvider>.');
  return ctx.open;
}

const useStyles = makeStyles((colors) => ({
  content: { padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  thumb: {
    width: 76,
    height: 95,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  thumbImage: { width: '100%', height: '100%' },
  headerText: { flex: 1, gap: 3 },
  category: { textTransform: 'uppercase', letterSpacing: 1.2 },
  groupLabel: { marginBottom: spacing.xs },
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
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.pill,
  },
  stepBtn: { width: 42, height: 40, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.35 },
  qty: { minWidth: 28, textAlign: 'center' },
}));
