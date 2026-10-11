import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/states';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  tone?: 'brand' | 'success' | 'warning' | 'info';
}

const TONE: Record<NonNullable<StatCardProps['tone']>, string> = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
};

export function StatCard({ label, value, hint, icon, tone = 'brand' }: StatCardProps) {
  return (
    <div className="card flex items-start gap-3 p-4">
      <span className={['flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]', TONE[tone]].join(' ')}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">{label}</p>
        <p className="mt-0.5 text-[22px] font-semibold leading-tight tracking-tight text-ink tabular-nums">
          {value}
        </p>
        {/* Wraps rather than truncates: two-up on a phone, "Since Monday, UTC" loses
            the half that tells you which Monday it means. */}
        {hint ? <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{hint}</p> : null}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card flex items-start gap-3 p-4">
      <Skeleton className="h-9 w-9 rounded-[10px]" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}
