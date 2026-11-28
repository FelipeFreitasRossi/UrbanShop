import { Link } from 'expo-router';
import { ArrowRight, X } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useAuth } from '../../state/auth';
import { dismissGuestBanner, useGuestBannerDismissed } from '../../state/ui';
import { onDark } from '../../theme/palettes';
import { makeStyles } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/tokens';
import { UText } from '../ui/UText';

export const GUEST_BANNER_HEIGHT = 34;

/** true quando a faixa "Cadastre-se" deve aparecer (visitante que não a fechou). */
export function useGuestBannerVisible() {
  const { status, user } = useAuth();
  const dismissed = useGuestBannerDismissed();
  return status === 'guest' && !user && !dismissed;
}

/** Faixa fina no topo convidando o visitante a se cadastrar. */
export function GuestBanner() {
  const styles = useStyles();
  const { isMobile } = useBreakpoint();

  return (
    <View style={styles.bar}>
      <Link href="/cadastro" asChild>
        <Pressable accessibilityRole="link" style={styles.link} hitSlop={6}>
          <UText numberOfLines={1} style={styles.text}>
            {isMobile
              ? 'Cadastre-se para comprar e ganhar pontos'
              : 'Cadastre-se para comprar, salvar favoritos e acumular pontos no cartão fidelidade'}
          </UText>
          <UText style={styles.cta}>Criar conta</UText>
          <ArrowRight size={13} color={onDark.black} strokeWidth={2.4} />
        </Pressable>
      </Link>
      <Pressable
        onPress={dismissGuestBanner}
        accessibilityRole="button"
        accessibilityLabel="Fechar aviso de cadastro"
        hitSlop={10}
        style={styles.close}
      >
        <X size={14} color={onDark.black} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  bar: {
    height: GUEST_BANNER_HEIGHT,
    backgroundColor: onDark.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  link: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  text: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 15, color: onDark.black, flexShrink: 1 },
  cta: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 15,
    color: onDark.black,
    textDecorationLine: 'underline',
  },
  close: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
}));
