'use client';

import { memo, type ReactNode } from 'react';

export interface Column<Row> {
  key: string;
  header: ReactNode;
  /** Renders the cell for the desktop table and the value half of the mobile card. */
  cell: (row: Row) => ReactNode;
  /**
   * Applied to the body cell, not just the header: an auto-layout table sizes a
   * column to its widest content, so a long hospital name pushes the whole table
   * past the container and the columns behind it go off-screen. A `max-w-*` here
   * caps the column and lets the cell's own `truncate` do its job.
   */
  width?: string;
  /** Mobile cards show `primary` rows first; everything else follows in order. */
  align?: 'start' | 'end';
  hideBelow?: 'sm' | 'md' | 'lg';
}

interface DataTableProps<Row> {
  rows: Row[];
  columns: Column<Row>[];
  getId: (row: Row) => string;
  onRowClick?: (row: Row) => void;
  empty?: ReactNode;
}

const HIDE: Record<string, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

function Cell({ value, align }: { value: ReactNode; align?: 'start' | 'end' }) {
  return (
    <span
      className={[
        // `min-w-0` completes the truncation chain: without it this flex item's
        // automatic minimum is the min-content of the `nowrap` text below, so a long
        // degree list sets the card's width and the whole table overflows its wrapper.
        'flex min-w-0 flex-col',
        align === 'end' ? 'items-end text-right' : 'items-start',
      ].join(' ')}
    >
      {value}
    </span>
  );
}

function RowCard<Row>({ row, columns, onRowClick }: { row: Row; columns: Column<Row>[]; onRowClick?: (row: Row) => void }) {
  const [lead, ...rest] = columns;
  return (
    <div
      role={onRowClick ? 'button' : undefined}
      tabIndex={onRowClick ? 0 : undefined}
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      onKeyDown={
        onRowClick
          ? (event) => {
              if (event.key === 'Enter') onRowClick(row);
            }
          : undefined
      }
      className={[
        // The cells are written for the table, where a capped column makes `truncate`
        // the right call. Inside a card there is no cap to honour, and `nowrap` text
        // instead sets the row's min-content — which an auto-layout table treats as its
        // floor, so the card overflowed the viewport and scrolled sideways. Wrapping
        // here drops that floor to the longest single word. `min-w-0` cannot do it:
        // it permits shrinking, it does not reduce min-content.
        'flex min-w-0 flex-col gap-2 px-4 py-3.5 transition-colors [&_span]:whitespace-normal [&_span]:break-words',
        onRowClick ? 'cursor-pointer hover:bg-surface-muted' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <Cell value={lead.cell(row)} />
        {rest.length <= 2
          ? rest.map((column) => (
              <div key={column.key} className="text-right">
                <span className="block text-[11px] text-ink-faint">{column.header}</span>
                {column.cell(row)}
              </div>
            ))
          : null}
      </div>
      {rest.length > 2 ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-0.5 text-[13px]">
          {rest.map((column) => (
            // `min-w-0` is load-bearing: a grid item's default min-width is its
            // min-content, and every cell here is a `nowrap` + `truncate` span, so
            // without it a long hospital name widens the card past the viewport and
            // the phone gets a horizontal scrollbar instead of an ellipsis.
            <div key={column.key} className="flex min-w-0 flex-col">
              <dt className="text-[11px] text-ink-faint">{column.header}</dt>
              <dd className="min-w-0">{column.cell(row)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

function Row<Row>({
  row,
  columns,
  onRowClick,
}: {
  row: Row;
  columns: Column<Row>[];
  onRowClick?: (row: Row) => void;
}) {
  return (
    <>
      {/* md and up: a real table. */}
      <tr
        onClick={onRowClick ? () => onRowClick(row) : undefined}
        className={[
          'hidden border-t border-line md:table-row',
          onRowClick ? 'cursor-pointer hover:bg-surface-muted' : '',
        ].join(' ')}
      >
        {columns.map((column) => (
          <td
            key={column.key}
            className={[
              'px-4 py-3 align-middle text-[13px]',
              column.align === 'end' ? 'text-right' : 'text-left',
              column.hideBelow ? HIDE[column.hideBelow] : '',
              column.width ?? '',
            ].join(' ')}
          >
            {column.cell(row)}
          </td>
        ))}
      </tr>
      {/* below md: the same columns as a card. */}
      <tr className="border-t border-line md:hidden">
        <td colSpan={columns.length} className="p-0">
          <RowCard row={row} columns={columns} onRowClick={onRowClick} />
        </td>
      </tr>
    </>
  );
}

const MemoRow = memo(Row) as typeof Row;

export function DataTable<Row>({
  rows,
  columns,
  getId,
  onRowClick,
  empty,
}: DataTableProps<Row>) {
  if (rows.length === 0) return <>{empty}</>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Records</caption>
        <thead>
          {/*
            The header row is part of the desktop presentation. Left visible on a
            phone it sets the table's min-content width (four `nowrap` headers ≈ 450px),
            which the card row inherits through its `colSpan` — so the card would sit in
            a horizontally scrolling wrapper. Each card already labels its own fields.
          */}
          <tr className="hidden md:table-row">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={[
                  'whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint',
                  column.align === 'end' ? 'text-right' : 'text-left',
                  column.hideBelow ? HIDE[column.hideBelow] : '',
                ].join(' ')}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <MemoRow key={getId(row)} row={row} columns={columns} onRowClick={onRowClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
