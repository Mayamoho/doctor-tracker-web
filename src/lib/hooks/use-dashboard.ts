'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardEndpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => dashboardEndpoints.stats(),
  });
}

/** Dropdown values move only when a record introduces a new one, so they are read far more often than they change. */
export function useFilterOptions() {
  return useQuery({
    queryKey: queryKeys.dashboard.filterOptions,
    queryFn: () => dashboardEndpoints.filterOptions(),
    staleTime: 5 * 60_000,
  });
}
