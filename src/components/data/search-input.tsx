'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface SearchInputProps {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  /** Debounce window; long enough to collapse a typed name into one request. */
  delayMs?: number;
  label?: string;
}

export function SearchInput({
  value,
  onCommit,
  placeholder = 'Search…',
  delayMs = 350,
  label = 'Search',
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  // React's documented way to reset derived state from a prop: compare during
  // render and adjust before committing, rather than effecting a setState after.
  const [committed, setCommitted] = useState(value);

  if (committed !== value) {
    setCommitted(value);
    setDraft(value);
  }

  // Callers pass a fresh arrow on every render; holding the latest one in a ref
  // means an unrelated re-render of the parent cannot restart the debounce.
  const latest = useRef(onCommit);
  useEffect(() => {
    latest.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => latest.current(draft), delayMs);
    return () => clearTimeout(timer);
  }, [draft, value, delayMs]);

  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xs">
      <Search
        size={14}
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
      />
      <input
        type="search"
        aria-label={label}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onCommit(draft);
          }
        }}
        className="field h-9 appearance-none pl-8 pr-8 [&::-webkit-search-cancel-button]:hidden"
      />
      {draft ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setDraft('');
            onCommit('');
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-faint hover:text-ink"
        >
          <X size={13} />
        </button>
      ) : null}
    </div>
  );
}
