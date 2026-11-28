import { Link, type Href } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { useInteraction } from '../../motion/useInteraction';
import { fonts, radius } from '../../theme/tokens';
import { UText } from './UText';
import { makeStyles, useColors } from '../../theme/ThemeProvider';

type IconButtonProps = {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  href?: Href;
  badge?: number;
  size?: number;
  color?: string;
  active?: boolean;
  filled?: boolean;
};

/** Botão de ícone com área de toque de 44px, hover dourado e contador opcional. */
export function IconButton({
  icon: Icon,
  label,
  onPress,
  href,
  badge,
  size = 20,
  color,
  active = false,
  filled = false,
}: IconButtonProps) {
  const colors = useColors();
  const styles = useStyles();
  const { hover, pressStyle, handlers } = useInteraction(0.9);

  const bg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(hover.value, [0, 1], ['rgba(128,128,128,0)', 'rgba(128,128,128,0.14)']),
  }));

  const iconColor = active ? colors.gold : (color ?? colors.text);

  const content = (
    <Pressable
      onPress={onPress}
      accessibilityRole={href ? 'link' : 'button'}
      accessibilityLabel={label}
      hitSlop={4}
      {...handlers}
    >
      <Animated.View style={[styles.button, bg, pressStyle]}>
        <Icon size={size} color={iconColor} strokeWidth={1.6} fill={filled ? iconColor : 'transparent'} />
        {badge && badge > 0 ? (
          <View style={styles.badge}>
            <UText style={styles.badgeText}>{badge > 99 ? '99+' : String(badge)}</UText>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        {content}
      </Link>
    );
  }
  return content;
}

const useStyles = makeStyles((colors) => ({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 4,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    lineHeight: 12,
    color: colors.black,
  },
}));
