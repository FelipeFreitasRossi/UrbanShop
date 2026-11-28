import { useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { breakpoints } from '../theme/tokens';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Faixa de tela atual.
 *
 * Na exportação web estática o HTML é gerado sem janela. Por isso a primeira
 * renderização no navegador assume desktop (igual ao HTML gerado) e só depois
 * da montagem usa a largura real — evita erro de hidratação. A tela de
 * carregamento cobre essa troca.
 */
export function useBreakpoint() {
  const { width, height } = useWindowDimensions();
  const [mounted, setMounted] = useState(Platform.OS !== 'web');

  useEffect(() => {
    setMounted(true);
  }, []);

  const w = mounted ? width : 1280;
  const h = mounted ? height : 800;

  const bp: Breakpoint =
    w >= breakpoints.desktop ? 'desktop' : w >= breakpoints.tablet ? 'tablet' : 'mobile';

  return {
    width: w,
    height: h,
    bp,
    isMobile: bp === 'mobile',
    isTablet: bp === 'tablet',
    isDesktop: bp === 'desktop',
    isWide: w >= breakpoints.wide,
    /** Escolhe um valor por faixa: pick(mobile, tablet, desktop). */
    pick<T>(mobile: T, tablet: T, desktop: T): T {
      return bp === 'desktop' ? desktop : bp === 'tablet' ? tablet : mobile;
    },
  };
}
