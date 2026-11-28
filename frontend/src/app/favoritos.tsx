import { Heart } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Container } from '../components/layout/Container';
import { Screen } from '../components/layout/Screen';
import { Section } from '../components/layout/Section';
import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { UText } from '../components/ui/UText';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Reveal } from '../motion/Reveal';
import { useFavorites } from '../state/favorites';
import { spacing } from '../theme/tokens';

export default function FavoritesPage() {
  const { items, enabled } = useFavorites();
  const { pick } = useBreakpoint();
  const cols = pick(2, 3, 4);
  const gap = pick(12, 20, 24);

  return (
    <Screen title="Favoritos" noIndex>
      <Section tight>
        <Container>
          <Reveal variant="fade">
            <UText variant="eyebrow">Sua seleção</UText>
          </Reveal>
          <Reveal delay={80}>
            <UText variant="h1" style={styles.title}>
              Favoritos
            </UText>
          </Reveal>

          {!enabled ? (
            <EmptyState
              icon={Heart}
              title="Entre para ver seus favoritos"
              message="Curtir produtos é exclusivo para clientes cadastrados. Crie sua conta grátis em menos de 2 minutos."
              action={{ label: 'Criar conta', href: '/cadastro' }}
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Nenhum favorito ainda"
              message="Toque no coração dos produtos para guardar suas peças preferidas aqui."
              action={{ label: 'Explorar novidades', href: '/novidades' }}
            />
          ) : (
            <View style={[styles.grid, { marginHorizontal: -gap / 2, rowGap: pick(28, 36, 48) }]}>
              {items.map((p, i) => (
                <View
                  key={p.id}
                  style={{ width: `${100 / cols}%` as `${number}%`, paddingHorizontal: gap / 2 }}
                >
                  <ProductCard product={p} index={i % cols} />
                </View>
              ))}
            </View>
          )}
        </Container>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm, marginBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
