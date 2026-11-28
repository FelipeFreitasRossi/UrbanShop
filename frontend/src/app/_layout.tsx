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
import { StyleSheet, View } from 'react-native';
import { SplashOverlay } from '../components/brand/SplashOverlay';
import { FavoritesProvider } from '../state/favorites';
import { colors } from '../theme/tokens';

// Mantém a splash nativa (preta) até a tela de carregamento animada assumir.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
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
    // As duas telas são pretas: a troca é imperceptível.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (fontError) console.warn('[UrbanShop] Falha ao carregar fontes:', fontError);
  }, [fontError]);

  const finishSplash = useCallback(() => setShowSplash(false), []);

  return (
    <FavoritesProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.black },
            animation: 'fade',
          }}
        />
        {showSplash ? <SplashOverlay ready={fontsLoaded || !!fontError} onFinish={finishSplash} /> : null}
      </View>
    </FavoritesProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
});
