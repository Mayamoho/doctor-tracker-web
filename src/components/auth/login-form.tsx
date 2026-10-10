'use client';

import { Lock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { LoginShell } from './login-shell';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { ApiError } from '@/lib/api/client';
import { useLogin } from '@/lib/hooks/use-session';
import { issueMap, loginFormSchema } from '@/lib/validation';

/** Only same-origin absolute paths, so `?next=` cannot be used to bounce a user off-site. */
function safeTarget(value: string | null): string {
  return value && /^\/(?!\/)/.test(value) ? value : '/dashboard';
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const target = safeTarget(searchParams.get('next'));

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const login = useLogin();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = loginFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(issueMap(parsed.error));
      return;
    }
    setErrors({});
    login.mutate({ ...parsed.data, target });
  }

  return (
    <LoginShell>
      <div className="mb-7">
        <h2 className="text-xl font-semibold tracking-tight text-ink">Sign in</h2>
        <p className="mt-1 text-[13px] text-ink-muted">
          Use the administrator account issued with your portal access.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {login.isError ? (
          <p
            role="alert"
            className="rounded-[9px] border border-danger/30 bg-danger-soft px-3 py-2 text-[13px] text-danger"
          >
            {login.error instanceof ApiError
              ? login.error.message
              : 'Could not reach the API. Is doctor-tracker-api running?'}
          </p>
        ) : null}

        <Field label="Email" error={errors.email}>
          {({ id, 'aria-invalid': invalid }) => (
            <Input
              id={id}
              name="email"
              type="email"
              autoComplete="username"
              placeholder="admin@doctortracker.dev"
              value={values.email}
              invalid={invalid}
              onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            />
          )}
        </Field>

        <Field label="Password" error={errors.password}>
          {({ id, 'aria-invalid': invalid }) => (
            <Input
              id={id}
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={values.password}
              invalid={invalid}
              onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
            />
          )}
        </Field>

        <Button type="submit" variant="primary" pending={login.isPending} icon={<Lock size={14} />}>
          Sign in
        </Button>
      </form>

      {process.env.NODE_ENV !== 'production' ? (
        <p className="mt-6 rounded-[9px] border border-line bg-surface-muted px-3 py-2 text-xs text-ink-muted">
          Seeded development account: <code className="font-mono">admin@doctortracker.dev</code> /{' '}
          <code className="font-mono">Admin@1234</code>
        </p>
      ) : null}
    </LoginShell>
  );
}
