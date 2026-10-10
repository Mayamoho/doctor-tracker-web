import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { SessionProvider } from '@/lib/hooks/use-session';

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
