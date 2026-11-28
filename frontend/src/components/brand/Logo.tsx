import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme/tokens';

type LogoProps = {
  size?: number;
  /** Quando true, o logo leva para a página inicial. */
  linkHome?: boolean;
};

/** Marca nominativa UrbanShop: "URBAN" pesado, "SHOP" leve e ponto dourado. */
export function Logo({ size = 22, linkHome = false }: LogoProps) {
  const mark = (
    <View style={styles.row} accessible accessibilityLabel="UrbanShop">
      <Text
        allowFontScaling={false}
        style={[styles.urban, { fontSize: size, lineHeight: size * 1.1, letterSpacing: size * 0.06 }]}
      >
        URBAN
      </Text>
      <Text
        allowFontScaling={false}
        style={[styles.shop, { fontSize: size, lineHeight: size * 1.1, letterSpacing: size * 0.06 }]}
      >
        SHOP
      </Text>
      <View
        style={[
          styles.dot,
          { width: size * 0.22, height: size * 0.22, marginLeft: size * 0.08, marginBottom: size * 0.16 },
        ]}
      />
    </View>
  );

  if (!linkHome) return mark;

  return (
    <Link href="/" asChild>
      <Pressable accessibilityRole="link" accessibilityLabel="UrbanShop — página inicial" hitSlop={8}>
        {mark}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  urban: { fontFamily: fonts.display, color: colors.white },
  shop: { fontFamily: fonts.headingLight, color: colors.white },
  dot: { backgroundColor: colors.gold, borderRadius: 999 },
});
