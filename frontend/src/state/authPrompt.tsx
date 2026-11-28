import { usePathname, useRouter } from 'expo-router';
import { Heart, ShoppingBag, Sparkles, type LucideIcon } from 'lucide-react-native';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { View } from 'react-native';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Button } from '../components/ui/Button';
import { UText } from '../components/ui/UText';
import { makeStyles, useColors } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';
import { useAuth } from './auth';

export type AuthReason = 'buy' | 'like' | 'generic';

const COPY: Record<AuthReason, { icon: LucideIcon; title: string; text: string }> = {
  buy: {
    icon: ShoppingBag,
    title: 'Crie sua conta para comprar',
    text: 'Com a conta você finaliza pedidos, acompanha entregas e já ganha pontos no cartão fidelidade UrbanShop.',
  },
  like: {
    icon: Heart,
    title: 'Crie sua conta para curtir',
    text: 'Guarde suas peças favoritas e receba aviso quando elas entrarem em oferta.',
  },
  generic: {
    icon: Sparkles,
    title: 'Faça parte da UrbanShop',
    text: 'Cadastre-se para comprar, salvar favoritos e acumular pontos.',
  },
};

type AuthPromptValue = {
  /**
   * Executa `action` se o cliente estiver logado; senão, mostra o convite
   * para cadastro/login e não executa nada.
   */
  requireAuth: (reason: AuthReason, action: () => void) => void;
};

const AuthPromptContext = createContext<AuthPromptValue | null>(null);

export function AuthPromptProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [reason, setReason] = useState<AuthReason | null>(null);
  const [visible, setVisible] = useState(false);

  const requireAuth = useCallback(
    (r: AuthReason, action: () => void) => {
      if (user) {
        action();
        return;
      }
      setReason(r);
      setVisible(true);
    },
    [user],
  );

  const close = useCallback(() => setVisible(false), []);
  const go = (path: string) => {
    setVisible(false);
    router.push(path);
  };

  const value = useMemo(() => ({ requireAuth }), [requireAuth]);
  const copy = COPY[reason ?? 'generic'];

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <BottomSheet visible={visible} onClose={close} accessibilityLabel={copy.title} maxWidth={440}>
        <PromptContent
          icon={copy.icon}
          title={copy.title}
          text={copy.text}
          onSignUp={() => go('/cadastro')}
          onSignIn={() => go(`/entrar?redirect=${encodeURIComponent(pathname)}`)}
        />
      </BottomSheet>
    </AuthPromptContext.Provider>
  );
}

function PromptContent({
  icon: Icon,
  title,
  text,
  onSignUp,
  onSignIn,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  onSignUp: () => void;
  onSignIn: () => void;
}) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View style={styles.content}>
      <View style={styles.icon}>
        <Icon size={24} color={colors.gold} strokeWidth={1.6} />
      </View>
      <UText variant="h3" align="center">
        {title}
      </UText>
      <UText variant="body" align="center" style={styles.text}>
        {text}
      </UText>
      <Button label="Criar conta grátis" variant="gold" size="lg" fullWidth onPress={onSignUp} />
      <Button label="Já tenho conta" variant="outline" fullWidth onPress={onSignIn} />
    </View>
  );
}

export function useRequireAuth() {
  const ctx = useContext(AuthPromptContext);
  if (!ctx) throw new Error('useRequireAuth precisa estar dentro de <AuthPromptProvider>.');
  return ctx.requireAuth;
}

const useStyles = makeStyles((colors) => ({
  content: { padding: spacing.xl, gap: spacing.md, alignItems: 'stretch' },
  icon: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  text: { marginBottom: spacing.sm },
}));
