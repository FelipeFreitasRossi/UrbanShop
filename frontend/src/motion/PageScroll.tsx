import { createContext, useContext } from 'react';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

/**
 * Contexto de rolagem da página atual.
 *
 * A posição de rolagem (scrollY) é atualizada direto na thread de interface
 * (UI thread). Reveal, Parallax, header e barra de progresso calculam suas
 * animações ali mesmo, sem passar pelo JavaScript a cada quadro — é isso que
 * mantém a rolagem leve.
 */
export type PageScrollContextValue = {
  /** Posição vertical de rolagem (px). */
  scrollY: SharedValue<number>;
  /** Altura visível da área de rolagem. */
  viewportH: SharedValue<number>;
  /** Altura total do conteúdo. */
  contentH: SharedValue<number>;
  /**
   * Avisa quando o layout da página muda (conteúdo carregou, tela girou).
   * Usado para medir a posição dos elementos UMA vez, e não a cada rolagem.
   */
  onLayoutChange: (listener: () => void) => () => void;
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

const noop = () => {};
const noopSubscribe = () => noop;

export function usePageScroll(): PageScrollContextValue {
  const ctx = useContext(PageScrollContext);
  // Fora de um Screen (ex.: popup), tudo aparece sem animação de rolagem.
  const scrollY = useSharedValue(0);
  const viewportH = useSharedValue(0);
  const contentH = useSharedValue(0);
  return (
    ctx ?? {
      scrollY,
      viewportH,
      contentH,
      onLayoutChange: noopSubscribe,
      registerAnchor: noop,
      scrollToAnchor: noop,
      scrollToTop: noop,
      reduceMotion: true,
      active: false,
    }
  );
}
