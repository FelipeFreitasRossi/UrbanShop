import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { easeInOut } from '../../motion/easing';
import { useInteraction } from '../../motion/useInteraction';
import { colors, fonts, radius } from '../../theme/tokens';
import { Logo } from '../brand/Logo';
import { UText } from '../ui/UText';

export type LoyaltyTier = 'URBAN_BASIC' | 'URBAN_SILVER' | 'URBAN_GOLD' | 'URBAN_BLACK';

export const TIER_LABEL: Record<LoyaltyTier, string> = {
  URBAN_BASIC: 'Urban Basic',
  URBAN_SILVER: 'Urban Silver',
  URBAN_GOLD: 'Urban Gold',
  URBAN_BLACK: 'Urban Black',
};

type LoyaltyCardVisualProps = {
  tier?: LoyaltyTier;
  /** Dados reais do cliente (Etapa 7). Sem eles, o cartão aparece como vitrine. */
  holderName?: string;
  cardNumber?: string;
  points?: number;
  width?: number;
};

/**
 * Cartão fidelidade premium: preto, detalhes dourados, brilho sutil
 * e leve inclinação no hover.
 */
export function LoyaltyCardVisual({ tier = 'URBAN_BLACK', holderName, cardNumber, points, width = 380 }: LoyaltyCardVisualProps) {
  const reduce = useReducedMotion();
  const { hover, handlers } = useInteraction();
  const sheen = useSharedValue(0);

  useEffect(() => {
    if (reduce) return;
    sheen.set(
      withRepeat(
        withSequence(withDelay(2200, withTiming(1, { duration: 1800, easing: easeInOut })), withTiming(0, { duration: 0 })),
        -1,
      ),
    );
  }, [reduce, sheen]);

  const tilt = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { translateY: interpolate(hover.value, [0, 1], [0, -8]) },
      { rotateX: `${interpolate(hover.value, [0, 1], [0, 6])}deg` },
      { rotateY: `${interpolate(hover.value, [0, 1], [0, -8])}deg` },
    ],
  }));
  const sheenStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(sheen.value, [0, 1], [-width, width * 1.4]) }, { rotate: '20deg' }],
  }));

  const height = width / 1.586;
  const isPreview = !holderName;

  return (
    <Pressable {...handlers} accessible accessibilityLabel={`Cartão fidelidade UrbanShop, nível ${TIER_LABEL[tier]}`}>
      <Animated.View style={[styles.shadow, { width, height, borderRadius: radius.xl }, tilt]}>
        <LinearGradient
          colors={['#1B1B1B', '#090909', '#121212']}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.xl }]}
        />
        {/* Linhas finas decorativas */}
        <View style={[styles.arc, { width: width * 0.9, height: width * 0.9, right: -width * 0.45, top: -width * 0.3 }]} />
        <View style={[styles.arc, { width: width * 0.65, height: width * 0.65, right: -width * 0.32, top: -width * 0.15 }]} />

        <View style={[StyleSheet.absoluteFill, styles.clip, { borderRadius: radius.xl }]} pointerEvents="none">
          <Animated.View style={[styles.sheen, { height: height * 2, top: -height / 2 }, sheenStyle]}>
            <LinearGradient
              colors={['rgba(226,201,143,0)', 'rgba(226,201,143,0.16)', 'rgba(226,201,143,0)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        <View style={[styles.border, { borderRadius: radius.xl }]} pointerEvents="none" />

        <View style={[styles.content, { padding: width * 0.065 }]}>
          <View style={styles.rowBetween}>
            <Logo size={width * 0.05} />
            <UText style={[styles.tier, { fontSize: width * 0.03 }]}>{TIER_LABEL[tier]}</UText>
          </View>

          <View style={[styles.chip, { width: width * 0.11, height: width * 0.085 }]}>
            <View style={styles.chipLine} />
            <View style={[styles.chipLine, { top: '66%' }]} />
          </View>

          <View style={styles.rowBetweenEnd}>
            <View style={styles.field}>
              <UText style={styles.fieldLabel}>{isPreview ? 'Programa' : 'Membro'}</UText>
              <UText style={[styles.fieldValue, { fontSize: width * 0.042 }]} numberOfLines={1}>
                {isPreview ? 'Cartão Fidelidade' : holderName}
              </UText>
              {cardNumber ? (
                <UText style={[styles.number, { fontSize: width * 0.032 }]}>{cardNumber}</UText>
              ) : null}
            </View>
            {points !== undefined ? (
              <View style={[styles.field, { alignItems: 'flex-end' }]}>
                <UText style={styles.fieldLabel}>Pontos</UText>
                <UText style={[styles.points, { fontSize: width * 0.06 }]}>
                  {points.toLocaleString('pt-BR')}
                </UText>
              </View>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 24 },
    elevation: 18,
  },
  clip: { overflow: 'hidden' },
  arc: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(200,167,94,0.22)',
  },
  sheen: { position: 'absolute', width: 120 },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  content: { flex: 1, justifyContent: 'space-between' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowBetweenEnd: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  tier: {
    fontFamily: fonts.bodyBold,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 2.4,
  },
  chip: {
    borderRadius: 6,
    backgroundColor: colors.goldDeep,
    borderWidth: 1,
    borderColor: colors.gold,
    overflow: 'hidden',
  },
  chipLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.goldLight,
  },
  field: { gap: 2, flexShrink: 1 },
  fieldLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
  },
  fieldValue: { fontFamily: fonts.headingBold, color: colors.white },
  number: { fontFamily: fonts.bodyMedium, color: colors.textMuted, letterSpacing: 2 },
  points: { fontFamily: fonts.heading, color: colors.goldLight },
});
