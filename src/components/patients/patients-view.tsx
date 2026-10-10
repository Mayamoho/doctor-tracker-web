'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { PatientForm } from './patient-form';
import { patientColumns } from './patient-columns';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState, TableSkeleton } from '@/components/ui/states';
import { DataTable, type Column } from '@/components/data/data-table';
import { Pagination } from '@/components/data/pagination';
import { SearchInput } from '@/components/data/search-input';
import { ClearFilters, DateRange, FilterSelect, SortSelect, Toolbar } from '@/components/data/filter-controls';
import type { PatientRow } from '@/lib/api/types';
import { useDeletePatient, usePatients } from '@/lib/hooks/use-patients';
import { useFilterOptions } from '@/lib/hooks/use-dashboard';
import { useListState } from '@/lib/hooks/use-list-state';
import { PATIENT_EXTRAS, toPatientParams } from '@/lib/list-state';
import { GENDERS, SEVERITIES } from '@/lib/validation';

const SORTS = [
  { value: '-visitDate', label: 'Latest visit' },
  { value: 'visitDate', label: 'Earliest visit' },
  { value: '-createdAt', label: 'Recently added' },
  { value: 'createdAt', label: 'Oldest entry' },
  { value: 'name', label: 'Name A–Z' },
  { value: '-name', label: 'Name Z–A' },
  { value: 'condition', label: 'Condition' },
];

function RowActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
      {children}
    </div>
  );
}

export function PatientsView() {
  const { state, set, reset } = useListState(PATIENT_EXTRAS);
  const { data, isPending, isError, error, refetch } = usePatients(toPatientParams(state));
  const { data: options } = useFilterOptions();
  const del = useDeletePatient();

  const [form, setForm] = useState<{ patient: PatientRow | null } | null>(null);
  const [confirm, setConfirm] = useState<PatientRow | null>(null);

  const columns: Column<PatientRow>[] = [
    ...patientColumns({ withDoctor: true }),
    {
      key: 'actions',
      header: '',
      align: 'end',
      cell: (row) => (
        <RowActions>
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Edit ${row.name}`}
            onClick={() => setForm({ patient: row })}
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
        </RowActions>
      ),
    },
  ];

  const filtered = Boolean(
    state.search || state.from || state.to || Object.keys(state.extra).length,
  );

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle="Every recorded visit across the register."
        actions={
          <Button variant="primary" icon={<Plus size={15} />} onClick={() => setForm({ patient: null })}>
            Add patient
          </Button>
        }
      />

      <section className="card flex min-w-0 flex-col">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5">
          <Toolbar>
            <SearchInput
              value={state.search}
              onCommit={(search) => set({ search })}
              placeholder="Name, condition, phone…"
              label="Search patients"
            />
            <SortSelect value={state.sort} options={SORTS} onChange={(sort) => set({ sort })} />
          </Toolbar>

          <Toolbar>
            <FilterSelect
              label="Condition"
              value={state.extra.condition ?? ''}
              options={options?.conditions ?? []}
              loading={!options}
              onChange={(condition) => set({ condition })}
            />
            <FilterSelect
              label="Gender"
              value={state.extra.gender ?? ''}
              options={GENDERS}
              onChange={(gender) => set({ gender })}
            />
            <FilterSelect
              label="Severity"
              value={state.extra.severity ?? ''}
              options={SEVERITIES}
              onChange={(severity) => set({ severity })}
            />
            <DateRange
              label="Visit"
              from={state.from}
              to={state.to}
              onChange={({ from, to }) => set({ from, to })}
            />
            <ClearFilters onClick={reset} show={filtered} />
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
              onRowClick={(row) => setForm({ patient: row })}
              empty={
                <p className="px-4 py-12 text-center text-sm text-ink-muted">
                  {filtered
                    ? 'No patient matches these filters.'
                    : 'No patients recorded yet. Add the first one.'}
                </p>
              }
            />
            <Pagination meta={data!.meta} onPage={(page) => set({ page: String(page) })} />
          </>
        )}
      </section>

      {form ? (
        <PatientForm
          key={form.patient?._id ?? 'new'}
          patient={form.patient}
          onClose={() => setForm(null)}
        />
      ) : null}

      <ConfirmDialog
        open={confirm !== null}
        title={`Delete ${confirm?.name ?? 'patient'}?`}
        pending={del.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          del.mutate(confirm._id, { onSuccess: () => setConfirm(null) });
        }}
        body={
          <>
            The visit record for <strong className="text-ink">{confirm?.name}</strong> (
            {confirm?.condition}) is removed from the register. It cannot be undone.
          </>
        }
      />
    </>
  );
}
