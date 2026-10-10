import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './button';
import { ApiError } from '@/lib/api/client';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={['animate-pulse rounded-md bg-line', className].join(' ')} />;
}

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-line" aria-hidden="true">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: columns }, (_, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={columnIndex === 0 ? 'h-4 w-[26%]' : 'h-4 flex-1'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className="card p-5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className={['mt-4 w-full', height].join(' ')} />
    </div>
  );
}

export function StateBlock({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-ink-faint">
        {icon}
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {body ? <p className="max-w-sm text-[13px] text-ink-muted">{body}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  body,
  action,
}: {
  title?: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return <StateBlock icon={<Inbox size={18} />} title={title} body={body} action={action} />;
}

/**
 * Server error messages are already safe to show: the API strips stack traces and
 * driver detail below 500s, and returns a fixed string above it.
 */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const known = error instanceof ApiError;
  const filtered = known && error.code === 'UNAUTHORIZED';

  return (
    <StateBlock
      icon={<AlertCircle size={18} />}
      title={filtered ? 'Your session has ended' : 'Could not load this'}
      body={
        filtered
          ? 'Sign in again to continue.'
          : known
            ? error.message
            : 'The API is unreachable. Check that doctor-tracker-api is running.'
      }
      action={
        onRetry && !filtered ? (
          <Button icon={<RefreshCw size={14} />} onClick={onRetry} pending={false}>
            Try again
          </Button>
        ) : null
      }
    />
  );
}
