'use client';

import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/query-keys';

/**
 * Patient counts, dashboard totals and the filter dropdowns all move when a
 * record changes, so every write invalidates all three namespaces. With a 15s
 * `staleTime` that is one round trip each, and it beats hand-maintaining a list
 * of which key a given edit could have touched.
 */
export function useInvalidateAll() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  };
}
