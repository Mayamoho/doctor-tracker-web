'use client';

import { Eraser } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/field';

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export interface FilterSelectProps {
  label: string;
  value: string;
  options: readonly string[];
  /** `all` is never sent upstream — see `toQuery`. */
  onChange: (value: string) => void;
  loading?: boolean;
  className?: string;
}

export function FilterSelect({ label, value, options, onChange, loading, className = '' }: FilterSelectProps) {
  return (
    <label className={['relative min-w-[9rem] flex-1 sm:flex-none', className].join(' ')}>
      <span className="sr-only">{label}</span>
      <Select
        value={value}
        disabled={loading}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-0 text-[13px]"
        aria-label={label}
      >
        <option value="all">All {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option.length > 28 ? `${option.slice(0, 27)}…` : option}
          </option>
        ))}
      </Select>
    </label>
  );
}

export interface SortSelectProps {
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function SortSelect({ value, options, onChange }: SortSelectProps) {
  return (
    <label className="relative">
      <span className="sr-only">Sort by</span>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Sort by"
        className="h-9 text-[13px]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </label>
  );
}

export interface DateRangeProps {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
  label?: string;
}

export function DateRange({ from, to, onChange, label = 'Created' }: DateRangeProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">{label}</span>
      <input
        type="date"
        aria-label={`${label} from`}
        value={from}
        max={to || undefined}
        onChange={(event) => onChange({ from: event.target.value, to })}
        className="field h-9 w-[9.5rem] px-2 text-[13px]"
      />
      <span className="text-ink-faint">–</span>
      <input
        type="date"
        aria-label={`${label} to`}
        value={to}
        min={from || undefined}
        onChange={(event) => onChange({ from, to: event.target.value })}
        className="field h-9 w-[9.5rem] px-2 text-[13px]"
      />
    </div>
  );
}

export function ClearFilters({ onClick, show }: { onClick: () => void; show: boolean }) {
  if (!show) return null;
  return (
    <Button size="sm" variant="ghost" icon={<Eraser size={13} />} onClick={onClick}>
      Clear
    </Button>
  );
}
