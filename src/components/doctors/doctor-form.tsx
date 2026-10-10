'use client';

import { Save } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { ApiError } from '@/lib/api/client';
import type { Doctor } from '@/lib/api/types';
import { useSaveDoctor } from '@/lib/hooks/use-doctors';
import { useFilterOptions } from '@/lib/hooks/use-dashboard';
import { PHONE_RULES, doctorFormSchema, issueMap } from '@/lib/validation';

const BLANK = {
  name: '',
  specialization: '',
  hospital: '',
  district: '',
  phone: '',
  email: '',
  degrees: '',
  bmdcRegistration: '',
  experienceYears: '',
};

type Values = typeof BLANK;

function initialValues(doctor: Doctor | null): Values {
  if (!doctor) return BLANK;
  return {
    name: doctor.name,
    specialization: doctor.specialization,
    hospital: doctor.hospital,
    district: doctor.district,
    phone: doctor.phone,
    email: doctor.email,
    degrees: doctor.degrees,
    bmdcRegistration: doctor.bmdcRegistration,
    experienceYears: String(doctor.experienceYears),
  };
}

interface TextInputProps {
  label: string;
  name: keyof Values;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: ReactNode;
  list?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  wide?: boolean;
}

function TextInput({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  list,
  type = 'text',
  placeholder,
  autoComplete,
  wide,
}: TextInputProps) {
  return (
    <Field label={label} error={error} hint={hint} className={wide ? 'sm:col-span-2' : undefined}>
      {({ id, 'aria-invalid': invalid }) => (
        <Input
          id={id}
          name={name}
          type={type}
          list={list}
          value={value}
          invalid={invalid}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  );
}

function DataList({ id, values }: { id: string; values: string[] | undefined }) {
  return (
    <datalist id={id}>
      {(values ?? []).map((value) => (
        <option key={value} value={value} />
      ))}
    </datalist>
  );
}

export interface DoctorFormProps {
  doctor: Doctor | null;
  onClose: () => void;
}

/**
 * Mount this conditionally with a `key` derived from the record being edited —
 * the form seeds itself from props on first render, so remounting is what resets
 * it between "add" and "edit" instead of an effect syncing two sources.
 */
export function DoctorForm({ doctor, onClose }: DoctorFormProps) {
  const [values, setValues] = useState<Values>(() => initialValues(doctor));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useSaveDoctor(doctor);
  const { data: options } = useFilterOptions();

  const edit = (key: keyof Values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = doctorFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(issueMap(parsed.error));
      return;
    }

    setErrors({});
    save.mutate(parsed.data, {
      onSuccess: () => onClose(),
      // The API answers a rejected body with per-field issues; show them where the
      // user can act on them rather than only in the toast the hook raises.
      onError: (error: unknown) => {
        if (error instanceof ApiError && error.issues.length > 0) setErrors(error.fieldErrors);
      },
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={doctor ? 'Edit doctor' : 'Add doctor'}
      description={
        doctor ? `Updating ${doctor.name}. All fields are required.` : 'Every field is required.'
      }
      size="lg"
      footer={
        <>
          <Button onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="doctor-form"
            pending={save.isPending}
            icon={<Save size={14} />}
          >
            {doctor ? 'Save changes' : 'Create doctor'}
          </Button>
        </>
      }
    >
      <form id="doctor-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <DataList id="dl-specialization" values={options?.specializations} />
        <DataList id="dl-hospital" values={options?.hospitals} />
        <DataList id="dl-district" values={options?.districts} />

        <TextInput
          label="Full name"
          name="name"
          value={values.name}
          onChange={edit('name')}
          error={errors.name}
          placeholder="Dr. Reca Islam"
          wide
        />
        <TextInput
          label="Specialization"
          name="specialization"
          value={values.specialization}
          onChange={edit('specialization')}
          error={errors.specialization}
          list="dl-specialization"
          placeholder="Cardiology"
        />
        <TextInput
          label="Hospital"
          name="hospital"
          value={values.hospital}
          onChange={edit('hospital')}
          error={errors.hospital}
          list="dl-hospital"
          placeholder="Square Hospital"
        />
        <TextInput
          label="District"
          name="district"
          value={values.district}
          onChange={edit('district')}
          error={errors.district}
          list="dl-district"
          placeholder="Dhaka"
        />
        <TextInput
          label="Experience (years)"
          name="experienceYears"
          type="number"
          value={values.experienceYears}
          onChange={edit('experienceYears')}
          error={errors.experienceYears}
          placeholder="12"
        />
        <TextInput
          label="Phone"
          name="phone"
          value={values.phone}
          onChange={edit('phone')}
          error={errors.phone}
          hint={PHONE_RULES.message}
          placeholder="01712345678"
        />
        <TextInput
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={edit('email')}
          error={errors.email}
          placeholder="reca.islam@hospital.bd"
          autoComplete="off"
        />
        <TextInput
          label="Degrees"
          name="degrees"
          value={values.degrees}
          onChange={edit('degrees')}
          error={errors.degrees}
          placeholder="MBBS, FCPS (Cardiology)"
        />
        <TextInput
          label="BMDC registration"
          name="bmdcRegistration"
          value={values.bmdcRegistration}
          onChange={edit('bmdcRegistration')}
          error={errors.bmdcRegistration}
          hint="Format A-12345 or 12345"
          placeholder="A-42965"
        />

        {save.isError ? (
          <p role="alert" className="text-[13px] text-danger sm:col-span-2">
            {save.error instanceof ApiError ? save.error.message : 'Could not reach the API.'}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
