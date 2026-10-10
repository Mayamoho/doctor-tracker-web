'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { DoctorForm } from './doctor-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState, TableSkeleton } from '@/components/ui/states';
import { DataTable, type Column } from '@/components/data/data-table';
import { Pagination } from '@/components/data/pagination';
import { SearchInput } from '@/components/data/search-input';
import { ClearFilters, DateRange, FilterSelect, SortSelect, Toolbar } from '@/components/data/filter-controls';
import type { Doctor } from '@/lib/api/types';
import { useDeleteDoctor, useDoctors } from '@/lib/hooks/use-doctors';
import { useFilterOptions } from '@/lib/hooks/use-dashboard';
import { useListState } from '@/lib/hooks/use-list-state';
import { DOCTOR_EXTRAS, toDoctorParams } from '@/lib/list-state';
import { formatDate } from '@/lib/format';

const SORTS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: '-name', label: 'Name Z–A' },
  { value: 'specialization', label: 'Specialization' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'district', label: 'District' },
  { value: '-experienceYears', label: 'Most experienced' },
];

function Actions({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
      {children}
    </div>
  );
}

export function DoctorsView() {
  const router = useRouter();
  const { state, set, reset } = useListState(DOCTOR_EXTRAS);
  const { data, isPending, isError, error, refetch } = useDoctors(toDoctorParams(state));
  const { data: options } = useFilterOptions();
  const del = useDeleteDoctor();

  const [form, setForm] = useState<{ doctor: Doctor | null } | null>(null);
  const [confirm, setConfirm] = useState<Doctor | null>(null);

  const columns: Column<Doctor>[] = [
    {
      key: 'name',
      header: 'Doctor',
      width: 'w-[24%]',
      cell: (row) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-ink">{row.name}</span>
          <span className="truncate text-xs text-ink-faint">{row.degrees}</span>
        </div>
      ),
    },
    {
      key: 'specialization',
      header: 'Specialization',
      cell: (row) => <Badge tone="brand">{row.specialization}</Badge>,
    },
    {
      key: 'hospital',
      header: 'Hospital',
      hideBelow: 'lg',
      cell: (row) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-ink">{row.hospital}</span>
          <span className="truncate text-xs text-ink-faint">{row.district}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      hideBelow: 'lg',
      cell: (row) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-mono text-xs">{row.phone}</span>
          <span className="truncate text-xs text-ink-faint">{row.email}</span>
        </div>
      ),
    },
    {
      key: 'experienceYears',
      header: 'Exp.',
      align: 'end',
      hideBelow: 'sm',
      cell: (row) => `${row.experienceYears} yr`,
    },
    {
      key: 'patientCount',
      header: 'Patients',
      align: 'end',
      cell: (row) => <span className="font-medium tabular-nums">{row.patientCount}</span>,
    },
    {
      key: 'createdAt',
      header: 'Added',
      align: 'end',
      hideBelow: 'lg',
      cell: (row) => <span className="whitespace-nowrap text-ink-muted">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'end',
      cell: (row) => (
        <Actions>
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Edit ${row.name}`}
            onClick={() => setForm({ doctor: row })}
          >
            <Pencil size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Delete ${row.name}`}
            className="text-danger hover:bg-danger-soft hover:text-danger"
            onClick={() => setConfirm(row)}
          >
            <Trash2 size={14} />
          </Button>
        </Actions>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Doctors"
        subtitle="The full register. Click a row for that doctor's patients."
        actions={
          <Button variant="primary" icon={<Plus size={15} />} onClick={() => setForm({ doctor: null })}>
            Add doctor
          </Button>
        }
      />

      <section className="card flex min-w-0 flex-col">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5">
          <Toolbar>
            <SearchInput
              value={state.search}
              onCommit={(search) => set({ search })}
              placeholder="Name, email, BMDC, phone…"
              label="Search doctors"
            />
            <SortSelect value={state.sort} options={SORTS} onChange={(sort) => set({ sort })} />
          </Toolbar>

          <Toolbar>
            <FilterSelect
              label="Specialization"
              value={state.extra.specialization ?? ''}
              options={options?.specializations ?? []}
              loading={!options}
              onChange={(specialization) => set({ specialization })}
            />
            <FilterSelect
              label="Hospital"
              value={state.extra.hospital ?? ''}
              options={options?.hospitals ?? []}
              loading={!options}
              onChange={(hospital) => set({ hospital })}
            />
            <FilterSelect
              label="District"
              value={state.extra.district ?? ''}
              options={options?.districts ?? []}
              loading={!options}
              onChange={(district) => set({ district })}
            />
            <DateRange
              from={state.from}
              to={state.to}
              onChange={({ from, to }) => set({ from, to })}
            />
            <ClearFilters onClick={reset} show={Boolean(state.search || state.from || state.to || Object.keys(state.extra).length)} />
          </Toolbar>
        </div>

        {isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : isPending ? (
          <TableSkeleton columns={6} />
        ) : (
          <>
            <DataTable
              rows={data!.items}
              columns={columns}
              getId={(row) => row._id}
              onRowClick={(row) => router.push(`/doctors/${row._id}`)}
              empty={
                <div className="px-4 py-12 text-center text-sm text-ink-muted">
                  No doctor matches these filters.
                </div>
              }
            />
            <Pagination meta={data!.meta} onPage={(page) => set({ page: String(page) })} />
          </>
        )}
      </section>

      {form ? (
        <DoctorForm
          key={form.doctor?._id ?? 'new'}
          doctor={form.doctor}
          onClose={() => setForm(null)}
        />
      ) : null}

      <ConfirmDialog
        open={confirm !== null}
        title={`Delete ${confirm?.name ?? 'doctor'}?`}
        body={
          <>
            This removes the doctor and their{' '}
            <strong className="text-ink">{confirm?.patientCount ?? 0}</strong> patient record
            {(confirm?.patientCount ?? 0) === 1 ? '' : 's'}. It cannot be undone.
          </>
        }
        pending={del.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          del.mutate(confirm._id, { onSuccess: () => setConfirm(null) });
        }}
      />
    </>
  );
}
