import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Container } from '../components/layout/Container';
import { Screen } from '../components/layout/Screen';
import { Section } from '../components/layout/Section';
import { LoyaltyCardVisual } from '../components/loyalty/LoyaltyCardVisual';
import { UText } from '../components/ui/UText';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Reveal } from '../motion/Reveal';
import { colors, radius, spacing } from '../theme/tokens';

/**
 * Área do cliente. Login, cadastro, endereços e cartão fidelidade real
 * são implementados nas Etapas 4 e 7; esta página apresenta o que vem aí.
 */
export default function ProfilePage() {
  const { isDesktop, pick, width } = useBreakpoint();

  return (
    <Screen title="Minha conta" noIndex>
      <Section tight>
        <Container>
          <View style={[styles.layout, { flexDirection: isDesktop ? 'row' : 'column', gap: pick(40, 48, 80) }]}>
            <View style={[styles.texts, isDesktop && { flex: 1 }]}>
              <Reveal variant="fade">
                <UText variant="eyebrow">Minha conta</UText>
              </Reveal>
              <Reveal delay={80}>
                <UText variant="h1" style={styles.title}>
                  Sua conta UrbanShop
                </UText>
              </Reveal>
              <Reveal delay={160}>
                <UText variant="bodyLg" style={styles.lead}>
                  Com a conta você acompanha pedidos, salva endereços e recebe automaticamente o
                  cartão fidelidade digital para acumular pontos em compras confirmadas.
                </UText>
              </Reveal>
              <Reveal delay={240}>
                <View style={styles.notice}>
                  <UText variant="title">Cadastro e login em breve</UText>
                  <UText variant="small">
                    O acesso à conta será liberado junto com o sistema de cadastro seguro.
                  </UText>
                </View>
              </Reveal>
            </View>
            <View style={[styles.card, isDesktop && { flex: 1 }]}>
              <Reveal variant="zoom" delay={120}>
                <LoyaltyCardVisual width={Math.min(pick(width - 40, 420, 440), 440)} />
              </Reveal>
            </View>
          </View>
        </Container>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: { alignItems: 'center' },
  texts: { maxWidth: 560, width: '100%' },
  title: { marginTop: spacing.sm },
  lead: { marginTop: spacing.md },
  notice: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    gap: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.goldSoft,
  },
  card: { alignItems: 'center' },
});
