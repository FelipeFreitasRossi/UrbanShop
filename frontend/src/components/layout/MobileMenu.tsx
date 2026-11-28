import { Link, usePathname } from 'expo-router';
import {
  ArrowUpRight,
  Heart,
  LogIn,
  MessageCircle,
  Settings,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORIES } from '../../config/navigation';
import { easeOutExpo } from '../../motion/easing';
import { fonts, spacing } from '../../theme/tokens';
import { Logo } from '../brand/Logo';
import { IconButton } from '../ui/IconButton';
import { UText } from '../ui/UText';
import { useAuth } from '../../state/auth';
import { isActivePath } from '../../utils/path';
import { makeStyles, useColors } from '../../theme/ThemeProvider';

type MobileMenuProps = { visible: boolean; onClose: () => void };

const PRIMARY = [
  { label: 'Produtos', href: '/produtos' },
  { label: 'Novidades', href: '/novidades' },
  { label: 'Masculino', href: '/masculino' },
  { label: 'Feminino', href: '/feminino' },
  { label: 'Ofertas', href: '/ofertas', highlight: true },
];

/** Menu em tela cheia para celulares e tablets, com entrada escalonada (stagger). */
export function MobileMenu({ visible, onClose }: MobileMenuProps) {
  const colors = useColors();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const progress = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.set(withTiming(1, { duration: reduce ? 0 : 520, easing: easeOutExpo }));
    } else {
      progress.set(withTiming(0, { duration: reduce ? 0 : 260 }));
      const t = setTimeout(() => setMounted(false), reduce ? 0 : 260);
      return () => clearTimeout(t);
    }
  }, [visible, reduce, progress]);

  // Fecha o menu ao trocar de página.
  useEffect(() => {
    if (visible) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const backdrop = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]}>
        <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
          <Logo size={18} />
          <IconButton icon={X} label="Fechar menu" onPress={onClose} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          <UText variant="eyebrow" style={styles.groupLabel}>
            Explore
          </UText>
          {PRIMARY.map((item, i) => (
            <MenuRow
              key={item.href}
              index={i}
              progress={progress}
              label={item.label}
              href={item.href}
              big
              gold={item.highlight}
              active={isActivePath(pathname, item.href)}
            />
          ))}

          <View style={styles.divider} />

          <UText variant="eyebrow" style={styles.groupLabel}>
            Categorias
          </UText>
          {CATEGORIES.map((c, i) => (
            <MenuRow
              key={c.slug}
              index={i + PRIMARY.length}
              progress={progress}
              label={c.title}
              href={`/categoria/${c.slug}`}
              active={isActivePath(pathname, `/categoria/${c.slug}`)}
            />
          ))}

          <View style={styles.divider} />

          <UText variant="eyebrow" style={styles.groupLabel}>
            Conta
          </UText>
          {[
            user
              ? { label: 'Minha conta', href: '/perfil', icon: UserRound }
              : { label: 'Entrar ou cadastrar', href: '/entrar', icon: LogIn },
            { label: 'Favoritos', href: '/favoritos', icon: Heart },
            { label: 'Sacola', href: '/carrinho', icon: ShoppingBag },
            { label: 'Configurações', href: '/configuracoes', icon: Settings },
            { label: 'Atendimento', href: '/institucional/atendimento', icon: MessageCircle },
          ].map((l) => {
            const Icon = l.icon;
            const active = isActivePath(pathname, l.href);
            return (
              <Link key={l.href} href={l.href} asChild>
                <Pressable
                  accessibilityRole="link"
                  accessibilityState={{ selected: active }}
                  style={styles.accountRow}
                >
                  <Icon size={20} color={active ? colors.gold : colors.textMuted} strokeWidth={1.6} />
                  <UText variant="title" color={active ? colors.gold : colors.text}>
                    {l.label}
                  </UText>
                </Pressable>
              </Link>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

function MenuRow({
  label,
  href,
  index,
  progress,
  big = false,
  gold = false,
  active = false,
}: {
  label: string;
  href: string;
  index: number;
  progress: SharedValue<number>;
  big?: boolean;
  gold?: boolean;
  active?: boolean;
}) {
  const colors = useColors();
  const styles = useStyles();
  const style = useAnimatedStyle(() => {
    // Cada linha começa um pouco depois da anterior (stagger).
    const start = Math.min(0.6, index * 0.05);
    const p = interpolate(progress.value, [start, start + 0.4], [0, 1], Extrapolation.CLAMP);
    return { opacity: p, transform: [{ translateY: interpolate(p, [0, 1], [18, 0]) }] };
  });

  return (
    <Animated.View style={style}>
      <Link href={href} asChild>
        <Pressable accessibilityRole="link" accessibilityState={{ selected: active }} style={styles.row}>
          <UText
            style={[
              big ? styles.bigLabel : styles.label,
              { color: gold ? colors.gold : active ? colors.white : colors.text },
            ]}
          >
            {label}
          </UText>
          <ArrowUpRight
            size={big ? 22 : 18}
            color={active || gold ? colors.gold : colors.textDim}
            strokeWidth={1.6}
          />
        </Pressable>
      </Link>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: { backgroundColor: colors.black },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 8,
    paddingBottom: 8,
  },
  content: { paddingHorizontal: 20, paddingTop: spacing.lg },
  groupLabel: { marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  bigLabel: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.6,
    textTransform: 'uppercase',
  },
  label: { fontFamily: fonts.headingBold, fontSize: 20, lineHeight: 26 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginVertical: spacing.lg },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
}));
