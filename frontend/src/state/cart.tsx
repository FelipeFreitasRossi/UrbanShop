import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useAuth } from './auth';
import { usePersistentState } from './usePersistentState';

/**
 * Sacola de compras — somente para clientes cadastrados.
 *
 * Fica salva no aparelho, separada por conta. Preço, estoque e total final
 * são SEMPRE recalculados pelo servidor no checkout (Etapa 6): o app nunca
 * define o valor que será cobrado.
 */
export type CartItem = {
  /** productId + tamanho */
  key: string;
  productId: string;
  slug: string;
  name: string;
  image?: string;
  /** Preço unitário exibido (o servidor confirma no checkout). */
  unitPrice: number;
  size: string | null;
  quantity: number;
  /** Limite de unidades (estoque informado pela API). */
  maxQuantity: number;
};

type AddInput = Omit<CartItem, 'key' | 'quantity'> & { quantity?: number };

type CartContextValue = {
  items: CartItem[];
  /** Total de unidades na sacola. */
  count: number;
  subtotal: number;
  enabled: boolean;
  add: (item: AddInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const MAX_PER_ITEM = 10;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = usePersistentState<CartItem[]>(user ? `urbanshop.cart.${user.id}` : null, []);

  const add = useCallback(
    (input: AddInput) => {
      if (!user) return;
      const key = `${input.productId}::${input.size ?? 'unico'}`;
      const limit = Math.max(1, Math.min(MAX_PER_ITEM, input.maxQuantity));
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: Math.min(limit, i.quantity + (input.quantity ?? 1)) } : i,
          );
        }
        return [
          { ...input, key, maxQuantity: limit, quantity: Math.min(limit, input.quantity ?? 1) },
          ...prev,
        ];
      });
    },
    [user, setItems],
  );

  const setQuantity = useCallback(
    (key: string, quantity: number) =>
      setItems((prev) =>
        prev.map((i) =>
          i.key === key ? { ...i, quantity: Math.max(1, Math.min(i.maxQuantity, quantity)) } : i,
        ),
      ),
    [setItems],
  );

  const remove = useCallback(
    (key: string) => setItems((prev) => prev.filter((i) => i.key !== key)),
    [setItems],
  );
  const clear = useCallback(() => setItems([]), [setItems]);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((n, i) => n + i.quantity * i.unitPrice, 0);
    return { items, count, subtotal, enabled: !!user, add, setQuantity, remove, clear };
  }, [items, user, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>.');
  return ctx;
}
