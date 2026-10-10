import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DoctorDetailView } from '@/components/doctors/doctor-detail-view';
import { Skeleton, TableSkeleton } from '@/components/ui/states';

/**
 * The portal shell reads the session and the live URL, so this route has no
 * meaningful prerendered markup: its content is fetched client-side behind
 * auth cookies. `instant = false` tells Next 16 to render it dynamically
 * instead of failing the build over runtime data it cannot resolve at build time.
 */
export const instant = false;

export const metadata: Metadata = { title: 'Doctor' };

export default async function DoctorPage({ params }: PageProps<'/doctors/[id]'>) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <>
          <Skeleton className="mb-5 h-5 w-32" />
          <Skeleton className="mb-5 h-20 w-full" />
          <div className="card">
            <TableSkeleton columns={5} />
          </div>
        </>
      }
    >
      <DoctorDetailView doctorId={id} />
    </Suspense>
  );
}
