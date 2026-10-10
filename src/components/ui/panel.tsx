import type { ReactNode } from 'react';

export interface PanelProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Set when the body supplies its own padding (tables do). */
  padded?: boolean;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, subtitle, actions, padded = true, children, className = '' }: PanelProps) {
  return (
    <section className={['card flex min-w-0 flex-col', className].join(' ')}>
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pb-4 pt-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-[13px] text-ink-muted">{subtitle}</p> : null}
        </div>
        {actions}
      </header>
      <div className={padded ? 'min-w-0 flex-1 px-5 pb-5' : 'min-w-0 flex-1'}>{children}</div>
    </section>
  );
}
