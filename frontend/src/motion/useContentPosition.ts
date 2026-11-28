import { useCallback, useEffect, useRef } from 'react';
import type { View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { usePageScroll } from './PageScroll';

/**
 * Mede a posição de um elemento dentro da página (top e altura) e guarda em
 * valores compartilhados. A medição acontece só quando o layout muda —
 * nunca a cada quadro de rolagem.
 */
export function useContentPosition(enabled: boolean) {
  const { scrollY, onLayoutChange } = usePageScroll();
  const ref = useRef<View>(null);
  /** Distância do topo do conteúdo até o elemento (-1 = ainda não medido). */
  const top = useSharedValue(-1);
  const height = useSharedValue(0);

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.measureInWindow((_x, y, w, h) => {
      if (w === 0 && h === 0) return; // ainda não posicionado
      top.set(y + scrollY.get());
      height.set(h);
    });
  }, [scrollY, top, height]);

  useEffect(() => {
    if (!enabled) return;
    const unsubscribe = onLayoutChange(measure);
    const t = setTimeout(measure, 80);
    return () => {
      clearTimeout(t);
      unsubscribe();
    };
  }, [enabled, onLayoutChange, measure]);

  return { ref, top, height, measure };
}
