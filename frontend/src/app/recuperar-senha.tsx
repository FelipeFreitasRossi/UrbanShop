import { CircleCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import { AuthLayout } from '../components/forms/AuthLayout';
import { TextField } from '../components/forms/TextField';
import { Button } from '../components/ui/Button';
import { UText } from '../components/ui/UText';
import { ApiError, friendlyError } from '../services/api';
import { forgotPassword } from '../services/auth';
import { makeStyles, useColors } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';
import { isValidEmail } from '../utils/validators';

/** Pedido de redefinição de senha. O link chega por e-mail e expira em pouco tempo. */
export default function ForgotPasswordPage() {
  const styles = useStyles();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (e) {
      setError(
        e instanceof ApiError && e.code === 'NOT_CONFIGURED'
          ? 'A recuperação de senha estará disponível assim que o servidor da loja for ativado.'
          : friendlyError(e),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
    >
      {sent ? (
        <View style={styles.success} accessibilityLiveRegion="polite">
          <CircleCheck size={22} color={colors.success} />
          <UText variant="body" color={colors.text} style={styles.successText}>
            Se existir uma conta com esse e-mail, você receberá o link em alguns minutos. Confira também a
            caixa de spam.
          </UText>
        </View>
      ) : (
        <>
          <TextField
            label="E-mail"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError(null);
            }}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={submit}
          />
          <Button label="Enviar link" onPress={submit} loading={loading} fullWidth size="lg" />
        </>
      )}
      <Button label="Voltar para o login" href="/entrar" variant="ghost" />
    </AuthLayout>
  );
}

const useStyles = makeStyles((colors) => ({
  success: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'flex-start',
  },
  successText: { flex: 1 },
}));
