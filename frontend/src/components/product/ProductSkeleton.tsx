import React, { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { radius, spacing } from '../../theme/tokens';
import { makeStyles } from '../../theme/ThemeProvider';

/** Card "esqueleto" pulsante exibido enquanto os produtos carregam. */
export function ProductSkeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  const reduce = useReducedMotion();
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    if (!reduce) pulse.set(withRepeat(withTiming(1, { duration: 900 }), -1, true));
  }, [pulse, reduce]);

  const anim = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View style={[style, anim]} accessibilityLabel="Carregando produto">
      <View style={styles.media} />
      <View style={[styles.line, { width: '40%', marginTop: spacing.sm }]} />
      <View style={[styles.line, { width: '80%' }]} />
      <View style={[styles.line, { width: '30%' }]} />
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  media: { aspectRatio: 4 / 5, borderRadius: radius.md, backgroundColor: colors.surfaceRaised },
  line: { height: 10, borderRadius: 5, backgroundColor: colors.surfaceRaised, marginTop: 8 },
}));
