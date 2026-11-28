import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { makeStyles } from '../../theme/ThemeProvider';
import { radius } from '../../theme/tokens';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
  /** Largura máxima no tablet/desktop (onde vira um cartão centralizado). */
  maxWidth?: number;
};

/**
 * Painel que sobe de baixo no celular (bottom sheet) e aparece centralizado no desktop.
 * Desenhado acima de todo o app, com fundo escurecido; fecha tocando fora ou no "voltar".
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  accessibilityLabel,
  maxWidth = 520,
}: BottomSheetProps) {
  const styles = useStyles();
  const reduce = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { isMobile, height } = useBreakpoint();
  const progress = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.set(reduce ? withTiming(1, { duration: 0 }) : withSpring(1, { damping: 22, stiffness: 220 }));
      return;
    }
    progress.set(withTiming(0, { duration: reduce ? 0 : 220 }));
    const t = setTimeout(() => setMounted(false), reduce ? 0 : 230);
    return () => clearTimeout(t);
  }, [visible, reduce, progress]);

  // Botão "voltar" do Android fecha o painel.
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  const backdrop = useAnimatedStyle(() => ({ opacity: Math.min(1, progress.value) }));
  const sheet = useAnimatedStyle(() =>
    isMobile
      ? { transform: [{ translateY: interpolate(progress.value, [0, 1], [height * 0.7, 0]) }] }
      : {
          opacity: Math.min(1, progress.value),
          transform: [{ scale: interpolate(progress.value, [0, 1], [0.94, 1]) }],
        },
  );

  if (!mounted) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, isMobile ? styles.rootMobile : styles.rootCenter]}
      pointerEvents="box-none"
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fechar" />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.sheet,
          isMobile
            ? [styles.sheetMobile, { paddingBottom: insets.bottom + 16, maxHeight: height * 0.92 }]
            : [styles.sheetDesktop, { maxWidth, maxHeight: height * 0.86 }],
          sheet,
        ]}
      >
        {isMobile ? <View style={styles.handle} /> : null}
        {children}
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  rootMobile: { justifyContent: 'flex-end', zIndex: 900 },
  rootCenter: { justifyContent: 'center', alignItems: 'center', zIndex: 900, padding: 24 },
  backdrop: { backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.ink,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  sheetMobile: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: 14 },
  sheetDesktop: { width: '100%', borderRadius: radius.lg },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lineStrong,
    marginBottom: 6,
  },
}));
