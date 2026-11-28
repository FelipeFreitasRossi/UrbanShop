import { useLocalSearchParams } from 'expo-router';
import { FileText } from 'lucide-react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Container } from '../../components/layout/Container';
import { NotFoundView } from '../../components/layout/NotFoundView';
import { Screen } from '../../components/layout/Screen';
import { Section } from '../../components/layout/Section';
import { EmptyState } from '../../components/ui/EmptyState';
import { UText } from '../../components/ui/UText';
import { INSTITUTIONAL } from '../../config/navigation';
import { site } from '../../config/site';
import { Reveal } from '../../motion/Reveal';
import { spacing } from '../../theme/tokens';

export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return INSTITUTIONAL.map((p) => ({ slug: p.slug }));
}

/**
 * Páginas institucionais. Os textos (políticas, termos, trocas) dependem de
 * informações jurídicas e comerciais reais da empresa e serão adicionados
 * quando estiverem definidos — não publicamos textos inventados.
 */
export default function InstitutionalPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const page = INSTITUTIONAL.find((p) => p.slug === slug);
  if (!page) return <NotFoundView />;

  return (
    <Screen title={page.label}>
      <Section tight>
        <Container>
          <Reveal variant="fade">
            <UText variant="eyebrow">Institucional</UText>
          </Reveal>
          <Reveal delay={80}>
            <UText variant="h1" style={styles.title}>
              {page.label}
            </UText>
          </Reveal>
          <EmptyState
            icon={FileText}
            title="Conteúdo em preparação"
            message={
              site.supportEmail
                ? `Enquanto isso, fale com a gente pelo e-mail ${site.supportEmail}.`
                : 'Esta página será publicada em breve.'
            }
            action={{ label: 'Voltar ao início', href: '/' }}
          />
        </Container>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm, marginBottom: spacing.xl },
});
