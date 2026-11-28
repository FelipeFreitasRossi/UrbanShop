import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import { AuthLayout } from '../components/forms/AuthLayout';
import { TextField } from '../components/forms/TextField';
import { Button } from '../components/ui/Button';
import { UText } from '../components/ui/UText';
import { friendlyError } from '../services/api';
import { resetPassword } from '../services/auth';
import { makeStyles, useColors } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';
import { isStrongPassword, passwordChecks } from '../utils/validators';

/** Aberta pelo link do e-mail "Redefinição de senha" (?token=...). */
export default function ResetPasswordPage() {
  const styles = useStyles();
  const colors = useColors();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const validToken = typeof token === 'string' && token.length > 20;

  const submit = async () => {
    const next: typeof errors = {};
    if (!isStrongPassword(password)) next.password = 'A senha não atende a todos os requisitos.';
    if (confirm !== password) next.confirm = 'As senhas não são iguais.';
    setErrors(next);
    if (Object.keys(next).length || !validToken) return;

    setLoading(true);
    try {
      await resetPassword(token as string, password);
      router.replace('/entrar?senha=ok');
    } catch (e) {
      setErrors({ form: friendlyError(e) });
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <AuthLayout title="Link inválido" subtitle="Este link de redefinição está incompleto ou expirou.">
        <Button label="Pedir um novo link" href="/recuperar-senha" fullWidth size="lg" />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Criar nova senha" subtitle="Escolha uma senha forte que você não use em outros sites.">
      <TextField
        label="Nova senha"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setErrors((e) => ({ ...e, password: undefined, form: undefined }));
        }}
        error={errors.password}
        password
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <View style={styles.checks}>
        {passwordChecks(password).map((c) => (
          <View key={c.label} style={styles.checkRow}>
            {c.ok ? (
              <Check size={14} color={colors.success} strokeWidth={3} />
            ) : (
              <View style={styles.checkDot} />
            )}
            <UText variant="small" color={c.ok ? colors.text : colors.textMuted}>
              {c.label}
            </UText>
          </View>
        ))}
      </View>
      <TextField
        label="Confirmar nova senha"
        value={confirm}
        onChangeText={(t) => {
          setConfirm(t);
          setErrors((e) => ({ ...e, confirm: undefined, form: undefined }));
        }}
        error={errors.confirm}
        password
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={submit}
      />
      {errors.form ? (
        <View style={styles.formError} accessibilityLiveRegion="polite">
          <UText variant="small" color={colors.danger}>
            {errors.form}
          </UText>
        </View>
      ) : null}
      <Button label="Salvar nova senha" onPress={submit} loading={loading} fullWidth size="lg" />
    </AuthLayout>
  );
}

const useStyles = makeStyles((colors) => ({
  checks: { gap: 6, marginTop: -spacing.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: colors.lineStrong },
  formError: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.danger },
}));
