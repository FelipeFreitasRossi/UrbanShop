import { useRouter } from 'expo-router';
import {
  Check,
  ChevronRight,
  LogIn,
  Monitor,
  Moon,
  ShieldCheck,
  Sun,
  User,
  type LucideIcon,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Container } from '../components/layout/Container';
import { Screen } from '../components/layout/Screen';
import { Section } from '../components/layout/Section';
import { UText } from '../components/ui/UText';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Reveal } from '../motion/Reveal';
import { useAuth } from '../state/auth';
import { darkPalette, lightPalette, type Palette } from '../theme/palettes';
import { makeStyles, useColors, useTheme, type ThemeMode } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';

const THEMES: { mode: ThemeMode; label: string; description: string; icon: LucideIcon }[] = [
  {
    mode: 'dark',
    label: 'Escuro',
    description: 'Preto com detalhes dourados. O visual original da marca.',
    icon: Moon,
  },
  { mode: 'light', label: 'Claro', description: 'Fundo claro, ideal para ambientes iluminados.', icon: Sun },
  {
    mode: 'system',
    label: 'Automático',
    description: 'Acompanha o tema do seu celular ou computador.',
    icon: Monitor,
  },
];

/** Configurações do app: tema e atalhos da conta. */
export default function SettingsPage() {
  const styles = useStyles();
  const colors = useColors();
  const router = useRouter();
  const { mode, setMode } = useTheme();
  const { user } = useAuth();
  const { isMobile } = useBreakpoint();

  return (
    <Screen title="Configurações" noIndex>
      <Section tight>
        <Container style={styles.container}>
          <Reveal variant="fade">
            <UText variant="eyebrow">Preferências</UText>
          </Reveal>
          <Reveal delay={60}>
            <UText variant="h1" style={styles.title}>
              Configurações
            </UText>
          </Reveal>

          {/* Aparência */}
          <Reveal delay={120}>
            <UText variant="label" style={styles.groupTitle}>
              Aparência
            </UText>
            <View style={[styles.themeGrid, { flexDirection: isMobile ? 'column' : 'row' }]}>
              {THEMES.map((t) => {
                const selected = mode === t.mode;
                const Icon = t.icon;
                return (
                  <Pressable
                    key={t.mode}
                    onPress={() => setMode(t.mode)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={`Tema ${t.label}`}
                    style={[
                      styles.themeCard,
                      !isMobile && styles.themeCardWide,
                      selected && styles.themeCardSelected,
                    ]}
                  >
                    <ThemePreview mode={t.mode} />
                    <View style={styles.themeInfo}>
                      <View style={styles.themeTitleRow}>
                        <Icon size={16} color={selected ? colors.gold : colors.textMuted} strokeWidth={1.8} />
                        <UText variant="title">{t.label}</UText>
                        {selected ? (
                          <View style={styles.check}>
                            <Check size={12} color={colors.black} strokeWidth={3} />
                          </View>
                        ) : null}
                      </View>
                      <UText variant="small">{t.description}</UText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Reveal>

          {/* Conta */}
          <Reveal delay={180}>
            <UText variant="label" style={styles.groupTitle}>
              Conta
            </UText>
            <View style={styles.list}>
              {user ? (
                <SettingsRow
                  icon={User}
                  label="Minha conta"
                  detail={user.email}
                  onPress={() => router.push('/perfil')}
                />
              ) : (
                <SettingsRow
                  icon={LogIn}
                  label="Entrar ou criar conta"
                  onPress={() => router.push('/entrar')}
                />
              )}
              <SettingsRow
                icon={ShieldCheck}
                label="Privacidade e dados pessoais"
                onPress={() => router.push('/institucional/privacidade')}
              />
            </View>
          </Reveal>
        </Container>
      </Section>
    </Screen>
  );
}

/** Miniatura do tema: mostra como a loja fica em cada opção. */
function ThemePreview({ mode }: { mode: ThemeMode }) {
  const styles = useStyles();
  const half = (p: Palette) => (
    <View style={[styles.previewHalf, { backgroundColor: p.black }]}>
      <View style={[styles.previewBar, { backgroundColor: p.text, width: '60%' }]} />
      <View style={[styles.previewBar, { backgroundColor: p.textDim, width: '40%' }]} />
      <View style={[styles.previewDot, { backgroundColor: p.gold }]} />
    </View>
  );
  return (
    <View style={styles.preview}>
      {mode === 'system' ? (
        <>
          {half(darkPalette)}
          {half(lightPalette)}
        </>
      ) : (
        half(mode === 'light' ? lightPalette : darkPalette)
      )}
    </View>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  detail,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  detail?: string;
  onPress: () => void;
}) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.row}>
      <Icon size={20} color={colors.gold} strokeWidth={1.6} />
      <View style={styles.rowText}>
        <UText variant="title">{label}</UText>
        {detail ? <UText variant="small">{detail}</UText> : null}
      </View>
      <ChevronRight size={18} color={colors.textDim} />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { maxWidth: 880 },
  title: { marginTop: spacing.sm },
  groupTitle: { marginTop: spacing.xxl, marginBottom: spacing.md, color: colors.textMuted },
  themeGrid: { gap: spacing.sm },
  themeCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
    padding: spacing.sm,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeCardWide: { flex: 1, flexDirection: 'column', alignItems: 'stretch' },
  themeCardSelected: { borderColor: colors.gold },
  themeInfo: { flex: 1, gap: 4, padding: 4 },
  themeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  check: {
    marginLeft: 'auto',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    flexDirection: 'row',
    height: 72,
    minWidth: 96,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  previewHalf: { flex: 1, padding: 10, gap: 6 },
  previewBar: { height: 6, borderRadius: 3 },
  previewDot: { width: 10, height: 10, borderRadius: 5, marginTop: 'auto' },
  list: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowText: { flex: 1, gap: 2 },
}));
