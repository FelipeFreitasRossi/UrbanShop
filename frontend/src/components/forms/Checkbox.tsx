import { Check } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { makeStyles, useColors } from '../../theme/ThemeProvider';
import { UText } from '../ui/UText';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Texto (pode conter links). */
  children: React.ReactNode;
  accessibilityLabel: string;
  error?: string | null;
};

/** Caixa de seleção para consentimentos (LGPD) e opções. */
export function Checkbox({ checked, onChange, children, accessibilityLabel, error }: CheckboxProps) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          onPress={() => onChange(!checked)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel={accessibilityLabel}
          hitSlop={10}
          style={[
            styles.box,
            { borderColor: error ? colors.danger : checked ? colors.gold : colors.lineStrong },
            checked && { backgroundColor: colors.gold },
          ]}
        >
          {checked ? <Check size={13} color={colors.black} strokeWidth={3} /> : null}
        </Pressable>
        <View style={styles.text}>{children}</View>
      </View>
      {error ? (
        <UText variant="small" color={colors.danger} style={styles.error}>
          {error}
        </UText>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(() => ({
  wrap: { gap: 4 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  text: { flex: 1 },
  error: { marginLeft: 34 },
}));
