'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PageMeta } from '@/lib/api/types';

/** Page numbers with a window around the current page, collapsed at the edges. */
function pages(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const wanted = new Set([1, total, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((value) => wanted.add(value));
  if (page >= total - 2) [total - 3, total - 2, total - 1].forEach((value) => wanted.add(value));

  const sorted = [...wanted].filter((value) => value >= 1 && value <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) out.push('…');
    out.push(value);
  });
  return out;
}

export interface PaginationProps {
  meta: PageMeta;
  onPage: (page: number) => void;
  /** Hidden while the first page loads and whenever there is only one page. */
  className?: string;
}

export function Pagination({ meta, onPage, className = '' }: PaginationProps) {
  const { page, total, totalPages } = meta;
  if (totalPages <= 1) {
    return total > 0 ? (
      <p className={`px-4 py-3 text-[13px] text-ink-faint ${className}`}>
        {total} {total === 1 ? 'record' : 'records'}
      </p>
    ) : null;
  }

  const from = (page - 1) * meta.limit + 1;
  const to = Math.min(page * meta.limit, total);

  return (
    <nav
      aria-label="Pagination"
      className={[
        'flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3',
        className,
      ].join(' ')}
    >
      <p className="text-[13px] text-ink-faint">
        <span className="hidden sm:inline">
          {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()} ·{' '}
        </span>
        page {page} / {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          disabled={!meta.hasPrev}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </Button>
        {pages(page, totalPages).map((entry, index) =>
          entry === '…' ? (
            <span key={`gap-${index}`} className="px-1 text-[13px] text-ink-faint">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPage(entry)}
              aria-current={entry === page ? 'page' : undefined}
              className={[
                'h-8 min-w-8 rounded-md px-2 text-[13px] font-medium transition-colors',
                entry === page
                  ? 'bg-brand text-on-accent'
                  : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
              ].join(' ')}
            >
              {entry}
            </button>
          ),
        )}
        <Button
          size="sm"
          variant="ghost"
          disabled={!meta.hasNext}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </nav>
  );
}
