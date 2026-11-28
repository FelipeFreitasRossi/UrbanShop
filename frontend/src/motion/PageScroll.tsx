import { createContext, useContext } from 'react';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

/**
 * Contexto de rolagem da página atual.
 * Componentes animados (Reveal, ParallaxImage, header, barra de progresso)
 * leem daqui a posição de rolagem sem precisar recebê-la por props.
 */
export type PageScrollContextValue = {
  /** Posição vertical de rolagem (px). */
  scrollY: SharedValue<number>;
  /** Altura visível da área de rolagem. */
  viewportH: SharedValue<number>;
  /** Altura total do conteúdo. */
  contentH: SharedValue<number>;
  /** Registra uma função chamada (no máximo 1x por quadro) a cada rolagem. */
  subscribe: (listener: () => void) => () => void;
  /** Guarda a posição de uma seção para rolagem suave até ela. */
  registerAnchor: (name: string, y: number) => void;
  /** Rola suavemente até uma seção registrada. */
  scrollToAnchor: (name: string) => void;
  scrollToTop: () => void;
  /** true quando o usuário pediu "reduzir movimento" no sistema. */
  reduceMotion: boolean;
  /** true quando existe um Screen controlando a rolagem. */
  active: boolean;
};

const PageScrollContext = createContext<PageScrollContextValue | null>(null);

export const PageScrollProvider = PageScrollContext.Provider;

/** Valor padrão usado fora de um Screen: tudo aparece sem animação de rolagem. */
function useFallback(): PageScrollContextValue {
  const scrollY = useSharedValue(0);
  const viewportH = useSharedValue(0);
  const contentH = useSharedValue(0);
  return {
    scrollY,
    viewportH,
    contentH,
    subscribe: () => () => {},
    registerAnchor: () => {},
    scrollToAnchor: () => {},
    scrollToTop: () => {},
    reduceMotion: true,
    active: false,
  };
}

export function usePageScroll(): PageScrollContextValue {
  const ctx = useContext(PageScrollContext);
  const fallback = useFallback();
  return ctx ?? fallback;
}
