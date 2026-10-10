import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { LoginShell } from '@/components/auth/login-shell';

export const metadata = { title: 'Sign in' };

/**
 * The form reads `?next` through `useSearchParams`, which under
 * `cacheComponents` has to sit behind a boundary — the shell is prerendered
 * without a query string, so an unwrapped read fails the production build.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  );
}
