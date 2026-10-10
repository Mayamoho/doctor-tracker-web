import { api, one, toQuery, type ListResult } from './client';
import type {
  DashboardStats,
  Doctor,
  DoctorListParams,
  FilterOptions,
  PatientDetail,
  PatientListParams,
  PatientRow,
  SessionUser,
} from './types';

export const authEndpoints = {
  login: (email: string, password: string) =>
    one(api.post<{ user: SessionUser }>('/auth/login', { email, password })),
  me: () => one(api.get<{ user: SessionUser }>('/auth/me')),
  logout: () => one(api.post<{ loggedOut: boolean }>('/auth/logout')),
};

export const doctorEndpoints = {
  list: (params: DoctorListParams, signal?: AbortSignal): Promise<ListResult<Doctor>> =>
    api.getList<Doctor>(`/doctors${toQuery({ ...params })}`, signal),
  byId: (id: string) => one(api.get<Doctor>(`/doctors/${id}`)),
  create: (payload: DoctorDraft) => one(api.post<Doctor>('/doctors', payload)),
  update: (id: string, patch: Partial<DoctorDraft>) =>
    one(api.patch<Doctor>(`/doctors/${id}`, patch)),
  remove: (id: string) =>
    one(api.delete<{ deleted: boolean; deletedPatients: number }>(`/doctors/${id}`)),
  patients: (id: string, params: PatientListParams, signal?: AbortSignal) =>
    patientEndpoints.list({ ...params, doctorId: id }, signal),
  addPatient: (id: string, payload: PatientInput) =>
    one(api.post<PatientRow>(`/doctors/${id}/patients`, payload)),
  removePatient: (doctorId: string, patientId: string) =>
    one(api.delete<{ deleted: boolean }>(`/doctors/${doctorId}/patients/${patientId}`)),
};

export const patientEndpoints = {
  list: (params: PatientListParams, signal?: AbortSignal): Promise<ListResult<PatientRow>> =>
    api.getList<PatientRow>(`/patients${toQuery({ ...params })}`, signal),
  byId: (id: string) => one(api.get<PatientDetail>(`/patients/${id}`)),
  create: (payload: PatientInput & { doctorId: string }) =>
    one(api.post<PatientRow>('/patients', payload)),
  update: (id: string, patch: Partial<PatientInput & { doctorId: string }>) =>
    one(api.patch<PatientRow>(`/patients/${id}`, patch)),
  remove: (id: string) => one(api.delete<{ deleted: boolean }>(`/patients/${id}`)),
};

/** `Doctor` minus the fields the server owns — the body either create or update accepts. */
export type DoctorDraft = Omit<Doctor, '_id' | 'createdAt' | 'patientCount'>;

/**
 * Mirrors the API's `patientBody`: `visitDate` and `notes` are optional on the
 * wire even though a stored row always has a visit date (the schema defaults it).
 * A form must omit an empty date rather than send `""`, which fails coercion.
 */
export type PatientInput = Omit<
  PatientRow,
  '_id' | 'createdAt' | 'doctorId' | 'doctorName' | 'doctorSpecialization' | 'visitDate' | 'notes'
> & {
  visitDate?: string;
  notes?: string;
};

export const dashboardEndpoints = {
  stats: () => one(api.get<DashboardStats>('/dashboard/stats')),
  filterOptions: () => one(api.get<FilterOptions>('/dashboard/filter-options')),
};
