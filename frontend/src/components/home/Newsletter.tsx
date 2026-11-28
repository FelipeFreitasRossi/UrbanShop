import { Link } from 'expo-router';
import { Check, CircleCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, TextInput, View, type TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Reveal } from '../../motion/Reveal';
import { friendlyError, ApiError } from '../../services/api';
import { EMAIL_REGEX, subscribeNewsletter } from '../../services/newsletter';
import { fonts, radius, spacing } from '../../theme/tokens';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';
import { Button } from '../ui/Button';
import { UText } from '../ui/UText';
import { makeStyles, useColors } from '../../theme/ThemeProvider';

type Status = 'idle' | 'sending' | 'done';

/** Remove o contorno azul padrão do navegador (a borda dourada já indica o foco). */
const webInputReset = { outlineStyle: 'none' } as unknown as TextStyle;

/** Cadastro na newsletter com validação, consentimento (LGPD) e envio para a API. */
export function Newsletter() {
  const colors = useColors();
  const styles = useStyles();
  const { isMobile } = useBreakpoint();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const submit = async () => {
    const value = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(value)) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (!consent) {
      setError('Para continuar, autorize o envio de comunicações.');
      return;
    }
    setError(null);
    setStatus('sending');
    try {
      await subscribeNewsletter({ email: value, consent: true, source: 'home' });
      setStatus('done');
    } catch (e) {
      setStatus('idle');
      setError(
        e instanceof ApiError && e.code === 'NOT_CONFIGURED'
          ? 'O cadastro na newsletter abre em breve. Tente novamente mais tarde.'
          : friendlyError(e),
      );
    }
  };

  const inputBorder = useAnimatedStyle(() => ({
    borderColor: withTiming(error ? colors.danger : focused ? colors.gold : colors.lineStrong, {
      duration: 200,
    }),
  }));

  return (
    <Section>
      <Container>
        <View style={styles.box}>
          <Reveal variant="fade">
            <UText variant="eyebrow" align="center">
              Newsletter
            </UText>
          </Reveal>
          <Reveal delay={80}>
            <UText variant="h2" align="center" style={styles.title}>
              Seja o primeiro a saber.
            </UText>
          </Reveal>
          <Reveal delay={160}>
            <UText variant="body" align="center" style={styles.lead}>
              Lançamentos, acessos antecipados e ofertas exclusivas no seu e-mail. Sem excesso: só o que vale
              a pena.
            </UText>
          </Reveal>

          <Reveal delay={240} style={styles.formWrap}>
            {status === 'done' ? (
              <View style={styles.success} accessibilityLiveRegion="polite">
                <CircleCheck size={22} color={colors.success} />
                <UText variant="title">Inscrição confirmada. Obrigado!</UText>
              </View>
            ) : (
              <>
                <View style={[styles.form, isMobile && styles.formMobile]}>
                  <Animated.View style={[styles.inputWrap, inputBorder]}>
                    <TextInput
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        if (error) setError(null);
                      }}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      onSubmitEditing={submit}
                      placeholder="Seu melhor e-mail"
                      placeholderTextColor={colors.textDim}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      textContentType="emailAddress"
                      inputMode="email"
                      returnKeyType="send"
                      accessibilityLabel="E-mail para newsletter"
                      style={[styles.input, webInputReset]}
                    />
                  </Animated.View>
                  <Button
                    label="Inscrever"
                    onPress={submit}
                    loading={status === 'sending'}
                    fullWidth={isMobile}
                    style={!isMobile ? styles.button : undefined}
                  />
                </View>

                <ConsentCheckbox checked={consent} onChange={setConsent} />

                {error ? (
                  <UText
                    variant="small"
                    color={colors.danger}
                    align="center"
                    accessibilityLiveRegion="polite"
                  >
                    {error}
                  </UText>
                ) : null}
              </>
            )}
          </Reveal>
        </View>
      </Container>
    </Section>
  );
}

function ConsentCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const colors = useColors();
  const styles = useStyles();
  const box = useAnimatedStyle(() => ({
    backgroundColor: withTiming(checked ? colors.gold : 'rgba(0,0,0,0)', { duration: 180 }),
    borderColor: withTiming(checked ? colors.gold : colors.lineStrong, { duration: 180 }),
  }));
  return (
    <View style={styles.consentRow}>
      <Pressable
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel="Autorizo o envio de comunicações da UrbanShop por e-mail"
        hitSlop={8}
        style={styles.consentHit}
      >
        <Animated.View style={[styles.checkbox, box]}>
          {checked ? <Check size={13} color={colors.black} strokeWidth={3} /> : null}
        </Animated.View>
      </Pressable>
      <UText variant="small" style={styles.consentText}>
        Autorizo a UrbanShop a enviar novidades e ofertas para este e-mail. Posso cancelar quando quiser.
        Saiba mais na{' '}
        <Link href="/institucional/privacidade" style={styles.consentLink}>
          Política de privacidade
        </Link>
        .
      </UText>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  box: { maxWidth: 640, width: '100%', alignSelf: 'center', alignItems: 'center' },
  title: { marginTop: spacing.md },
  lead: { marginTop: spacing.sm, maxWidth: 520 },
  formWrap: { width: '100%', marginTop: spacing.xl },
  form: { flexDirection: 'row', gap: spacing.sm, width: '100%' },
  formMobile: { flexDirection: 'column' },
  inputWrap: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.pill,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  input: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 12,
  },
  button: { alignSelf: 'center' },
  consentRow: { flexDirection: 'row', gap: 12, marginTop: spacing.md, alignItems: 'flex-start' },
  consentHit: { paddingTop: 2 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentText: { flex: 1 },
  consentLink: { color: colors.gold, textDecorationLine: 'underline' },
  success: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
  },
}));
