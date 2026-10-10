'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { authEndpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';
import type { SessionUser } from '@/lib/api/types';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface SessionValue {
  user: SessionUser | null;
  status: Status;
  loggingOut: boolean;
  logout: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

/**
 * `GET /auth/me` is the single source of truth for who is signed in. The proxy
 * only checks that a cookie exists, so this is where a tampered or expired token
 * actually resolves to `unauthenticated` — and the client's 401 handler has
 * already tried a silent refresh before we get here.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isError } = useQuery({
    queryKey: queryKeys.session,
    queryFn: () => authEndpoints.me().then((session) => session.user),
    staleTime: 5 * 60_000,
    retry: false,
  });

  const logout = useMutation({
    mutationFn: () => authEndpoints.logout(),
    onSettled: () => {
      // The token version moved server-side, so nothing in this cache is still
      // attributable to a session.
      queryClient.clear();
      router.replace('/login');
    },
  });

  const value = useMemo<SessionValue>(
    () => ({
      user: data ?? null,
      status: data ? 'authenticated' : isError ? 'unauthenticated' : 'loading',
      loggingOut: logout.isPending,
      logout: () => logout.mutate(),
    }),
    [data, isError, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside <SessionProvider>');
  return context;
}

/** Shared by the login form so a successful sign-in seeds the session cache. */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string; target: string }) =>
      authEndpoints.login(email, password).then((session) => session.user),
    onSuccess: (user, { target }) => {
      queryClient.setQueryData(queryKeys.session, user);
      router.replace(target);
    },
  });
}
