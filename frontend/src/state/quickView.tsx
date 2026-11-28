import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { QuickViewModal } from '../components/product/QuickViewModal';
import type { Product } from '../types/product';

/** Dados mínimos para abrir o popup (o restante é buscado na API se faltar). */
export type QuickViewProduct = Pick<
  Product,
  'id' | 'slug' | 'name' | 'images' | 'price' | 'promotionalPrice' | 'category'
> &
  Partial<Product>;

type QuickViewContextValue = {
  open: (product: QuickViewProduct) => void;
  close: () => void;
};

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

/** Controla o popup de produto (visualização rápida) do app inteiro. */
export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  const [visible, setVisible] = useState(false);

  const open = useCallback((p: QuickViewProduct) => {
    setProduct(p);
    setVisible(true);
  }, []);
  const close = useCallback(() => setVisible(false), []);
  const onClosed = useCallback(() => setProduct(null), []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <QuickViewContext.Provider value={value}>
      {children}
      {product ? (
        <QuickViewModal product={product} visible={visible} onClose={close} onClosed={onClosed} />
      ) : null}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error('useQuickView precisa estar dentro de <QuickViewProvider>.');
  return ctx;
}
