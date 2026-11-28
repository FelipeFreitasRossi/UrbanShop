import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import type { Product } from '../types/product';

/**
 * Favoritos do visitante.
 *
 * Nesta etapa ficam salvos no próprio dispositivo (no navegador, via
 * localStorage). Na Etapa 4, com login, passam a ser sincronizados com a
 * conta do cliente pela API.
 */
export type FavoriteItem = Pick<
  Product,
  'id' | 'slug' | 'name' | 'images' | 'price' | 'promotionalPrice' | 'category'
>;

type FavoritesContextValue = {
  items: FavoriteItem[];
  count: number;
  isFavorite: (id: string) => boolean;
  toggle: (item: FavoriteItem) => void;
  remove: (id: string) => void;
};

const STORAGE_KEY = 'urbanshop:favorites:v1';
const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readStorage(): FavoriteItem[] {
  if (Platform.OS !== 'web') return [];
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(items: FavoriteItem[]) {
  if (Platform.OS !== 'web') return;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Armazenamento indisponível (modo privado, cota cheia): segue só em memória.
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeStorage(items);
  }, [items, loaded]);

  const isFavorite = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggle = useCallback((item: FavoriteItem) => {
    setItems((prev) =>
      prev.some((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [item, ...prev],
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const value = useMemo(
    () => ({ items, count: items.length, isFavorite, toggle, remove }),
    [items, isFavorite, toggle, remove],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites precisa estar dentro de <FavoritesProvider>.');
  return ctx;
}
