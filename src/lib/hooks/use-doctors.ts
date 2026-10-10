'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { doctorEndpoints, type DoctorDraft, type PatientInput } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import type { Doctor, DoctorListParams, PatientListParams } from '@/lib/api/types';
import { useToast } from '@/components/providers/toast-provider';
import { useInvalidateAll } from './use-invalidate';

export function useDoctors(params: DoctorListParams) {
  return useQuery({
    queryKey: queryKeys.doctors.list(params),
    queryFn: ({ signal }) => doctorEndpoints.list(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: queryKeys.doctors.detail(id),
    queryFn: () => doctorEndpoints.byId(id),
  });
}

export function useDoctorPatients(id: string, params: PatientListParams) {
  return useQuery({
    queryKey: queryKeys.patients.list({ ...params, doctorId: id }),
    queryFn: ({ signal }) => doctorEndpoints.patients(id, params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useSaveDoctor(existing: Doctor | null) {
  const toast = useToast();
  const invalidate = useInvalidateAll();
  const isEdit = Boolean(existing);

  return useMutation({
    mutationFn: async (draft: DoctorDraft) =>
      isEdit
        ? doctorEndpoints.update(existing!._id, draft)
        : doctorEndpoints.create(draft),
    onSuccess: (doctor) => {
      invalidate();
      toast.success(isEdit ? 'Doctor updated' : 'Doctor added', doctor.name);
    },
    onError: (error: unknown) => {
      toast.error('Could not save the doctor', error instanceof ApiError ? error.message : undefined);
    },
  });
}

export function useDeleteDoctor() {
  const toast = useToast();
  const invalidate = useInvalidateAll();

  return useMutation({
    mutationFn: (id: string) => doctorEndpoints.remove(id),
    onSuccess: (result) => {
      invalidate();
      toast.success('Doctor deleted', `${result.deletedPatients} patient records removed with them`);
    },
    onError: (error: unknown) => {
      toast.error('Could not delete the doctor', error instanceof ApiError ? error.message : undefined);
    },
  });
}

export function useAddPatientToDoctor(doctorId: string) {
  const toast = useToast();
  const invalidate = useInvalidateAll();

  return useMutation({
    mutationFn: async (payload: PatientInput & { doctorId: string }) =>
      doctorEndpoints.addPatient(doctorId, payload),
    onSuccess: (patient) => {
      invalidate();
      toast.success('Patient added', patient.name);
    },
    onError: (error: unknown) => {
      toast.error('Could not add the patient', error instanceof ApiError ? error.message : undefined);
    },
  });
}

export function useRemovePatientFromDoctor(doctorId: string) {
  const toast = useToast();
  const invalidate = useInvalidateAll();

  return useMutation({
    mutationFn: (patientId: string) => doctorEndpoints.removePatient(doctorId, patientId),
    onSuccess: () => {
      invalidate();
      toast.success('Patient removed from this doctor');
    },
    onError: (error: unknown) => {
      toast.error('Could not remove the patient', error instanceof ApiError ? error.message : undefined);
    },
  });
}
