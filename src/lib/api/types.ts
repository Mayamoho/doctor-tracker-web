/** Mirrors the response envelopes emitted by doctor-tracker-api. */

export interface ApiEnvelope<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}

export interface ApiFailure {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export type Role = 'admin' | 'doctor';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  district: string;
  phone: string;
  email: string;
  degrees: string;
  bmdcRegistration: string;
  experienceYears: number;
  createdAt: string;
  patientCount: number;
}

export type Gender = 'male' | 'female' | 'other';
export type Severity = 'mild' | 'moderate' | 'severe';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

/** `listPatients` returns the patient plus the two doctor fields its `$lookup` joins. */
export interface PatientRow {
  _id: string;
  name: string;
  age: number;
  gender: Gender;
  bloodGroup: BloodGroup;
  condition: string;
  severity: Severity;
  phone: string;
  doctorId: string;
  visitDate: string;
  notes?: string;
  createdAt: string;
  doctorName: string | null;
  doctorSpecialization: string | null;
}

/** `getPatient` populates `doctorId` instead of joining flat columns. */
export interface PatientDetail extends Omit<PatientRow, 'doctorId' | 'doctorName' | 'doctorSpecialization'> {
  doctorId: string | { _id: string; name: string; specialization: string };
}

export interface DashboardStats {
  totals: {
    doctors: number;
    patients: number;
    avgPatientsPerDoctor: number;
    patientsThisWeek: number;
    patientsThisMonth: number;
    doctorsThisMonth: number;
  };
  timeline: { month: string; label: string; patients: number }[];
  patientsPerDoctor: { doctorId: string; name: string; specialization: string; patients: number }[];
  byCondition: { condition: string; count: number }[];
  bySpecialization: { specialization: string; count: number }[];
}

export interface FilterOptions {
  specializations: string[];
  hospitals: string[];
  districts: string[];
  conditions: string[];
}

export type SortToken = string;

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: SortToken;
  from?: string;
  to?: string;
}

export interface DoctorListParams extends ListParams {
  specialization?: string;
  hospital?: string;
  district?: string;
}

export interface PatientListParams extends ListParams {
  condition?: string;
  gender?: Gender;
  severity?: Severity;
  doctorId?: string;
}
