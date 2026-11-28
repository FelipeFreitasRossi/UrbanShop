import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { breakpoints } from '../theme/tokens';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export type BreakpointValue = {
  width: number;
  height: number;
  bp: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  /** Escolhe um valor por faixa: pick(mobile, tablet, desktop). */
  pick: <T>(mobile: T, tablet: T, desktop: T) => T;
};

function compute(width: number, height: number): BreakpointValue {
  const bp: Breakpoint =
    width >= breakpoints.desktop ? 'desktop' : width >= breakpoints.tablet ? 'tablet' : 'mobile';
  return {
    width,
    height,
    bp,
    isMobile: bp === 'mobile',
    isTablet: bp === 'tablet',
    isDesktop: bp === 'desktop',
    isWide: width >= breakpoints.wide,
    pick: (mobile, tablet, desktop) => (bp === 'desktop' ? desktop : bp === 'tablet' ? tablet : mobile),
  };
}

const BreakpointContext = createContext<BreakpointValue | null>(null);

/**
 * Calcula a faixa de tela UMA vez para o app inteiro.
 * (Antes cada texto fazia esse cálculo sozinho, o que deixava o app pesado.)
 *
 * Na exportação web estática o HTML é gerado sem janela: a primeira
 * renderização no navegador assume desktop (igual ao HTML) e só depois usa a
 * largura real, evitando erro de hidratação.
 */
export function BreakpointProvider({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const [mounted, setMounted] = useState(Platform.OS !== 'web');

  useEffect(() => {
    setMounted(true);
  }, []);

  const w = mounted ? width : 1280;
  const h = mounted ? height : 800;
  // Só recalcula quando a largura/altura realmente mudam.
  const value = useMemo(() => compute(w, h), [w, h]);

  return React.createElement(BreakpointContext.Provider, { value }, children);
}

export function useBreakpoint(): BreakpointValue {
  const ctx = useContext(BreakpointContext);
  if (!ctx) throw new Error('useBreakpoint precisa estar dentro de <BreakpointProvider>.');
  return ctx;
}
