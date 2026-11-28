import { CircleAlert, Eye, EyeOff } from 'lucide-react-native';
import React, { forwardRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { makeStyles, useColors } from '../../theme/ThemeProvider';
import { fonts, radius, spacing } from '../../theme/tokens';
import { UText } from '../ui/UText';

/** Remove o contorno azul padrão do navegador (a borda dourada já indica o foco). */
const webInputReset = { outlineStyle: 'none' } as unknown as TextStyle;

export type TextFieldProps = Omit<TextInputProps, 'onChangeText' | 'value'> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  /** Máscara aplicada enquanto digita (ex.: formatCPF). */
  mask?: (value: string) => string;
  /** Mensagem de erro (deixa o campo vermelho). */
  error?: string | null;
  /** Texto de ajuda abaixo do campo (ex.: por que pedimos o CPF). */
  hint?: string;
  /** Campo de senha com botão de mostrar/ocultar. */
  password?: boolean;
  optional?: boolean;
  loading?: boolean;
  /** Ícone/elemento à direita (ex.: ✓ de CEP encontrado). */
  right?: React.ReactNode;
};

/** Campo de formulário com rótulo, máscara, erro, ajuda e foco dourado. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    value,
    onChangeText,
    mask,
    error,
    hint,
    password,
    optional,
    loading,
    right,
    onFocus,
    onBlur,
    editable = true,
    ...rest
  },
  ref,
) {
  const styles = useStyles();
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.gold : colors.lineStrong;

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <UText variant="small" color={colors.text} style={styles.label}>
          {label}
        </UText>
        {optional ? <UText variant="caption">Opcional</UText> : null}
      </View>

      <View style={[styles.box, { borderColor }, !editable && styles.disabled]}>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={(t) => onChangeText(mask ? mask(t) : t)}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          editable={editable}
          secureTextEntry={password && !visible}
          placeholderTextColor={colors.textDim}
          accessibilityLabel={label}
          accessibilityHint={hint}
          style={[styles.input, webInputReset]}
          {...rest}
        />
        {loading ? <ActivityIndicator size="small" color={colors.gold} /> : null}
        {right}
        {password ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
            hitSlop={10}
          >
            {visible ? (
              <EyeOff size={18} color={colors.textMuted} />
            ) : (
              <Eye size={18} color={colors.textMuted} />
            )}
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.messageRow} accessibilityLiveRegion="polite">
          <CircleAlert size={14} color={colors.danger} />
          <UText variant="small" color={colors.danger} style={styles.message}>
            {error}
          </UText>
        </View>
      ) : hint ? (
        <UText variant="caption" style={styles.hint}>
          {hint}
        </UText>
      ) : null}
    </View>
  );
});

const useStyles = makeStyles((colors) => ({
  wrap: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { fontFamily: fonts.bodySemiBold },
  box: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.ink,
  },
  disabled: { opacity: 0.6 },
  input: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 12,
  },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  message: { flex: 1 },
  hint: { lineHeight: 17 },
}));
