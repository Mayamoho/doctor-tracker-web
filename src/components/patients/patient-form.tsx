'use client';

import { Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { DoctorPicker } from './doctor-picker';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { ApiError } from '@/lib/api/client';
import type { PatientRow } from '@/lib/api/types';
import { useSavePatient, type PatientDraft } from '@/lib/hooks/use-patients';
import { toDateInput } from '@/lib/format';
import {
  BLOOD_GROUPS,
  GENDERS,
  PHONE_RULES,
  SEVERITIES,
  issueMap,
  patientFormSchema,
} from '@/lib/validation';

const BLANK = {
  name: '',
  age: '',
  gender: '',
  bloodGroup: '',
  condition: '',
  severity: '',
  phone: '',
  visitDate: '',
  notes: '',
  doctorId: '',
};

type Values = typeof BLANK;

/** `male` → `Male` — the API speaks lowercase, the UI should not. */
const label = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

function initialValues(patient: PatientRow | null, doctorId: string | undefined): Values {
  if (!patient) return { ...BLANK, doctorId: doctorId ?? '' };
  return {
    name: patient.name,
    age: String(patient.age),
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    condition: patient.condition,
    severity: patient.severity,
    phone: patient.phone,
    visitDate: toDateInput(patient.visitDate),
    notes: patient.notes ?? '',
    doctorId: doctorId ?? patient.doctorId,
  };
}

export interface PatientFormProps {
  patient: PatientRow | null;
  /** Set from a doctor's own page: the assignment is already decided by the URL. */
  fixedDoctorId?: string;
  fixedDoctorName?: string;
  onClose: () => void;
}

/** Mount with a `key` derived from the record, as `DoctorForm` does. */
export function PatientForm({ patient, fixedDoctorId, fixedDoctorName, onClose }: PatientFormProps) {
  const [values, setValues] = useState<Values>(() =>
    initialValues(patient, fixedDoctorId ?? (patient ? String(patient.doctorId) : undefined)),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useSavePatient(patient);

  const edit = (key: keyof Values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = patientFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(issueMap(parsed.error));
      return;
    }

    const { visitDate, notes, ...rest } = parsed.data;
    const payload: PatientDraft = {
      ...rest,
      doctorId: fixedDoctorId ?? rest.doctorId,
      // Optional fields must be absent, not empty strings: the server coerces
      // `visitDate` with `z.coerce.date()`, and `""` becomes an Invalid Date.
      ...(visitDate ? { visitDate } : {}),
      ...(notes ? { notes } : {}),
    };

    setErrors({});
    save.mutate(payload, {
      onSuccess: () => onClose(),
      onError: (error: unknown) => {
        if (error instanceof ApiError && error.issues.length > 0) setErrors(error.fieldErrors);
      },
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={patient ? 'Edit patient' : 'Add patient'}
      description={
        fixedDoctorName
          ? `Assigned to ${fixedDoctorName}.`
          : 'Choose the attending doctor and the clinical details.'
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
            form="patient-form"
            pending={save.isPending}
            icon={<Save size={14} />}
          >
            {patient ? 'Save changes' : 'Create patient'}
          </Button>
        </>
      }
    >
      <form id="patient-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Full name" error={errors.name} className="sm:col-span-2">
          {({ id, 'aria-invalid': invalid }) => (
            <Input
              id={id}
              name="name"
              value={values.name}
              invalid={invalid}
              placeholder="Anya Rahman"
              onChange={(event) => edit('name')(event.target.value)}
            />
          )}
        </Field>

        <Field label="Age" error={errors.age}>
          {({ id, 'aria-invalid': invalid }) => (
            <Input
              id={id}
              name="age"
              type="number"
              min={0}
              max={130}
              value={values.age}
              invalid={invalid}
              placeholder="34"
              onChange={(event) => edit('age')(event.target.value)}
            />
          )}
        </Field>

        <Field label="Gender" error={errors.gender}>
          {({ id, 'aria-invalid': invalid }) => (
            <Select
              id={id}
              name="gender"
              value={values.gender}
              invalid={invalid}
              onChange={(event) => edit('gender')(event.target.value)}
            >
              <option value="">Select…</option>
              {GENDERS.map((option) => (
                <option key={option} value={option}>
                  {label(option)}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Blood group" error={errors.bloodGroup}>
          {({ id, 'aria-invalid': invalid }) => (
            <Select
              id={id}
              name="bloodGroup"
              value={values.bloodGroup}
              invalid={invalid}
              onChange={(event) => edit('bloodGroup')(event.target.value)}
            >
              <option value="">Select…</option>
              {BLOOD_GROUPS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Severity" error={errors.severity}>
          {({ id, 'aria-invalid': invalid }) => (
            <Select
              id={id}
              name="severity"
              value={values.severity}
              invalid={invalid}
              onChange={(event) => edit('severity')(event.target.value)}
            >
              <option value="">Select…</option>
              {SEVERITIES.map((option) => (
                <option key={option} value={option}>
                  {label(option)}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Condition" error={errors.condition} className="sm:col-span-2">
          {({ id, 'aria-invalid': invalid }) => (
            <Input
              id={id}
              name="condition"
              value={values.condition}
              invalid={invalid}
              placeholder="Dengue Fever"
              onChange={(event) => edit('condition')(event.target.value)}
            />
          )}
        </Field>

        <Field
          label="Phone"
          error={errors.phone}
          hint={PHONE_RULES.message}
        >
          {({ id, 'aria-invalid': invalid }) => (
            <Input
              id={id}
              name="phone"
              value={values.phone}
              invalid={invalid}
              placeholder="01712345678"
              onChange={(event) => edit('phone')(event.target.value)}
            />
          )}
        </Field>

        <Field label="Visit date" error={errors.visitDate} hint="Leave empty to record today.">
          {({ id, 'aria-invalid': invalid }) => (
            <Input
              id={id}
              name="visitDate"
              type="date"
              value={values.visitDate}
              invalid={invalid}
              onChange={(event) => edit('visitDate')(event.target.value)}
            />
          )}
        </Field>

        {fixedDoctorId ? null : (
          <DoctorPicker
            value={values.doctorId}
            knownName={patient?.doctorName}
            error={errors.doctorId}
            onChange={(doctorId) => edit('doctorId')(doctorId)}
          />
        )}

        <Field
          label="Notes"
          error={errors.notes}
          hint={`${values.notes.length}/500`}
          className="sm:col-span-2"
        >
          {({ id, 'aria-invalid': invalid }) => (
            <Textarea
              id={id}
              name="notes"
              rows={3}
              value={values.notes}
              invalid={invalid}
              placeholder="Follow-up in two weeks."
              onChange={(event) => edit('notes')(event.target.value)}
            />
          )}
        </Field>

        {save.isError ? (
          <p role="alert" className="text-[13px] text-danger sm:col-span-2">
            {save.error instanceof ApiError ? save.error.message : 'Could not reach the API.'}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
