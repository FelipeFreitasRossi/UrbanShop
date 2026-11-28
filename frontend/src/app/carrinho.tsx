import { ShoppingBag } from 'lucide-react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Container } from '../components/layout/Container';
import { Screen } from '../components/layout/Screen';
import { Section } from '../components/layout/Section';
import { EmptyState } from '../components/ui/EmptyState';
import { UText } from '../components/ui/UText';
import { Reveal } from '../motion/Reveal';
import { spacing } from '../theme/tokens';

/** Sacola. O carrinho completo (itens, frete, cupons, pontos) é construído na Etapa 6. */
export default function CartPage() {
  return (
    <Screen title="Sacola" noIndex>
      <Section tight>
        <Container>
          <Reveal variant="fade">
            <UText variant="eyebrow">Sua compra</UText>
          </Reveal>
          <Reveal delay={80}>
            <UText variant="h1" style={styles.title}>
              Sacola
            </UText>
          </Reveal>
          <EmptyState
            icon={ShoppingBag}
            title="Sua sacola está vazia"
            message="Explore as categorias e adicione suas peças favoritas."
            action={{ label: 'Ver novidades', href: '/novidades' }}
          />
        </Container>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm, marginBottom: spacing.xl },
});
