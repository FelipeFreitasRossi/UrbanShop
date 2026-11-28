import { usePathname } from 'expo-router';
import Head from 'expo-router/head';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Dimensions,
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
import { media } from '../../config/media';
import { site } from '../../config/site';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { easeOutExpo } from '../../motion/easing';
import {
  PageScrollProvider,
  usePageScroll,
  type PageScrollContextValue,
} from '../../motion/PageScroll';
import { colors } from '../../theme/tokens';
import { BottomNav, useBottomNavHeight } from './BottomNav';
import { Footer } from './Footer';
import { Header, useHeaderHeight } from './Header';

type ScreenProps = {
  children: React.ReactNode;
  /** Título da página (SEO). O nome da loja é adicionado automaticamente. */
  title?: string;
  description?: string;
  /** Imagem para compartilhamento (Open Graph). */
  image?: string;
  /** O conteúdo começa atrás do header transparente (ex.: Hero da home). */
  overlayHeader?: boolean;
  footer?: boolean;
  noIndex?: boolean;
};

/**
 * Estrutura base de toda página: SEO, header, rolagem animada,
 * indicador de progresso, rodapé e navegação inferior no celular.
 */
export function Screen({
  children,
  title,
  description = site.defaultDescription,
  image = media.hero,
  overlayHeader = false,
  footer = true,
  noIndex = false,
}: ScreenProps) {
  const pathname = usePathname();
  const { isMobile } = useBreakpoint();
  const headerHeight = useHeaderHeight();
  const bottomNavHeight = useBottomNavHeight();
  const reduceMotion = useReducedMotion();

  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);
  const viewportH = useSharedValue(0);
  const contentH = useSharedValue(0);

  // ---- Assinantes de rolagem (Reveal, Parallax), no máximo 1x por quadro ----
  const listeners = useRef(new Set<() => void>());
  const frame = useRef<number | null>(null);

  const notify = useCallback(() => {
    if (frame.current != null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      listeners.current.forEach((fn) => fn());
    });
  }, []);

  const subscribe = useCallback((fn: () => void) => {
    listeners.current.add(fn);
    return () => {
      listeners.current.delete(fn);
    };
  }, []);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', notify);
    return () => {
      sub.remove();
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, [notify]);

  // ---- Âncoras para rolagem suave ----
  const anchors = useRef(new Map<string, number>());
  const registerAnchor = useCallback((name: string, y: number) => {
    anchors.current.set(name, y);
  }, []);
  const scrollToAnchor = useCallback(
    (name: string) => {
      const y = anchors.current.get(name);
      if (y == null) return;
      scrollRef.current?.scrollTo({ y: Math.max(0, y - headerHeight + 1), animated: !reduceMotion });
    },
    [headerHeight, reduceMotion],
  );
  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: !reduceMotion });
  }, [reduceMotion]);

  const ctx = useMemo<PageScrollContextValue>(
    () => ({
      scrollY,
      viewportH,
      contentH,
      subscribe,
      registerAnchor,
      scrollToAnchor,
      scrollToTop,
      reduceMotion,
      active: true,
    }),
    [scrollY, viewportH, contentH, subscribe, registerAnchor, scrollToAnchor, scrollToTop, reduceMotion],
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.set(e.nativeEvent.contentOffset.y);
      notify();
    },
    [scrollY, notify],
  );

  // ---- Animação de entrada da página ----
  const enter = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (!reduceMotion) enter.set(withTiming(1, { duration: 650, easing: easeOutExpo }));
  }, [enter, reduceMotion]);
  const enterStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: interpolate(enter.value, [0, 1], [14, 0]) }],
  }));

  const fullTitle = title ? `${title} | ${site.name}` : site.defaultTitle;
  const url = `${site.url}${pathname === '/' ? '' : pathname}`;

  return (
    <PageScrollProvider value={ctx}>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={site.name} />
        <meta property="og:locale" content={site.locale} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        {noIndex ? <meta name="robots" content="noindex" /> : null}
      </Head>

      <View style={styles.root}>
        <Animated.View style={[styles.flex, enterStyle]}>
          <ScrollView
            ref={scrollRef}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onLayout={(e) => {
              viewportH.set(e.nativeEvent.layout.height);
              notify();
            }}
            onContentSizeChange={(_w, h) => {
              contentH.set(h);
              notify();
            }}
            contentContainerStyle={{
              paddingTop: overlayHeader ? 0 : headerHeight,
              paddingBottom: isMobile ? bottomNavHeight : 0,
            }}
            showsVerticalScrollIndicator={!isMobile}
          >
            {children}
            {footer ? <Footer /> : null}
          </ScrollView>
        </Animated.View>

        <Header />
        <ScrollProgress />
        {isMobile ? <BottomNav /> : null}
      </View>
    </PageScrollProvider>
  );
}

/** Indicador dourado de progresso de leitura no topo da tela. */
function ScrollProgress() {
  const { scrollY, viewportH, contentH } = usePageScroll();
  const style = useAnimatedStyle(() => {
    const max = Math.max(1, contentH.value - viewportH.value);
    const p = Math.min(1, Math.max(0, scrollY.value / max));
    return { width: `${p * 100}%` as `${number}%` };
  });
  return (
    <View style={styles.progressTrack} pointerEvents="none">
      <Animated.View style={[styles.progressBar, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  flex: { flex: 1 },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    zIndex: 60,
  },
  progressBar: { height: 2, backgroundColor: colors.gold },
});
