import { Link } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { fonts } from '../../theme/tokens';
import { makeStyles } from '../../theme/ThemeProvider';

type LogoProps = {
  size?: number;
  /** Quando true, o logo leva para a página inicial. */
  linkHome?: boolean;
};

/**
 * Marca nominativa "UrbanShop": "Urban" em peso forte, "Shop" leve e um ponto dourado.
 * O nome é escrito em um único texto, para nunca ser medido ou cortado em partes.
 */
export function Logo({ size = 22, linkHome = false }: LogoProps) {
  const styles = useStyles();
  const mark = (
    <View style={styles.row} accessible accessibilityLabel="UrbanShop">
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={[styles.text, { fontSize: size, lineHeight: Math.round(size * 1.25) }]}
      >
        <Text style={styles.urban}>Urban</Text>
        <Text style={styles.shop}>Shop</Text>
      </Text>
      <View
        style={[
          styles.dot,
          {
            width: Math.max(4, size * 0.2),
            height: Math.max(4, size * 0.2),
            marginLeft: size * 0.1,
            marginBottom: size * 0.22,
          },
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

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  text: { color: colors.white, includeFontPadding: false },
  urban: { fontFamily: fonts.display, color: colors.white },
  shop: { fontFamily: fonts.headingLight, color: colors.white },
  dot: { backgroundColor: colors.gold, borderRadius: 999 },
}));
