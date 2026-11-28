import React from 'react';
import { View } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Reveal } from '../../motion/Reveal';
import { makeStyles } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/tokens';
import { Container } from '../layout/Container';
import { Screen } from '../layout/Screen';
import { Section } from '../layout/Section';
import { UText } from '../ui/UText';

type AuthLayoutProps = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Largura máxima do cartão do formulário. */
  maxWidth?: number;
};

/** Estrutura das telas de login, cadastro e recuperação de senha. */
export function AuthLayout({
  title,
  eyebrow = 'Minha conta',
  subtitle,
  children,
  maxWidth = 520,
}: AuthLayoutProps) {
  const styles = useStyles();
  const { isMobile } = useBreakpoint();

  return (
    <Screen title={title} noIndex footer={!isMobile}>
      <Section tight>
        <Container>
          <View style={[styles.wrap, { maxWidth }]}>
            <Reveal variant="fade">
              <UText variant="eyebrow">{eyebrow}</UText>
            </Reveal>
            <Reveal delay={60}>
              <UText variant="h1" style={styles.title} accessibilityRole="header">
                {title}
              </UText>
            </Reveal>
            {subtitle ? (
              <Reveal delay={100}>
                <UText variant="body" style={styles.subtitle}>
                  {subtitle}
                </UText>
              </Reveal>
            ) : null}
            <View style={[styles.card, isMobile && styles.cardMobile]}>{children}</View>
          </View>
        </Container>
      </Section>
    </Screen>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { width: '100%', alignSelf: 'center' },
  title: { marginTop: spacing.sm },
  subtitle: { marginTop: spacing.sm },
  card: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  cardMobile: { padding: spacing.lg },
}));
