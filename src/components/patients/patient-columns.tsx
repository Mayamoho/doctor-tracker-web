import { Badge, SEVERITY_TONE } from '@/components/ui/badge';
import type { Column } from '@/components/data/data-table';
import type { PatientRow } from '@/lib/api/types';
import { formatDate } from '@/lib/format';

const titleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * The patient columns both lists render. `withDoctor` is off on a doctor's own
 * page, where every row belongs to the same doctor and the column says nothing.
 */
export function patientColumns({ withDoctor }: { withDoctor: boolean }): Column<PatientRow>[] {
  const columns: Column<PatientRow>[] = [
    {
      key: 'name',
      header: 'Patient',
      width: 'w-[22%]',
      cell: (row) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-ink">{row.name}</span>
          <span className="truncate text-xs text-ink-faint">
            {row.age} · {titleCase(row.gender)} · {row.bloodGroup}
          </span>
        </div>
      ),
    },
    {
      key: 'condition',
      header: 'Condition',
      cell: (row) => (
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="truncate text-ink">{row.condition}</span>
          <Badge tone={SEVERITY_TONE[row.severity] ?? 'neutral'}>{titleCase(row.severity)}</Badge>
        </div>
      ),
    },
  ];

  if (withDoctor) {
    columns.push({
      key: 'doctor',
      header: 'Doctor',
      hideBelow: 'lg',
      cell: (row) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-ink">{row.doctorName ?? '—'}</span>
          <span className="truncate text-xs text-ink-faint">{row.doctorSpecialization ?? ''}</span>
        </div>
      ),
    });
  }

  columns.push({
    key: 'phone',
    header: 'Phone',
    hideBelow: 'lg',
    cell: (row) => <span className="font-mono text-xs">{row.phone}</span>,
  });

  columns.push({
    key: 'visitDate',
    header: 'Visit',
    align: 'end',
    cell: (row) => <span className="whitespace-nowrap text-ink-muted">{formatDate(row.visitDate)}</span>,
  });

  return columns;
}
