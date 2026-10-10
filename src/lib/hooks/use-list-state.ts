'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { parseList, serializeList, type ListField, type ListState } from '@/lib/list-state';

/**
 * Reads list state from the URL and writes it back with `replace`, so changing a
 * filter does not push a history entry per keystroke, while the back button still
 * unwinds page navigation. Nothing is mirrored into component state — the URL is
 * the only copy, which is what keeps the table from re-rendering twice per change.
 *
 * `extras` must be a module-level constant so its identity is stable across
 * renders; every caller passes `DOCTOR_EXTRAS` or `PATIENT_EXTRAS`.
 *
 * `pathname` is only read inside handlers, never rendered, so the rewrite proxy
 * cannot produce a hydration mismatch from it.
 */
export function useListState(extras: readonly ListField[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  const state = useMemo<ListState>(
    () => parseList(new URLSearchParams(query), [...extras]),
    [query, extras],
  );

  const write = useCallback(
    (next: string) => router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false }),
    [pathname, router],
  );

  const set = useCallback(
    (changed: Partial<Record<ListField, string>>) => write(serializeList(state, changed, [...extras])),
    [write, state, extras],
  );

  /** Defaults are all encoded as "absent", so clearing the query string resets everything. */
  const reset = useCallback(() => write(''), [write]);

  return { state, set, reset };
}
