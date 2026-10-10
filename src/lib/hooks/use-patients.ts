'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/providers/toast-provider';
import { ApiError } from '@/lib/api/client';
import { patientEndpoints, type PatientInput } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';
import type { PatientRow } from '@/lib/api/types';
import { useInvalidateAll } from './use-invalidate';

export type PatientDraft = PatientInput & { doctorId: string };

export function usePatients(params: Parameters<typeof patientEndpoints.list>[0]) {
  return useQuery({
    queryKey: queryKeys.patients.list(params),
    queryFn: ({ signal }) => patientEndpoints.list(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: queryKeys.patients.detail(id),
    queryFn: () => patientEndpoints.byId(id),
    enabled: Boolean(id),
  });
}

export function useSavePatient(existing: PatientRow | null) {
  const toast = useToast();
  const invalidate = useInvalidateAll();
  const isEdit = Boolean(existing);

  return useMutation({
    mutationFn: async (draft: PatientDraft) =>
      isEdit
        ? patientEndpoints.update(existing!._id, draft)
        : patientEndpoints.create(draft),
    onSuccess: (patient) => {
      invalidate();
      toast.success(isEdit ? 'Patient updated' : 'Patient added', patient.name);
    },
    onError: (error: unknown) => {
      toast.error('Could not save the patient', error instanceof ApiError ? error.message : undefined);
    },
  });
}

export function useDeletePatient() {
  const toast = useToast();
  const invalidate = useInvalidateAll();

  return useMutation({
    mutationFn: (id: string) => patientEndpoints.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success('Patient deleted');
    },
    onError: (error: unknown) => {
      toast.error('Could not delete the patient', error instanceof ApiError ? error.message : undefined);
    },
  });
}
