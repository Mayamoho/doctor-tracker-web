import type { DoctorListParams, PatientListParams } from './types';

/**
 * Keys are derived from the full param object, so two different filter states of
 * the same list never collide in the cache and an exact key is all a mutation
 * needs to invalidate the page it just changed.
 */
export const queryKeys = {
  session: ['session'] as const,
  dashboard: {
    all: ['dashboard'] as const,
    stats: ['dashboard', 'stats'] as const,
    filterOptions: ['dashboard', 'filter-options'] as const,
  },
  doctors: {
    all: ['doctors'] as const,
    list: (params: DoctorListParams) => ['doctors', 'list', params] as const,
    detail: (id: string) => ['doctors', 'detail', id] as const,
  },
  patients: {
    all: ['patients'] as const,
    list: (params: PatientListParams) => ['patients', 'list', params] as const,
    detail: (id: string) => ['patients', 'detail', id] as const,
  },
};
