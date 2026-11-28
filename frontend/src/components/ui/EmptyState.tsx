import type { LucideIcon } from 'lucide-react-native';
import type { Href } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Reveal } from '../../motion/Reveal';
import { colors, radius, spacing } from '../../theme/tokens';
import { Button } from './Button';
import { UText } from './UText';

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  message?: string;
  action?: { label: string; onPress?: () => void; href?: Href };
  compact?: boolean;
};

/** Estado vazio / erro com mensagem clara e, quando fizer sentido, uma ação. */
export function EmptyState({ icon: Icon, title, message, action, compact = false }: EmptyStateProps) {
  return (
    <Reveal variant="fade">
      <View style={[styles.box, compact && styles.compact]}>
        {Icon ? (
          <View style={styles.icon}>
            <Icon size={22} color={colors.gold} strokeWidth={1.6} />
          </View>
        ) : null}
        <UText variant="h3" align="center">
          {title}
        </UText>
        {message ? (
          <UText variant="body" align="center" style={styles.message}>
            {message}
          </UText>
        ) : null}
        {action ? (
          <Button
            label={action.label}
            onPress={action.onPress}
            href={action.href}
            variant="outline"
            arrow
            style={styles.action}
          />
        ) : null}
      </View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
    gap: spacing.sm,
  },
  compact: { paddingVertical: spacing.xxl },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.goldLine,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  message: { maxWidth: 460 },
  action: { marginTop: spacing.md },
});
