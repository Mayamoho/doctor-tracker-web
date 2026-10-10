'use client';

import { ArrowLeft, Pencil, Plus, Trash2, UserMinus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { DoctorForm } from './doctor-form';
import { PatientForm } from '@/components/patients/patient-form';
import { patientColumns } from '@/components/patients/patient-columns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Modal } from '@/components/ui/modal';
import { ErrorState, Skeleton, TableSkeleton } from '@/components/ui/states';
import { DataTable, type Column } from '@/components/data/data-table';
import { Pagination } from '@/components/data/pagination';
import { SearchInput } from '@/components/data/search-input';
import { ClearFilters, DateRange, FilterSelect, SortSelect, Toolbar } from '@/components/data/filter-controls';
import type { PatientRow } from '@/lib/api/types';
import { useDeleteDoctor, useDoctor, useDoctorPatients, useRemovePatientFromDoctor } from '@/lib/hooks/use-doctors';
import { useFilterOptions } from '@/lib/hooks/use-dashboard';
import { useListState } from '@/lib/hooks/use-list-state';
import { PATIENT_EXTRAS, toPatientParams } from '@/lib/list-state';
import { formatDate, initials } from '@/lib/format';

const SORTS = [
  { value: '-visitDate', label: 'Latest visit' },
  { value: 'visitDate', label: 'Earliest visit' },
  { value: '-createdAt', label: 'Recently added' },
  { value: 'name', label: 'Name A–Z' },
  { value: '-name', label: 'Name Z–A' },
  { value: 'condition', label: 'Condition' },
];

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-[10px] border border-line bg-surface-muted px-3 py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="truncate text-[13px] text-ink">{children}</dd>
    </div>
  );
}

function RowActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
      {children}
    </div>
  );
}

export function DoctorDetailView({ doctorId }: { doctorId: string }) {
  const router = useRouter();
  const { state, set, reset } = useListState(PATIENT_EXTRAS);

  const { data: doctor, isError: doctorFailed, error: doctorError, refetch } = useDoctor(doctorId);
  const {
    data: patients,
    isPending,
    isError,
    error: patientsError,
    refetch: refetchPatients,
  } = useDoctorPatients(doctorId, toPatientParams(state));
  const { data: options } = useFilterOptions();

  const removePatient = useRemovePatientFromDoctor(doctorId);
  const deleteDoctor = useDeleteDoctor();

  const [form, setForm] = useState<{ patient: PatientRow | null } | null>(null);
  const [editDoctor, setEditDoctor] = useState(false);
  const [confirmPatient, setConfirmPatient] = useState<PatientRow | null>(null);
  const [confirmDoctor, setConfirmDoctor] = useState(false);

  if (doctorFailed) {
    return (
      <div className="card">
        <ErrorState
          error={doctorError}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const columns: Column<PatientRow>[] = [
    ...patientColumns({ withDoctor: false }),
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
            aria-label={`Remove ${row.name} from this doctor`}
            className="text-danger hover:bg-danger-soft hover:text-danger"
            onClick={() => setConfirmPatient(row)}
          >
            <UserMinus size={14} />
          </Button>
        </RowActions>
      ),
    },
  ];

  return (
    <>
      <Link
        href="/doctors"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} /> All doctors
      </Link>

      {doctor ? (
        <>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-brand text-sm font-semibold text-white">
                {initials(doctor.name)}
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-semibold tracking-tight text-ink">
                  {doctor.name}
                </h1>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[13px] text-ink-muted">
                  <Badge tone="brand">{doctor.specialization}</Badge>
                  <span className="truncate">
                    {doctor.hospital}, {doctor.district}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button icon={<Pencil size={14} />} onClick={() => setEditDoctor(true)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                className="text-danger hover:bg-danger-soft hover:text-danger"
                icon={<Trash2 size={14} />}
                onClick={() => setConfirmDoctor(true)}
              >
                Delete
              </Button>
            </div>
          </div>

          <dl className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Patients">{doctor.patientCount}</Fact>
            <Fact label="Experience">{doctor.experienceYears} years</Fact>
            <Fact label="Degrees">{doctor.degrees}</Fact>
            <Fact label="BMDC registration">
              <span className="font-mono">{doctor.bmdcRegistration}</span>
            </Fact>
            <Fact label="Phone">
              <a href={`tel:${doctor.phone}`} className="font-mono hover:underline">
                {doctor.phone}
              </a>
            </Fact>
            <Fact label="Email">
              <a href={`mailto:${doctor.email}`} className="truncate hover:underline">
                {doctor.email}
              </a>
            </Fact>
            <Fact label="Added">{formatDate(doctor.createdAt)}</Fact>
          </dl>
        </>
      ) : (
        <div className="mb-5 flex flex-col gap-3">
          <Skeleton className="h-11 w-56" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-16" />
            ))}
          </div>
        </div>
      )}

      <section className="card flex min-w-0 flex-col">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3.5">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink">Patients</h2>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              Visits recorded for this doctor, newest first.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => setForm({ patient: null })}
          >
            Add patient
          </Button>
        </header>

        <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5">
          <Toolbar>
            <SearchInput
              value={state.search}
              onCommit={(search) => set({ search })}
              placeholder="Name, condition, phone…"
              label="Search this doctor's patients"
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
              label="Severity"
              value={state.extra.severity ?? ''}
              options={['mild', 'moderate', 'severe']}
              onChange={(severity) => set({ severity })}
            />
            <DateRange
              label="Visit"
              from={state.from}
              to={state.to}
              onChange={({ from, to }) => set({ from, to })}
            />
            <ClearFilters
              onClick={reset}
              show={Boolean(state.search || state.from || state.to || Object.keys(state.extra).length)}
            />
          </Toolbar>
        </div>

        {isError ? (
          <ErrorState error={patientsError} onRetry={() => void refetchPatients()} />
        ) : isPending ? (
          <TableSkeleton columns={5} />
        ) : (
          <>
            <DataTable
              rows={patients!.items}
              columns={columns}
              getId={(row) => row._id}
              onRowClick={(row) => router.push(`/patients?search=${encodeURIComponent(row.name)}`)}
              empty={
                <p className="px-4 py-12 text-center text-sm text-ink-muted">
                  No patients recorded for this doctor yet.
                </p>
              }
            />
            <Pagination meta={patients!.meta} onPage={(page) => set({ page: String(page) })} />
          </>
        )}
      </section>

      {form ? (
        <PatientForm
          key={form.patient?._id ?? 'new'}
          patient={form.patient}
          fixedDoctorId={doctorId}
          fixedDoctorName={doctor?.name}
          onClose={() => setForm(null)}
        />
      ) : null}

      {editDoctor && doctor ? (
        <DoctorForm doctor={doctor} onClose={() => setEditDoctor(false)} />
      ) : null}

      <Modal
        open={confirmPatient !== null}
        onClose={() => setConfirmPatient(null)}
        title={`Remove ${confirmPatient?.name ?? 'patient'}?`}
        size="sm"
        footer={
          <>
            <Button onClick={() => setConfirmPatient(null)} disabled={removePatient.isPending}>
              Cancel
            </Button>
            <Button
              variant="danger"
              pending={removePatient.isPending}
              onClick={() => {
                if (!confirmPatient) return;
                removePatient.mutate(confirmPatient._id, {
                  onSuccess: () => setConfirmPatient(null),
                });
              }}
            >
              Delete record
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">
          This deletes the patient record entirely —{' '}
          <strong className="text-ink">{confirmPatient?.name}</strong> will no longer appear in any
          doctor&apos;s register.
        </p>
      </Modal>

      <ConfirmDialog
        open={confirmDoctor}
        title={`Delete ${doctor?.name ?? 'doctor'}?`}
        pending={deleteDoctor.isPending}
        onClose={() => setConfirmDoctor(false)}
        onConfirm={() =>
          deleteDoctor.mutate(doctorId, { onSuccess: () => router.replace('/doctors') })
        }
        body={
          <>
            This removes the doctor and their{' '}
            <strong className="text-ink">{doctor?.patientCount ?? 0}</strong> patient record
            {(doctor?.patientCount ?? 0) === 1 ? '' : 's'}. It cannot be undone.
          </>
        }
      />
    </>
  );
}
