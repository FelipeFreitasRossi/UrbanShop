import { Link, usePathname } from 'expo-router';
import { Heart, House, Shirt, ShoppingBag, User, type LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavorites } from '../../state/favorites';
import { fonts, layout } from '../../theme/tokens';
import { isActivePath } from '../../utils/path';
import { GlassBackground } from '../ui/GlassBackground';
import { UText } from '../ui/UText';
import { makeStyles, useColors } from '../../theme/ThemeProvider';

type Tab = { label: string; href: string; icon: LucideIcon };

const TABS: Tab[] = [
  { label: 'Início', href: '/', icon: House },
  { label: 'Produtos', href: '/produtos', icon: Shirt },
  { label: 'Favoritos', href: '/favoritos', icon: Heart },
  { label: 'Sacola', href: '/carrinho', icon: ShoppingBag },
  { label: 'Conta', href: '/perfil', icon: User },
];

/** Altura total da barra inferior, incluindo a área segura. */
export function useBottomNavHeight() {
  const insets = useSafeAreaInsets();
  return layout.bottomNavHeight + insets.bottom;
}

/** Navegação inferior própria para celulares (Bottom Navigation). */
export function BottomNav() {
  const styles = useStyles();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { count } = useFavorites();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]} accessibilityRole="tablist">
      <GlassBackground tint={0.72} intensity={50} />
      <View style={styles.border} />
      <View style={styles.row}>
        {TABS.map((tab) => (
          <TabButton
            key={tab.href}
            tab={tab}
            active={isActivePath(pathname, tab.href)}
            badge={tab.href === '/favoritos' ? count : 0}
          />
        ))}
      </View>
    </View>
  );
}

function TabButton({ tab, active, badge }: { tab: Tab; active: boolean; badge: number }) {
  const colors = useColors();
  const styles = useStyles();
  const Icon = tab.icon;
  const indicator = useAnimatedStyle(() => ({
    opacity: withTiming(active ? 1 : 0, { duration: 220 }),
    transform: [{ scaleX: withSpring(active ? 1 : 0.3, { damping: 18, stiffness: 220 }) }],
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(active ? -1 : 0, { damping: 16, stiffness: 240 }) }],
  }));

  return (
    <Link href={tab.href} asChild>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={badge > 0 ? `${tab.label}, ${badge} itens` : tab.label}
        style={styles.tab}
      >
        <Animated.View style={[styles.indicator, indicator]} />
        <Animated.View style={iconStyle}>
          <Icon size={21} color={active ? colors.gold : colors.textMuted} strokeWidth={active ? 2 : 1.6} />
          {badge > 0 ? (
            <View style={styles.badge}>
              <UText style={styles.badgeText}>{badge > 9 ? '9+' : String(badge)}</UText>
            </View>
          ) : null}
        </Animated.View>
        <UText
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
          style={[styles.label, { color: active ? colors.white : colors.textDim }]}
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
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  row: { flexDirection: 'row', height: layout.bottomNavHeight },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 11, lineHeight: 14, textAlign: 'center' },
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 9, lineHeight: 11, color: colors.black },
}));
