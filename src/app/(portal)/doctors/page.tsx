import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DoctorsView } from '@/components/doctors/doctors-view';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { TableSkeleton } from '@/components/ui/states';

/**
 * The portal shell reads the session and the live URL, so this route has no
 * meaningful prerendered markup: its content is fetched client-side behind
 * auth cookies. `instant = false` tells Next 16 to render it dynamically
 * instead of failing the build over runtime data it cannot resolve at build time.
 */
export const instant = false;

export const metadata: Metadata = { title: 'Doctors' };

/**
 * `useListState` reads `useSearchParams`, which Next 16 requires behind a Suspense
 * boundary for the route to prerender. Without it the build fails with
 * "useSearchParams() should be wrapped in a suspense boundary".
 */
export default function DoctorsPage() {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Doctors" subtitle="The full register." />
          <Panel title="Register" subtitle="Search, filter and sort server-side">
            <TableSkeleton columns={6} />
          </Panel>
        </>
      }
    >
      <DoctorsView />
    </Suspense>
  );
}
