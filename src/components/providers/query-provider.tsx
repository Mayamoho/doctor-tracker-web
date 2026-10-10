'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ApiError } from '@/lib/api/client';

function createClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        gcTime: 5 * 60_000,
        // Client errors are the caller's problem to fix, not the network's;
        // retrying a 403 or a validation failure only delays the message.
        retry: (failureCount, error) =>
          error instanceof ApiError && error.status < 500 ? false : failureCount < 2,
      },
      mutations: { retry: false },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // One client per browser tab, created lazily and never on the server.
  const [client] = useState(createClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
