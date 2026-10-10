import type { DoctorListParams, PatientListParams } from './api/types';

/**
 * The URL is the single source of truth for list state, so a filtered page is
 * linkable, survives reload and back/forward, and the table never holds a second
 * copy of it in component state.
 *
 * Defaults are written as absent rather than `?page=1`, which keeps shared links
 * short and means one comparison decides whether a param needs clearing.
 */
export interface ListState {
  page: number;
  search: string;
  sort: string;
  from: string;
  to: string;
  extra: Record<string, string>;
}

export type ListField =
  | 'page'
  | 'search'
  | 'sort'
  | 'from'
  | 'to'
  | 'specialization'
  | 'hospital'
  | 'district'
  | 'condition'
  | 'gender'
  | 'severity';

const DEFAULTS: Record<ListField, string> = {
  page: '1',
  search: '',
  sort: '-createdAt',
  from: '',
  to: '',
  specialization: '',
  hospital: '',
  district: '',
  condition: '',
  gender: '',
  severity: '',
};

/** Fields whose change resets paging — page 3 of an old filter set is never page 3 of the new one. */
const RESETS_PAGE: ListField[] = ['search', 'sort', 'from', 'to', 'specialization', 'hospital', 'district', 'condition', 'gender', 'severity'];

export function parseList(source: URLSearchParams, extras: ListField[]): ListState {
  return {
    page: Math.max(1, Number.parseInt(source.get('page') ?? '1', 10) || 1),
    search: source.get('search') ?? '',
    sort: source.get('sort') ?? DEFAULTS.sort,
    from: source.get('from') ?? '',
    to: source.get('to') ?? '',
    extra: Object.fromEntries(
      extras
        .map((field) => [field, source.get(field) ?? ''] as const)
        .filter(([, value]) => value !== '' && value !== 'all'),
    ),
  };
}

export function serializeList(
  state: ListState,
  changed: Partial<Record<ListField, string>>,
  extras: ListField[],
): string {
  const merged: Record<string, string> = {
    page: String(state.page),
    search: state.search,
    sort: state.sort,
    from: state.from,
    to: state.to,
    ...state.extra,
    ...changed,
  };

  if (Object.keys(changed).some((key) => RESETS_PAGE.includes(key as ListField))) merged.page = '1';

  const params = new URLSearchParams();
  for (const field of ['page', 'search', 'sort', 'from', 'to', ...extras] as ListField[]) {
    const value = merged[field] ?? '';
    if (value && value !== DEFAULTS[field]) params.set(field, value);
  }
  return params.toString();
}

export function toDoctorParams(state: ListState): DoctorListParams {
  return {
    page: state.page,
    search: state.search || undefined,
    sort: state.sort,
    from: state.from || undefined,
    to: state.to || undefined,
    ...state.extra,
  };
}

export function toPatientParams(state: ListState): PatientListParams {
  return {
    page: state.page,
    search: state.search || undefined,
    sort: state.sort,
    from: state.from || undefined,
    to: state.to || undefined,
    ...state.extra,
  };
}

export const DOCTOR_EXTRAS = ['specialization', 'hospital', 'district'] as const;
export const PATIENT_EXTRAS = ['condition', 'gender', 'severity'] as const;
