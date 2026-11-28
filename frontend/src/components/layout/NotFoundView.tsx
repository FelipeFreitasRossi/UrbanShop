import { Compass } from 'lucide-react-native';
import React from 'react';
import { Container } from './Container';
import { Screen } from './Screen';
import { Section } from './Section';
import { EmptyState } from '../ui/EmptyState';

/** Página 404. */
export function NotFoundView() {
  return (
    <Screen title="Página não encontrada" noIndex>
      <Section>
        <Container>
          <EmptyState
            icon={Compass}
            title="Página não encontrada"
            message="O endereço pode ter mudado ou não existe mais. Que tal voltar para a vitrine?"
            action={{ label: 'Ir para o início', href: '/' }}
          />
        </Container>
      </Section>
    </Screen>
  );
}
