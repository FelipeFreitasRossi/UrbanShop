import { BlurView } from 'expo-blur';
import { Link, usePathname } from 'expo-router';
import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAIN_NAV, type NavItem } from '../../config/navigation';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { usePageScroll } from '../../motion/PageScroll';
import { useInteraction } from '../../motion/useInteraction';
import { useFavorites } from '../../state/favorites';
import { colors, fonts, layout } from '../../theme/tokens';
import { isActivePath } from '../../utils/path';
import { Logo } from '../brand/Logo';
import { IconButton } from '../ui/IconButton';
import { MobileMenu } from './MobileMenu';

/** Altura total ocupada pelo header (inclui a área segura do topo no celular). */
/** Largura mínima para exibir todos os links do menu no header. */
const FULL_NAV_MIN_WIDTH = 1200;

export function useHeaderHeight() {
  const { width } = useBreakpoint();
  const insets = useSafeAreaInsets();
  return width >= FULL_NAV_MIN_WIDTH
    ? layout.headerHeightDesktop
    : layout.headerHeightMobile + insets.top;
}

/**
 * Header fixo. Começa transparente e, ao rolar, ganha fundo preto
 * translúcido com desfoque (blur) e uma linha inferior sutil.
 */
export function Header() {
  const { isMobile, width } = useBreakpoint();
  const isDesktop = width >= FULL_NAV_MIN_WIDTH;
  const roomy = width >= 1400;
  const { scrollY } = usePageScroll();
  const insets = useSafeAreaInsets();
  const favorites = useFavorites();
  const pathname = usePathname();
  const height = useHeaderHeight();
  const [menuOpen, setMenuOpen] = useState(false);

  const backdrop = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 140], [0, 1], Extrapolation.CLAMP),
  }));
  const border = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [60, 200], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={[styles.wrapper, { height }]} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, backdrop]} pointerEvents="none">
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.tint]} />
      </Animated.View>
      <Animated.View style={[styles.border, border]} pointerEvents="none" />

      <View
        style={[
          styles.bar,
          {
            paddingTop: isDesktop ? 0 : insets.top,
            paddingHorizontal: isDesktop ? (roomy ? 48 : 28) : 12,
          },
        ]}
      >
        {isDesktop ? (
          <>
            <Logo size={22} linkHome />
            <View style={[styles.nav, { gap: roomy ? 22 : 15 }]}>
              {MAIN_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  compact={!roomy}
                  active={isActivePath(pathname, item.href)}
                />
              ))}
            </View>
            <View style={styles.actions}>
              <IconButton icon={Search} label="Pesquisar" href="/busca" active={pathname === '/busca'} />
              <IconButton
                icon={Heart}
                label={`Favoritos (${favorites.count})`}
                href="/favoritos"
                badge={favorites.count}
                active={pathname === '/favoritos'}
              />
              <IconButton icon={ShoppingBag} label="Sacola" href="/carrinho" active={pathname === '/carrinho'} />
              <IconButton icon={User} label="Minha conta" href="/perfil" active={pathname === '/perfil'} />
            </View>
          </>
        ) : (
          <>
            <IconButton icon={Menu} label="Abrir menu" onPress={() => setMenuOpen(true)} />
            <View style={styles.centerLogo} pointerEvents="box-none">
              <Logo size={isMobile ? 18 : 20} linkHome />
            </View>
            <View style={styles.actions}>
              <IconButton icon={Search} label="Pesquisar" href="/busca" />
              {!isMobile ? (
                <IconButton
                  icon={Heart}
                  label={`Favoritos (${favorites.count})`}
                  href="/favoritos"
                  badge={favorites.count}
                />
              ) : null}
              <IconButton icon={ShoppingBag} label="Sacola" href="/carrinho" />
            </View>
          </>
        )}
      </View>

      {!isDesktop ? <MobileMenu visible={menuOpen} onClose={() => setMenuOpen(false)} /> : null}
    </View>
  );
}

function NavLink({ item, active, compact }: { item: NavItem; active: boolean; compact: boolean }) {
  const { hover, handlers } = useInteraction();
  const underline = useAnimatedStyle(() => ({
    transform: [{ scaleX: active ? 1 : hover.value }],
  }));
  const label = useAnimatedStyle(() => ({
    color: item.highlight
      ? colors.gold
      : active
        ? colors.white
        : interpolateColor(hover.value, [0, 1], [colors.textMuted, colors.white]),
  }));

  return (
    <Link href={item.href} asChild>
      <Pressable accessibilityRole="link" accessibilityState={{ selected: active }} {...handlers} style={styles.navItem}>
        <Animated.Text style={[styles.navLabel, compact && styles.navLabelCompact, label]}>{item.label}</Animated.Text>
        <Animated.View style={[styles.navUnderline, underline]} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  tint: { backgroundColor: 'rgba(0,0,0,0.62)' },
  border: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    flexWrap: 'nowrap',
  },
  navItem: { paddingVertical: 10 },
  navLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  navLabelCompact: { fontSize: 11, letterSpacing: 1.1 },
  navUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 4,
    height: 1,
    backgroundColor: colors.gold,
    transformOrigin: 'left',
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  centerLogo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: layout.headerHeightMobile,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
