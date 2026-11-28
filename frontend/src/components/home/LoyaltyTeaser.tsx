import { Gift, Sparkles, Truck } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Reveal } from '../../motion/Reveal';
import { radius, spacing } from '../../theme/tokens';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { LoyaltyCardVisual, TIER_LABEL, type LoyaltyTier } from '../loyalty/LoyaltyCardVisual';
import { Button } from '../ui/Button';
import { UText } from '../ui/UText';
import { makeStyles, useColors } from '../../theme/ThemeProvider';

const TIERS: LoyaltyTier[] = ['URBAN_BASIC', 'URBAN_SILVER', 'URBAN_GOLD', 'URBAN_BLACK'];

const BENEFITS = [
  { icon: Gift, title: 'Cupons de desconto', text: 'Troque seus pontos por descontos nas próximas compras.' },
  {
    icon: Truck,
    title: 'Frete grátis',
    text: 'Use pontos para zerar o frete quando o resgate estiver disponível.',
  },
  {
    icon: Sparkles,
    title: 'Acesso antecipado',
    text: 'Níveis mais altos conhecem as coleções antes de todo mundo.',
  },
];

/** Apresenta o programa de fidelidade e incentiva o cadastro. */
export function LoyaltyTeaser() {
  const colors = useColors();
  const styles = useStyles();
  const { isDesktop, pick, width } = useBreakpoint();
  const cardWidth = Math.min(pick(width - 40, 420, 440), 440);

  return (
    <Section style={styles.section}>
      <Container>
        <View style={[styles.layout, { flexDirection: isDesktop ? 'row' : 'column', gap: pick(48, 56, 96) }]}>
          <View style={[styles.texts, isDesktop && { flex: 1 }]}>
            <Reveal variant="fade">
              <UText variant="eyebrow">Programa de fidelidade</UText>
            </Reveal>
            <Reveal delay={80}>
              <UText variant="h1" style={styles.title}>
                Cada compra{'\n'}vale mais.
              </UText>
            </Reveal>
            <Reveal delay={160}>
              <UText variant="bodyLg" style={styles.lead}>
                Ao criar sua conta você recebe automaticamente o cartão fidelidade digital UrbanShop. Suas
                compras confirmadas viram pontos, e os pontos viram benefícios.
              </UText>
            </Reveal>

            <View style={styles.benefits}>
              {BENEFITS.map((b, i) => {
                const Icon = b.icon;
                return (
                  <Reveal key={b.title} delay={200 + i * 90}>
                    <View style={styles.benefit}>
                      <View style={styles.benefitIcon}>
                        <Icon size={18} color={colors.gold} strokeWidth={1.6} />
                      </View>
                      <View style={styles.benefitText}>
                        <UText variant="title">{b.title}</UText>
                        <UText variant="small">{b.text}</UText>
                      </View>
                    </View>
                  </Reveal>
                );
              })}
            </View>

            <Reveal delay={480}>
              <View style={styles.tiers}>
                {TIERS.map((t, i) => (
                  <View key={t} style={styles.tier}>
                    <View style={[styles.tierDot, i === TIERS.length - 1 && styles.tierDotGold]} />
                    <UText variant="caption" color={i === TIERS.length - 1 ? colors.gold : colors.textMuted}>
                      {TIER_LABEL[t]}
                    </UText>
                  </View>
                ))}
                <View style={styles.tierLine} pointerEvents="none" />
              </View>
            </Reveal>

            <Reveal delay={560}>
              <Button
                label="Criar minha conta"
                href="/perfil"
                variant="gold"
                arrow
                size="lg"
                style={styles.cta}
              />
            </Reveal>
          </View>

          <View style={[styles.cardSide, isDesktop && { flex: 1 }]}>
            <Reveal variant="zoom" delay={150} duration={1100}>
              <LoyaltyCardVisual width={cardWidth} />
            </Reveal>
          </View>
        </View>
      </Container>
    </Section>
  );
}

const useStyles = makeStyles((colors) => ({
  section: {
    backgroundColor: colors.ink,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  layout: { alignItems: 'center' },
  texts: { maxWidth: 560, width: '100%' },
  title: { marginTop: spacing.md },
  lead: { marginTop: spacing.md },
  benefits: { marginTop: spacing.xl, gap: spacing.lg },
  benefit: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.goldLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: { flex: 1, gap: 2 },
  tiers: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  tier: { alignItems: 'center', gap: 8, zIndex: 1, flex: 1 },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  tierDotGold: { backgroundColor: colors.gold, borderColor: colors.gold },
  tierLine: {
    position: 'absolute',
    top: 8.5,
    left: '12.5%',
    right: '12.5%',
    height: 1,
    backgroundColor: colors.line,
  },
  cta: { marginTop: spacing.xl, alignSelf: 'flex-start' },
  cardSide: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.xl },
}));
