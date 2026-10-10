'use client';

import { useState } from 'react';
import { Field, Select } from '@/components/ui/field';
import { SearchInput } from '@/components/data/search-input';
import { useDoctors } from '@/lib/hooks/use-doctors';

export interface DoctorPickerProps {
  value: string;
  /** Kept so the label survives a filter change that pages the chosen doctor out of the list. */
  knownName?: string | null;
  onChange: (id: string, name: string) => void;
  error?: string;
}

/**
 * The picker searches server-side instead of shipping the whole register into a
 * `<select>`: the list endpoint caps at 100 rows, so a fixed option list would
 * silently run out of doctors. Typing narrows the query rather than a local array.
 */
export function DoctorPicker({ value, knownName, onChange, error }: DoctorPickerProps) {
  const [search, setSearch] = useState('');
  const { data } = useDoctors({ search, limit: 50, sort: 'name' });
  const rows = data?.items ?? [];

  const chosen = rows.find((row) => row._id === value);
  const pinSelected = Boolean(value) && !chosen;

  return (
    <Field
      label="Attending doctor"
      error={error}
      hint={
        data
          ? `${data.meta.total.toLocaleString()} doctor${data.meta.total === 1 ? '' : 's'} match${data.meta.total === 1 ? 'es' : ''} — type to search`
          : 'Type to search the register'
      }
      className="sm:col-span-2"
    >
      {({ id, 'aria-invalid': invalid }) => (
        <div className="flex flex-col gap-2">
          <SearchInput
            value={search}
            onCommit={setSearch}
            placeholder="Search doctors…"
            label="Search doctors to assign"
          />
          <Select
            id={id}
            name="doctorId"
            value={value}
            invalid={invalid}
            onChange={(event) => {
              const picked = rows.find((row) => row._id === event.target.value);
              onChange(event.target.value, picked?.name ?? knownName ?? '');
            }}
          >
            <option value="">Select a doctor…</option>
            {pinSelected ? <option value={value}>{knownName ?? 'Currently assigned'}</option> : null}
            {rows.map((row) => (
              <option key={row._id} value={row._id}>
                {row.name} — {row.specialization}
              </option>
            ))}
          </Select>
        </div>
      )}
    </Field>
  );
}
