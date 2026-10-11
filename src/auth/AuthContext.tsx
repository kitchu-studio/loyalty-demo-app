import { useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as api from '../api';
import { setSessionExpiredHandler, tokenStore } from '../api/client';
import type { User } from '../api';

type Status = 'loading' | 'out' | 'in';

interface AuthValue {
  status: Status;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(async () => {
    await tokenStore.clear();
    queryClient.clear();
    setUser(null);
    setStatus('out');
  }, [queryClient]);

  // Restore the saved session on app start.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hasTokens = await tokenStore.load();
      if (!hasTokens) {
        if (!cancelled) setStatus('out');
        return;
      }
      try {
        const me = await api.getMe();
        if (cancelled) return;
        setUser(me);
        setStatus('in');
      } catch {
        // Expired or unreachable: ask the person to sign in again.
        await tokenStore.clear();
        if (!cancelled) setStatus('out');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // When a refresh fails in the middle of using the app, go back to the login screen.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      void logout();
    });
    return () => setSessionExpiredHandler(null);
  }, [logout]);

  const finish = useCallback(async (res: api.TokenResponse) => {
    await tokenStore.save(res.access_token, res.refresh_token);
    const me = res.user ?? (await api.getMe());
    setUser(me);
    setStatus('in');
  }, []);

  const login = useCallback(
    async (email: string, password: string) => finish(await api.auth.login(email.trim(), password)),
    [finish],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) =>
      finish(await api.auth.register(name.trim(), email.trim(), password)),
    [finish],
  );

  const value = useMemo(
    () => ({ status, user, login, register, logout }),
    [status, user, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
