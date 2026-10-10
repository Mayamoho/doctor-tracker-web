import type { ReactNode } from 'react';

export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

const TONE: Record<Tone, string> = {
  neutral: 'bg-surface-muted text-ink-muted border-line',
  brand: 'bg-brand-soft text-brand border-transparent',
  success: 'bg-success-soft text-success border-transparent',
  warning: 'bg-warning-soft text-warning border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
  info: 'bg-info-soft text-info border-transparent',
};

export const SEVERITY_TONE: Record<string, Tone> = {
  mild: 'success',
  moderate: 'warning',
  severe: 'danger',
};

export function Badge({
  tone = 'neutral',
  className = '',
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap',
        TONE[tone],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
