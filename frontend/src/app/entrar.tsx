import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { AuthLayout } from '../components/forms/AuthLayout';
import { TextField } from '../components/forms/TextField';
import { Button } from '../components/ui/Button';
import { UText } from '../components/ui/UText';
import { ApiError, friendlyError } from '../services/api';
import { resendVerification } from '../services/auth';
import { useAuth } from '../state/auth';
import { makeStyles, useColors } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';
import { isValidEmail } from '../utils/validators';

/** Login do cliente. */
export default function LoginPage() {
  const styles = useStyles();
  const colors = useColors();
  const router = useRouter();
  const { login } = useAuth();
  const params = useLocalSearchParams<{
    redirect?: string;
    cadastro?: string;
    verificado?: string;
    senha?: string;
  }>();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState(false);

  const submit = async () => {
    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = 'Informe um e-mail válido.';
    if (!password) next.password = 'Informe sua senha.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setUnverified(false);
    try {
      await login(email, password);
      // Só aceita redirecionar para páginas internas do próprio app.
      const redirect =
        typeof params.redirect === 'string' && params.redirect.startsWith('/') ? params.redirect : '/perfil';
      router.replace(redirect);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setUnverified(true);
        setErrors({ form: 'Confirme seu e-mail para entrar. Enviamos um link quando você se cadastrou.' });
      } else if (e instanceof ApiError && e.status === 401) {
        // Mensagem genérica de propósito: não revela se o e-mail existe.
        setErrors({ form: 'E-mail ou senha incorretos.' });
      } else if (e instanceof ApiError && e.code === 'NOT_CONFIGURED') {
        setErrors({ form: 'O login estará disponível assim que o servidor da loja for ativado.' });
      } else {
        setErrors({ form: friendlyError(e) });
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await resendVerification(email);
      setResent(true);
    } catch (e) {
      setErrors({ form: friendlyError(e) });
    }
  };

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse seus pedidos, endereços, favoritos e o seu cartão fidelidade."
    >
      {params.verificado === 'ok' ? (
        <View style={styles.notice}>
          <UText variant="small" color={colors.text}>
            E-mail confirmado! Agora é só entrar com seu e-mail e senha.
          </UText>
        </View>
      ) : null}
      {params.verificado === 'erro' ? (
        <View style={styles.formError}>
          <UText variant="small" color={colors.danger}>
            Este link de confirmação expirou ou já foi usado. Entre com seu e-mail para receber um novo.
          </UText>
        </View>
      ) : null}
      {params.senha === 'ok' ? (
        <View style={styles.notice}>
          <UText variant="small" color={colors.text}>
            Senha alterada com sucesso. Entre com a nova senha.
          </UText>
        </View>
      ) : null}
      {params.cadastro === 'ok' ? (
        <View style={styles.notice}>
          <UText variant="small" color={colors.text}>
            Conta criada! Confirme seu e-mail pelo link que enviamos e depois entre aqui.
          </UText>
        </View>
      ) : null}

      <TextField
        label="E-mail"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
        }}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="voce@email.com"
      />
      <TextField
        ref={passwordRef}
        label="Senha"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
        }}
        error={errors.password}
        password
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <Link href="/recuperar-senha" asChild>
        <Pressable accessibilityRole="link" style={styles.forgot}>
          <UText variant="small" color={colors.gold}>
            Esqueci minha senha
          </UText>
        </Pressable>
      </Link>

      {errors.form ? (
        <View style={styles.formError} accessibilityLiveRegion="polite">
          <UText variant="small" color={colors.danger}>
            {errors.form}
          </UText>
          {unverified && !resent ? (
            <Pressable onPress={resend} accessibilityRole="button">
              <UText variant="small" color={colors.gold} style={styles.underline}>
                Reenviar e-mail de confirmação
              </UText>
            </Pressable>
          ) : null}
          {resent ? (
            <UText variant="small">E-mail reenviado. Confira sua caixa de entrada e o spam.</UText>
          ) : null}
        </View>
      ) : null}

      <Button label="Entrar" onPress={submit} loading={loading} fullWidth size="lg" />

      <View style={styles.divider} />

      <View style={styles.signup}>
        <UText variant="body">Ainda não tem conta?</UText>
        <Button label="Criar conta" href="/cadastro" variant="outline" fullWidth />
      </View>
    </AuthLayout>
  );
}

const useStyles = makeStyles((colors) => ({
  notice: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.goldSoft,
  },
  forgot: { alignSelf: 'flex-end', paddingVertical: 4, marginTop: -spacing.sm },
  formError: {
    gap: 6,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  underline: { textDecorationLine: 'underline' },
  divider: { height: 1, backgroundColor: colors.line },
  signup: { gap: spacing.sm, alignItems: 'center' },
}));
