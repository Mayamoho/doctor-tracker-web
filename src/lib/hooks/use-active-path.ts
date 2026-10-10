'use client';

import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';

const never = () => () => {};

/**
 * `null` on the server and on hydration, then the real path once mounted.
 *
 * `useSyncExternalStore` is what makes this safe: the third argument is the
 * snapshot rendered on the server and during hydration, so the client markup
 * matches the prerender instead of disagreeing with it. Reading `usePathname()`
 * directly would do that — under `cacheComponents` the shell is prerendered
 * without a request path to compare against.
 */
export function useActivePath(): string | null {
  const pathname = usePathname();
  return useSyncExternalStore(
    never,
    () => pathname,
    () => null,
  );
}
