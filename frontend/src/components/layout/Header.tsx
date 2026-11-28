import { Link, usePathname } from 'expo-router';
import { Heart, Menu, Search, Settings, ShoppingBag, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAIN_NAV, type NavItem } from '../../config/navigation';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { FlyTargetView } from '../../motion/FlyTargetView';
import { usePageScroll } from '../../motion/PageScroll';
import { useInteraction } from '../../motion/useInteraction';
import { useAuth } from '../../state/auth';
import { useCart } from '../../state/cart';
import { useFavorites } from '../../state/favorites';
import { fonts, layout } from '../../theme/tokens';
import { isActivePath } from '../../utils/path';
import { Logo } from '../brand/Logo';
import { GlassBackground } from '../ui/GlassBackground';
import { IconButton } from '../ui/IconButton';
import { GUEST_BANNER_HEIGHT, GuestBanner, useGuestBannerVisible } from './GuestBanner';
import { MobileMenu } from './MobileMenu';
import { makeStyles, useColors, useTheme } from '../../theme/ThemeProvider';

/** Largura mínima para exibir todos os links do menu no header. */
const FULL_NAV_MIN_WIDTH = 1200;

/** Altura total ocupada pelo header (área segura do topo + faixa de cadastro + barra). */
export function useHeaderHeight() {
  const { width } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const banner = useGuestBannerVisible() ? GUEST_BANNER_HEIGHT : 0;
  return width >= FULL_NAV_MIN_WIDTH
    ? layout.headerHeightDesktop + banner
    : layout.headerHeightMobile + insets.top + banner;
}

/**
 * Smart Sticky Header:
 * - começa transparente sobre a foto e ganha fundo com desfoque ao rolar;
 * - some ao rolar para baixo (mais espaço para os produtos) e volta ao rolar para cima;
 * - para visitantes, mostra a faixa dourada "Cadastre-se".
 */
export function Header() {
  const styles = useStyles();
  const { isMobile, width } = useBreakpoint();
  const isDesktop = width >= FULL_NAV_MIN_WIDTH;
  const roomy = width >= 1400;
  const { scrollY } = usePageScroll();
  const insets = useSafeAreaInsets();
  const favorites = useFavorites();
  const cart = useCart();
  const { user } = useAuth();
  const showBanner = useGuestBannerVisible();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const height = useHeaderHeight();
  const [menuOpen, setMenuOpen] = useState(false);

  // No tema escuro o header começa transparente sobre a foto; no claro já começa com fundo.
  const solidFromStart = useTheme().scheme === 'light';
  const backdrop = useAnimatedStyle(() => ({
    opacity: solidFromStart ? 1 : interpolate(scrollY.value, [0, 140], [0, 1], Extrapolation.CLAMP),
  }));
  const border = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [60, 200], [0, 1], Extrapolation.CLAMP),
  }));

  // ---- Esconde ao rolar para baixo, mostra ao rolar para cima ----
  const hidden = useSharedValue(0);
  const target = useSharedValue(0);
  const setHidden = (value: number) => {
    'worklet';
    if (target.value === value) return;
    target.value = value;
    hidden.value = withTiming(value, { duration: 280 });
  };
  useAnimatedReaction(
    () => scrollY.value,
    (y, prev) => {
      if (prev === null || reduce) return;
      const dy = y - prev;
      if (y < 120) setHidden(0);
      else if (dy > 8) setHidden(1);
      else if (dy < -8) setHidden(0);
    },
  );
  // Ao curtir ou adicionar à sacola, o header aparece para mostrar o ícone recebendo a peça.
  useEffect(() => {
    target.set(0);
    hidden.set(withTiming(0, { duration: 200 }));
  }, [cart.count, favorites.count, menuOpen, hidden, target]);

  const slide = useAnimatedStyle(() => ({
    transform: [{ translateY: -hidden.value * (height + 4) }],
  }));

  const barHeight = isDesktop ? layout.headerHeightDesktop : layout.headerHeightMobile;

  return (
    <Animated.View
      style={[styles.wrapper, { height, paddingTop: isDesktop ? 0 : insets.top }, slide]}
      pointerEvents="box-none"
    >
      <Animated.View style={[StyleSheet.absoluteFill, backdrop]} pointerEvents="none">
        <GlassBackground tint={0.62} intensity={40} />
      </Animated.View>
      <Animated.View style={[styles.border, border]} pointerEvents="none" />

      {showBanner ? <GuestBanner /> : null}

      <View
        style={[
          styles.bar,
          {
            height: barHeight,
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
              <FlyTargetView name="wishlist" priority={1}>
                <IconButton
                  icon={Heart}
                  label={`Favoritos (${favorites.count})`}
                  href="/favoritos"
                  badge={favorites.count}
                  active={pathname === '/favoritos'}
                />
              </FlyTargetView>
              <FlyTargetView name="cart" priority={1}>
                <IconButton
                  icon={ShoppingBag}
                  label={`Sacola (${cart.count})`}
                  href="/carrinho"
                  badge={cart.count}
                  active={pathname === '/carrinho'}
                />
              </FlyTargetView>
              <IconButton
                icon={User}
                label={user ? 'Minha conta' : 'Entrar'}
                href={user ? '/perfil' : '/entrar'}
                active={pathname === '/perfil' || pathname === '/entrar'}
              />
              <IconButton
                icon={Settings}
                label="Configurações"
                href="/configuracoes"
                active={pathname === '/configuracoes'}
              />
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
                <FlyTargetView name="wishlist" priority={1}>
                  <IconButton
                    icon={Heart}
                    label={`Favoritos (${favorites.count})`}
                    href="/favoritos"
                    badge={favorites.count}
                  />
                </FlyTargetView>
              ) : null}
              <FlyTargetView name="cart" priority={1}>
                <IconButton
                  icon={ShoppingBag}
                  label={`Sacola (${cart.count})`}
                  href="/carrinho"
                  badge={cart.count}
                />
              </FlyTargetView>
            </View>
          </>
        )}
      </View>

      {!isDesktop ? <MobileMenu visible={menuOpen} onClose={() => setMenuOpen(false)} /> : null}
    </Animated.View>
  );
}

function NavLink({ item, active, compact }: { item: NavItem; active: boolean; compact: boolean }) {
  const colors = useColors();
  const styles = useStyles();
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
      <Pressable
        accessibilityRole="link"
        accessibilityState={{ selected: active }}
        {...handlers}
        style={styles.navItem}
      >
        <Animated.Text style={[styles.navLabel, compact && styles.navLabelCompact, label]}>
          {item.label}
        </Animated.Text>
        <Animated.View style={[styles.navUnderline, underline]} />
      </Pressable>
    </Link>
  );
}

const useStyles = makeStyles((colors) => ({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  border: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  bar: {
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
}));
