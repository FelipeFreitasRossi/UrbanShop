import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFlyTarget, type FlyTargetName } from './FlyLayer';

/**
 * Envolve um ícone (sacola, favoritos) para que ele receba as peças que "voam"
 * e dê um pulo quando elas chegam. Maior prioridade = destino preferido.
 */
export function FlyTargetView({
  name,
  priority,
  children,
}: {
  name: FlyTargetName;
  priority: number;
  children: React.ReactNode;
}) {
  const { ref, bumpStyle } = useFlyTarget(name, priority);
  return (
    <Animated.View style={bumpStyle}>
      <View ref={ref} collapsable={false}>
        {children}
      </View>
    </Animated.View>
  );
}
