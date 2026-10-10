import type { Metadata } from 'next';
import { DashboardView } from '@/components/dashboard/dashboard-view';

/**
 * The portal shell reads the session and the live URL, so this route has no
 * meaningful prerendered markup: its content is fetched client-side behind
 * auth cookies. `instant = false` tells Next 16 to render it dynamically
 * instead of failing the build over runtime data it cannot resolve at build time.
 */
export const instant = false;

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return <DashboardView />;
}
