import { z } from 'zod';
import { EMERGENCY_TYPES, RESOURCE_CATEGORIES, SEVERITIES, CONTACT_METHODS } from '../constants/rahat';

export const requestFormSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().regex(/^(\+91|0)?[6-9]\d{9}$/, 'Enter a valid Indian phone number'),
  peopleAffected: z.coerce.number().int().positive(),
  emergencyType: z.enum(EMERGENCY_TYPES as [string, ...string[]]),
  requiredResources: z.array(z.enum(RESOURCE_CATEGORIES as [string, ...string[]])).min(1, 'Select at least one resource'),
  severity: z.enum(SEVERITIES as [string, ...string[]]),
  description: z.string().min(20),
  address: z.string().min(5),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  accessibilityRequirements: z.string().optional(),
  preferredContact: z.enum(CONTACT_METHODS as [string, ...string[]]).optional(),
});

export type RequestFormValues = z.infer<typeof requestFormSchema>;
