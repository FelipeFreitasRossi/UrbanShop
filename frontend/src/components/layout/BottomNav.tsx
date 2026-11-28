import { Link, usePathname } from 'expo-router';
import { Heart, House, Shirt, ShoppingBag, User, type LucideIcon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlyTargetView } from '../../motion/FlyTargetView';
import type { FlyTargetName } from '../../motion/FlyLayer';
import { useCart } from '../../state/cart';
import { useFavorites } from '../../state/favorites';
import { makeStyles, useColors } from '../../theme/ThemeProvider';
import { fonts, layout } from '../../theme/tokens';
import { isActivePath } from '../../utils/path';
import { GlassBackground } from '../ui/GlassBackground';
import { UText } from '../ui/UText';

type Tab = { label: string; href: string; icon: LucideIcon; target?: FlyTargetName };

const TABS: Tab[] = [
  { label: 'Início', href: '/', icon: House },
  { label: 'Produtos', href: '/produtos', icon: Shirt },
  { label: 'Favoritos', href: '/favoritos', icon: Heart, target: 'wishlist' },
  { label: 'Sacola', href: '/carrinho', icon: ShoppingBag, target: 'cart' },
  { label: 'Conta', href: '/perfil', icon: User },
];

const FLOAT_MARGIN = 12;

/** Espaço que o conteúdo precisa deixar livre embaixo por causa da barra flutuante. */
export function useBottomNavHeight() {
  const insets = useSafeAreaInsets();
  return layout.bottomNavHeight + Math.max(insets.bottom, 10) + FLOAT_MARGIN + 8;
}

/**
 * Floating Bottom Navigation: barra em formato de cápsula que flutua sobre o conteúdo,
 * com indicador dourado deslizante e ícones que "pulam" ao receber favoritos e itens.
 */
export function BottomNav() {
  const styles = useStyles();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const favorites = useFavorites();
  const cart = useCart();

  // -1 quando a página atual não é uma das abas (ex.: login): nenhum indicador.
  const activeIndex = TABS.findIndex((t) => isActivePath(pathname, t.href));
  const hasActive = activeIndex >= 0;
  const tabWidth = useSharedValue(0);
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    if (activeIndex >= 0) indicatorX.set(withSpring(activeIndex, { damping: 18, stiffness: 200 }));
  }, [activeIndex, indicatorX]);

  const onLayout = (e: LayoutChangeEvent) => tabWidth.set(e.nativeEvent.layout.width / TABS.length);

  const indicator = useAnimatedStyle(() => ({
    opacity: hasActive ? 1 : 0,
    width: Math.max(0, tabWidth.value - 12),
    transform: [{ translateX: indicatorX.value * tabWidth.value + 6 }],
  }));

  return (
    <View
      style={[styles.wrapper, { bottom: Math.max(insets.bottom, 10) }]}
      accessibilityRole="tablist"
      pointerEvents="box-none"
    >
      <View style={styles.pill}>
        <GlassBackground tint={0.78} intensity={60} />
        <View style={styles.border} pointerEvents="none" />
        <View style={styles.row} onLayout={onLayout}>
          <Animated.View style={[styles.indicator, indicator]} pointerEvents="none" />
          {TABS.map((tab, i) => (
            <TabButton
              key={tab.href}
              tab={tab}
              active={i === activeIndex}
              badge={tab.target === 'wishlist' ? favorites.count : tab.target === 'cart' ? cart.count : 0}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function TabButton({ tab, active, badge }: { tab: Tab; active: boolean; badge: number }) {
  const styles = useStyles();
  const colors = useColors();
  const Icon = tab.icon;

  const icon = (
    <View>
      <Icon size={21} color={active ? colors.gold : colors.textMuted} strokeWidth={active ? 2 : 1.6} />
      {badge > 0 ? (
        <View style={styles.badge}>
          <UText style={styles.badgeText}>{badge > 9 ? '9+' : String(badge)}</UText>
        </View>
      ) : null}
    </View>
  );

  return (
    <Link href={tab.href} asChild>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={badge > 0 ? `${tab.label}, ${badge} itens` : tab.label}
        style={styles.tab}
      >
        {tab.target ? (
          <FlyTargetView name={tab.target} priority={2}>
            {icon}
          </FlyTargetView>
        ) : (
          icon
        )}
        <UText
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
          style={[styles.label, { color: active ? colors.text : colors.textDim }]}
        >
          {tab.label}
        </UText>
      </Pressable>
    </Link>
  );
}

const useStyles = makeStyles((colors) => ({
  wrapper: {
    position: 'absolute',
    left: FLOAT_MARGIN,
    right: FLOAT_MARGIN,
    zIndex: 40,
  },
  pill: {
    height: layout.bottomNavHeight,
    borderRadius: layout.bottomNavHeight / 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: layout.bottomNavHeight / 2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  row: { flex: 1, flexDirection: 'row' },
  indicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 0,
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 10.5, lineHeight: 13, textAlign: 'center' },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 9, lineHeight: 11, color: colors.black },
}));
