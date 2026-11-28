import { useRouter } from 'expo-router';
import { LogOut, MailWarning, MapPin, Package, Settings } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Container } from '../components/layout/Container';
import { Screen } from '../components/layout/Screen';
import { Section } from '../components/layout/Section';
import { LoyaltyCardVisual } from '../components/loyalty/LoyaltyCardVisual';
import { Button } from '../components/ui/Button';
import { UText } from '../components/ui/UText';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Reveal } from '../motion/Reveal';
import { useAuth } from '../state/auth';
import { makeStyles, useColors } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';
import { formatCEP } from '../utils/validators';

/** Área do cliente: visitante vê o convite para entrar; cliente logado vê sua conta. */
export default function ProfilePage() {
  const styles = useStyles();
  const colors = useColors();
  const router = useRouter();
  const { status, user, logout } = useAuth();
  const { isDesktop, pick, width } = useBreakpoint();
  const [leaving, setLeaving] = useState(false);
  const cardWidth = Math.min(pick(width - 40, 420, 440), 440);

  if (status === 'loading') {
    return (
      <Screen title="Minha conta" noIndex>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.gold} />
        </View>
      </Screen>
    );
  }

  // ---------- Visitante ----------
  if (!user) {
    return (
      <Screen title="Minha conta" noIndex>
        <Section tight>
          <Container>
            <View
              style={[styles.layout, { flexDirection: isDesktop ? 'row' : 'column', gap: pick(40, 48, 80) }]}
            >
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
                    Com a conta você acompanha pedidos, salva endereços e recebe automaticamente o cartão
                    fidelidade digital para acumular pontos em compras confirmadas.
                  </UText>
                </Reveal>
                <Reveal delay={240}>
                  <View style={[styles.actions, !isDesktop && styles.actionsColumn]}>
                    <Button label="Entrar" href="/entrar" size="lg" fullWidth={!isDesktop} />
                    <Button
                      label="Criar conta"
                      href="/cadastro"
                      variant="outline"
                      size="lg"
                      fullWidth={!isDesktop}
                    />
                  </View>
                </Reveal>
              </View>
              <View style={[styles.card, isDesktop && { flex: 1 }]}>
                <Reveal variant="zoom" delay={120}>
                  <LoyaltyCardVisual width={cardWidth} />
                </Reveal>
              </View>
            </View>
          </Container>
        </Section>
      </Screen>
    );
  }

  // ---------- Cliente logado ----------
  const firstName = user.name.split(' ')[0];
  const mainAddress = user.addresses.find((a) => a.isDefault) ?? user.addresses[0];

  const doLogout = async () => {
    setLeaving(true);
    await logout();
    router.replace('/');
  };

  return (
    <Screen title="Minha conta" noIndex>
      <Section tight>
        <Container>
          <Reveal variant="fade">
            <UText variant="eyebrow">Minha conta</UText>
          </Reveal>
          <Reveal delay={60}>
            <UText variant="h1" style={styles.title}>
              Olá, {firstName}
            </UText>
          </Reveal>

          {!user.emailVerified ? (
            <View style={styles.warning}>
              <MailWarning size={18} color={colors.gold} />
              <UText variant="small" color={colors.text} style={styles.flex}>
                Confirme seu e-mail pelo link que enviamos para {user.email}.
              </UText>
            </View>
          ) : null}

          <View
            style={[
              styles.layout,
              { flexDirection: isDesktop ? 'row' : 'column', gap: pick(32, 40, 64), marginTop: spacing.xl },
            ]}
          >
            <View style={[styles.card, isDesktop && { flex: 1 }]}>
              {/* Pontos e nível aparecem quando o programa de fidelidade estiver ativo no servidor (Etapa 7). */}
              <LoyaltyCardVisual width={cardWidth} holderName={user.name} />
            </View>

            <View style={[styles.panel, isDesktop && { flex: 1 }]}>
              <InfoRow label="E-mail" value={user.email} />
              <InfoRow label="Celular" value={user.phone} />
              {user.cpfMasked ? <InfoRow label="CPF" value={user.cpfMasked} /> : null}
              {mainAddress ? (
                <InfoRow
                  label="Endereço principal"
                  value={`${mainAddress.street}, ${mainAddress.number}${mainAddress.complement ? ` – ${mainAddress.complement}` : ''}\n${mainAddress.neighborhood} · ${mainAddress.city}/${mainAddress.state} · ${formatCEP(mainAddress.zipCode)}`}
                />
              ) : null}

              <View style={styles.shortcuts}>
                <Shortcut icon={Package} label="Meus pedidos" note="Em breve" />
                <Shortcut icon={MapPin} label="Endereços" note="Em breve" />
                <Shortcut
                  icon={Settings}
                  label="Configurações"
                  onPress={() => router.push('/configuracoes')}
                />
              </View>

              <Pressable
                onPress={doLogout}
                disabled={leaving}
                accessibilityRole="button"
                style={styles.logout}
              >
                <LogOut size={18} color={colors.danger} />
                <UText variant="label" color={colors.danger}>
                  {leaving ? 'Saindo…' : 'Sair da conta'}
                </UText>
              </Pressable>
            </View>
          </View>
        </Container>
      </Section>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.infoRow}>
      <UText variant="caption" style={styles.infoLabel}>
        {label}
      </UText>
      <UText variant="body" style={styles.infoValue}>
        {value}
      </UText>
    </View>
  );
}

function Shortcut({
  icon: Icon,
  label,
  note,
  onPress,
}: {
  icon: typeof Package;
  label: string;
  note?: string;
  onPress?: () => void;
}) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}
      style={[styles.shortcut, !onPress && styles.shortcutDisabled]}
    >
      <Icon size={20} color={colors.gold} strokeWidth={1.6} />
      <UText variant="title">{label}</UText>
      {note ? <UText variant="caption">{note}</UText> : null}
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  loading: { paddingVertical: 160, alignItems: 'center' },
  layout: { alignItems: 'center' },
  texts: { maxWidth: 560, width: '100%' },
  title: { marginTop: spacing.sm },
  lead: { marginTop: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  actionsColumn: { flexDirection: 'column' },
  card: { alignItems: 'center' },
  flex: { flex: 1 },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.goldSoft,
  },
  panel: {
    width: '100%',
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  infoRow: { gap: 2 },
  infoLabel: { textTransform: 'uppercase', letterSpacing: 1.2 },
  infoValue: { color: colors.text },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  shortcut: {
    flexGrow: 1,
    flexBasis: 140,
    padding: spacing.md,
    gap: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ink,
  },
  shortcutDisabled: { opacity: 0.6 },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
}));
