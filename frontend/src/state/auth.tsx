import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../services/api';
import * as authApi from '../services/auth';
import type { User } from '../services/auth';
import { storage } from '../utils/storage';

type AuthStatus = 'loading' | 'guest' | 'authenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  /** Recarrega os dados do cliente (ex.: depois de editar o perfil). */
  refresh: () => Promise<void>;
};

const TOKEN_KEY = 'urbanshop.session';
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Sessão do cliente.
 * - O token (JWT) fica no armazenamento seguro do celular (Keychain/Keystore).
 * - A pontuação, pedidos e dados sensíveis nunca são definidos pelo app:
 *   tudo vem do backend, que é a autoridade.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    setStatus('guest');
    await storage.remove(TOKEN_KEY);
  }, []);

  // Restaura a sessão salva ao abrir o app.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await storage.get(TOKEN_KEY);
      if (!token) {
        if (!cancelled) setStatus('guest');
        return;
      }
      setAuthToken(token);
      try {
        const current = await authApi.me();
        if (!cancelled) {
          setUser(current);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) await clearSession();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // Se o servidor disser que a sessão expirou, desloga.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    setAuthToken(result.accessToken);
    await storage.set(TOKEN_KEY, result.accessToken);
    setUser(result.user);
    setStatus('authenticated');
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logoutRequest();
    } catch {
      // Mesmo sem resposta do servidor, a sessão local é encerrada.
    }
    await clearSession();
  }, [clearSession]);

  const refresh = useCallback(async () => {
    const current = await authApi.me();
    setUser(current);
  }, []);

  const value = useMemo(
    () => ({ status, user, login, logout, refresh }),
    [status, user, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
