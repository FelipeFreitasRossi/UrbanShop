import {
  Archivo_300Light,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SplashOverlay } from '../components/brand/SplashOverlay';
import { BreakpointProvider } from '../hooks/useBreakpoint';
import { AuthProvider } from '../state/auth';
import { FavoritesProvider } from '../state/favorites';
import { QuickViewProvider } from '../state/quickView';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';

// Mantém a splash nativa (preta) até a tela de carregamento animada assumir.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <BreakpointProvider>
        <AuthProvider>
          <FavoritesProvider>
            <QuickViewProvider>
              <AppShell />
            </QuickViewProvider>
          </FavoritesProvider>
        </AuthProvider>
      </BreakpointProvider>
    </ThemeProvider>
  );
}

function AppShell() {
  const { colors, scheme } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    Archivo_300Light,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Archivo_900Black,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (fontError) console.warn('[UrbanShop] Falha ao carregar fontes:', fontError);
  }, [fontError]);

  const finishSplash = useCallback(() => setShowSplash(false), []);

  // As páginas só são desenhadas depois das fontes. Se fossem desenhadas antes,
  // o celular mediria cada texto com a fonte do sistema e, ao trocar para a
  // fonte da marca (mais larga), cortaria as últimas letras ("Cont", "Sacol").
  const fontsReady = fontsLoaded || !!fontError;

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
      {fontsReady ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.black },
            animation: 'fade',
          }}
        />
      ) : null}
      {showSplash ? <SplashOverlay ready={fontsReady} onFinish={finishSplash} /> : null}
    </View>
  );
}
