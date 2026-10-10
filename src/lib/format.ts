const DAY = 86_400_000;

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
});

/**
 * Dates render in UTC because the API stores and filters calendar days in UTC
 * (`utils/dates.ts`). Formatting in the viewer's zone would show a visit saved as
 * `2026-10-01T02:00Z` as `2026-09-30`, which then fails to match a filter on
 * 1 October.
 */
export function formatDate(value: string | Date | undefined | null): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

export function formatDateTime(value: string | Date | undefined | null): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`;
}

export function relativeDays(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const days = Math.floor((Date.now() - date.getTime()) / DAY);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

export function initials(name: string): string {
  const parts = name.replace(/\bDr\.?\b/gi, '').trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.at(-1)?.[0] ?? '')).toUpperCase();
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/** `YYYY-MM-DD` for `<input type="date">` and for the API's date filters. */
export function toDateInput(value: string | Date | undefined | null): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

export function todayInput(): string {
  return toDateInput(new Date());
}
