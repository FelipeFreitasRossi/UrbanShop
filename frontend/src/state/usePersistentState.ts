import { useEffect, useRef, useState } from 'react';
import { storage } from '../utils/storage';

/**
 * Estado salvo no aparelho e separado por cliente (cada conta tem o seu).
 * Sem cliente logado (key = null), o estado fica vazio e nada é salvo.
 */
export function usePersistentState<T>(key: string | null, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const loadedKey = useRef<string | null>(null);

  // Carrega quando a conta muda (login/logout).
  useEffect(() => {
    let cancelled = false;
    loadedKey.current = null;
    if (!key) {
      setValue(initial);
      return;
    }
    storage.get(key).then((raw) => {
      if (cancelled) return;
      try {
        setValue(raw ? (JSON.parse(raw) as T) : initial);
      } catch {
        setValue(initial);
      }
      loadedKey.current = key;
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Salva a cada mudança (depois de carregado).
  useEffect(() => {
    if (key && loadedKey.current === key) storage.set(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
