import React, { createContext, useCallback, useContext, useMemo } from 'react';
import type { Product } from '../types/product';
import { useAuth } from './auth';
import { usePersistentState } from './usePersistentState';

/**
 * Favoritos (lista de desejos) — somente para clientes cadastrados.
 * Ficam salvos no aparelho, separados por conta. Na etapa de produtos
 * passam a ser sincronizados com a conta pela API.
 */
export type FavoriteItem = Pick<
  Product,
  'id' | 'slug' | 'name' | 'images' | 'price' | 'promotionalPrice' | 'category'
>;

type FavoritesContextValue = {
  items: FavoriteItem[];
  count: number;
  /** false para visitantes: curtir exige cadastro. */
  enabled: boolean;
  isFavorite: (id: string) => boolean;
  /** Retorna true se o produto passou a ser favorito. */
  toggle: (item: FavoriteItem) => boolean;
  remove: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = usePersistentState<FavoriteItem[]>(
    user ? `urbanshop.favorites.${user.id}` : null,
    [],
  );

  const isFavorite = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggle = useCallback(
    (item: FavoriteItem) => {
      if (!user) return false;
      const exists = items.some((i) => i.id === item.id);
      const minimal: FavoriteItem = {
        id: item.id,
        slug: item.slug,
        name: item.name,
        images: item.images.slice(0, 2),
        price: item.price,
        promotionalPrice: item.promotionalPrice,
        category: item.category,
      };
      setItems((prev) => (exists ? prev.filter((i) => i.id !== item.id) : [minimal, ...prev]));
      return !exists;
    },
    [items, user, setItems],
  );

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), [setItems]);

  const value = useMemo(
    () => ({ items, count: items.length, enabled: !!user, isFavorite, toggle, remove }),
    [items, user, isFavorite, toggle, remove],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites precisa estar dentro de <FavoritesProvider>.');
  return ctx;
}
