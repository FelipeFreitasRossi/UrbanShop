import { Image } from 'expo-image';
import { LogIn, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { Container } from '../components/layout/Container';
import { Screen } from '../components/layout/Screen';
import { Section } from '../components/layout/Section';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { UText } from '../components/ui/UText';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Reveal } from '../motion/Reveal';
import { useCart, type CartItem } from '../state/cart';
import { makeStyles, useColors } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';
import { formatPrice } from '../utils/format';

/**
 * Sacola. Comprar exige cadastro. O fechamento do pedido (frete, cupons, pontos e
 * pagamento pelo Mercado Pago) é construído na Etapa 6, com o servidor recalculando
 * preços e estoque.
 */
export default function CartPage() {
  const styles = useStyles();
  const { items, count, subtotal, enabled } = useCart();
  const { isDesktop } = useBreakpoint();

  return (
    <Screen title="Sacola" noIndex>
      <Section tight>
        <Container>
          <Reveal variant="fade">
            <UText variant="eyebrow">Sua compra</UText>
          </Reveal>
          <Reveal delay={80}>
            <UText variant="h1" style={styles.title}>
              Sacola{count > 0 ? ` (${count})` : ''}
            </UText>
          </Reveal>

          {!enabled ? (
            <EmptyState
              icon={LogIn}
              title="Entre para comprar"
              message="As compras são exclusivas para clientes cadastrados. Assim você acompanha seus pedidos e ganha pontos no cartão fidelidade."
              action={{ label: 'Criar conta', href: '/cadastro' }}
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Sua sacola está vazia"
              message="Toque no + dos produtos para adicionar suas peças favoritas."
              action={{ label: 'Ver produtos', href: '/produtos' }}
            />
          ) : (
            <View style={[styles.layout, { flexDirection: isDesktop ? 'row' : 'column' }]}>
              <View style={[styles.list, isDesktop && { flex: 1.6 }]}>
                {items.map((item) => (
                  <CartRow key={item.key} item={item} />
                ))}
              </View>

              <View style={[styles.summary, isDesktop && { flex: 1 }]}>
                <UText variant="h3">Resumo</UText>
                <View style={styles.summaryRow}>
                  <UText variant="body">Subtotal</UText>
                  <UText variant="price">{formatPrice(subtotal)}</UText>
                </View>
                <View style={styles.summaryRow}>
                  <UText variant="body">Frete</UText>
                  <UText variant="small">Calculado no fechamento</UText>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <UText variant="title">Total estimado</UText>
                  <UText variant="h3">{formatPrice(subtotal)}</UText>
                </View>
                <Button label="Finalizar compra" variant="gold" size="lg" fullWidth disabled />
                <UText variant="caption" align="center">
                  O fechamento do pedido com frete e pagamento será liberado em breve. Preços e estoque são
                  confirmados nessa etapa.
                </UText>
              </View>
            </View>
          )}
        </Container>
      </Section>
    </Screen>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const styles = useStyles();
  const colors = useColors();
  const { setQuantity, remove } = useCart();

  return (
    <Animated.View layout={LinearTransition} exiting={FadeOut} style={styles.row}>
      <View style={styles.thumb}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.thumbImage} contentFit="cover" />
        ) : null}
      </View>
      <View style={styles.rowInfo}>
        <UText variant="title" numberOfLines={2}>
          {item.name}
        </UText>
        {item.size ? <UText variant="small">Tamanho {item.size}</UText> : null}
        <UText variant="price">{formatPrice(item.unitPrice * item.quantity)}</UText>
        <View style={styles.rowActions}>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => setQuantity(item.key, item.quantity - 1)}
              disabled={item.quantity <= 1}
              accessibilityRole="button"
              accessibilityLabel="Diminuir quantidade"
              style={[styles.stepBtn, item.quantity <= 1 && styles.disabled]}
            >
              <Minus size={14} color={colors.text} />
            </Pressable>
            <UText variant="title" style={styles.qty}>
              {item.quantity}
            </UText>
            <Pressable
              onPress={() => setQuantity(item.key, item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
              accessibilityRole="button"
              accessibilityLabel="Aumentar quantidade"
              style={[styles.stepBtn, item.quantity >= item.maxQuantity && styles.disabled]}
            >
              <Plus size={14} color={colors.text} />
            </Pressable>
          </View>
          <Pressable
            onPress={() => remove(item.key)}
            accessibilityRole="button"
            accessibilityLabel={`Remover ${item.name}`}
            hitSlop={8}
            style={styles.remove}
          >
            <Trash2 size={16} color={colors.textMuted} />
            <UText variant="small">Remover</UText>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  title: { marginTop: spacing.sm, marginBottom: spacing.xl },
  layout: { gap: spacing.xl, alignItems: 'flex-start' },
  list: { width: '100%', gap: spacing.md },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ink,
  },
  thumb: {
    width: 88,
    height: 110,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  thumbImage: { width: '100%', height: '100%' },
  rowInfo: { flex: 1, gap: 4 },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.pill,
  },
  stepBtn: { width: 34, height: 32, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.35 },
  qty: { minWidth: 22, textAlign: 'center' },
  remove: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summary: {
    width: '100%',
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  divider: { height: 1, backgroundColor: colors.line },
}));
