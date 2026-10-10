import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PatientsView } from '@/components/patients/patients-view';
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

export const metadata: Metadata = { title: 'Patients' };

export default function PatientsPage() {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Patients" subtitle="Every recorded visit across the register." />
          <Panel title="Visits" subtitle="Search, filter and sort server-side">
            <TableSkeleton columns={6} />
          </Panel>
        </>
      }
    >
      <PatientsView />
    </Suspense>
  );
}
