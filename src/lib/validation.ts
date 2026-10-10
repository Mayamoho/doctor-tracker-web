import { z } from 'zod';

/**
 * Deliberate copies of the API's zod schemas in doctor-tracker-api/src/validation.
 * Duplicating them is cheaper than importing across two deployed apps, and the
 * server still re-validates — these only exist so a form can reject a bad phone
 * number before the round trip.
 */
export const PHONE_RULES = {
  pattern: /^(?:\+?880|0)1[3-9]\d{8}$/,
  message: 'Enter a Bangladeshi mobile, e.g. 01712345678 or +8801712345678',
};

const phone = z.string().trim().regex(PHONE_RULES.pattern, PHONE_RULES.message);
const bmdc = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^A-\d{4,6}$|^\d{4,6}$/, 'BMDC number must look like A-12345 or 12345');

export const GENDERS = ['male', 'female', 'other'] as const;
export const SEVERITIES = ['mild', 'moderate', 'severe'] as const;
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const doctorFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  specialization: z.string().trim().min(2, 'Specialization is required').max(80),
  hospital: z.string().trim().min(2, 'Hospital is required').max(120),
  district: z.string().trim().min(2, 'District is required').max(60),
  phone,
  email: z.email('Enter a valid email').max(160),
  degrees: z.string().trim().min(3, 'Degrees are required').max(160),
  bmdcRegistration: bmdc,
  experienceYears: z.coerce
    .number()
    .int('Experience must be a whole number')
    .min(0, 'Cannot be negative')
    .max(60, 'Cannot exceed 60 years'),
});

export const patientFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  age: z.coerce.number().int('Age must be a whole number').min(0).max(130),
  gender: z.enum(GENDERS),
  bloodGroup: z.enum(BLOOD_GROUPS),
  condition: z.string().trim().min(2, 'Condition is required').max(120),
  severity: z.enum(SEVERITIES),
  phone,
  // The API accepts `YYYY-MM-DD`; `<input type="date">` produces exactly that.
  // Empty is allowed here and stripped before the request, since an optional
  // field must be absent rather than `""` for the server's date coercion.
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a visit date').optional().or(z.literal('')),
  notes: z.string().trim().max(500, 'Keep notes under 500 characters').optional(),
  doctorId: z.string().min(1, 'Choose the attending doctor'),
});

export const loginFormSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;
export type PatientFormValues = z.infer<typeof patientFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;

/** Flattens a ZodError into `{ field: message }` for inline form errors. */
export function issueMap(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
