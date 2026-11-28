import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { layout } from '../../theme/tokens';

type ContainerProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Sem margem lateral (para conteúdo que vai de borda a borda no mobile). */
  bleed?: boolean;
};

/** Centraliza o conteúdo com largura máxima e margens laterais responsivas. */
export function Container({ children, style, bleed = false }: ContainerProps) {
  const { pick } = useBreakpoint();
  return (
    <View
      style={[
        {
          width: '100%',
          maxWidth: layout.maxWidth,
          alignSelf: 'center',
          paddingHorizontal: bleed ? 0 : pick(20, 32, 48),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Margem lateral atual — útil para carrosséis que vão até a borda. */
export function useGutter() {
  const { pick } = useBreakpoint();
  return pick(20, 32, 48);
}
