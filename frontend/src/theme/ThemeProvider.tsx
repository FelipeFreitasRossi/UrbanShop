import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { storage } from '../utils/storage';
import { darkPalette, lightPalette, onDark, type Palette } from './palettes';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ColorScheme = 'dark' | 'light';

type ThemeContextValue = {
  /** Escolha do usuário (escuro, claro ou seguir o sistema). */
  mode: ThemeMode;
  /** Tema efetivamente aplicado. */
  scheme: ColorScheme;
  colors: Palette;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = 'urbanshop.theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Tema da UrbanShop. O escuro é o padrão da marca; a escolha fica salva no aparelho. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    storage.get(STORAGE_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light' || saved === 'system') setModeState(saved);
    });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    storage.set(STORAGE_KEY, next);
  }, []);

  const scheme: ColorScheme = mode === 'system' ? (system === 'light' ? 'light' : 'dark') : mode;

  const value = useMemo(
    () => ({ mode, scheme, colors: scheme === 'light' ? lightPalette : darkPalette, setMode }),
    [mode, scheme, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>.');
  return ctx;
}

/**
 * Tom do conteúdo: "onDark" é usado sobre fotos e sobre o cartão preto,
 * onde o texto continua claro mesmo no tema claro.
 */
const ToneContext = createContext<'auto' | 'onDark'>('auto');

export function OnDark({ children }: { children: React.ReactNode }) {
  return <ToneContext.Provider value="onDark">{children}</ToneContext.Provider>;
}

/** Cores atuais (respeitando o tom "sobre foto" quando houver). */
export function useColors(): Palette {
  const { colors } = useTheme();
  const tone = useContext(ToneContext);
  return tone === 'onDark' ? onDark : colors;
}

type NamedStyles<T> = StyleSheet.NamedStyles<T>;

/**
 * Cria um hook de estilos que muda junto com o tema.
 *   const useStyles = makeStyles((colors) => ({ box: { backgroundColor: colors.black } }));
 *   const styles = useStyles();
 */
export function makeStyles<T extends NamedStyles<T>>(factory: (colors: Palette) => T) {
  const cache = new Map<Palette, T>();
  return function useStyles(): T {
    const colors = useColors();
    let styles = cache.get(colors);
    if (!styles) {
      styles = StyleSheet.create(factory(colors));
      cache.set(colors, styles);
    }
    return styles;
  };
}
