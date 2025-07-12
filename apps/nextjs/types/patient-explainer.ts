import { z } from "zod";

export const MedicationSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  instructions: z.string(),
  sideEffects: z.array(z.string()),
  purpose: z.string(),
});

export const DiagnosisSchema = z.object({
  primary: z.string(),
  differential: z.array(z.string()),
  explanation: z.string(),
  severity: z.enum(["low", "moderate", "high"]),
  followUpRequired: z.boolean(),
});

export const EducationalResourceSchema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string(),
  category: z.enum(["condition", "lifestyle", "prevention", "treatment"]),
});

export const ReferralSchema = z.object({
  specialty: z.string(),
  reason: z.string(),
  urgency: z.enum(["routine", "urgent", "emergent"]),
  instructions: z.string(),
});

export const FollowUpSchema = z.object({
  timeframe: z.string(),
  reason: z.string(),
  instructions: z.string(),
  testsRequired: z.array(z.string()),
});

export const EmergencyInstructionsSchema = z.object({
  symptoms: z.array(z.string()),
  actions: z.array(z.string()),
  emergencyContacts: z.array(
    z.object({
      name: z.string(),
      phone: z.string(),
      type: z.enum(["emergency", "clinic", "after-hours"]),
    }),
  ),
});

export const PatientExplainerSchema = z.object({
  patientInfo: z.object({
    name: z.string(),
    age: z.number(),
    gender: z.string(),
    consultDate: z.string(),
    consultType: z.string(),
  }),
  chiefComplaint: z.string(),
  diagnosis: DiagnosisSchema,
  medications: z.array(MedicationSchema),
  educationalResources: z.array(EducationalResourceSchema),
  referrals: z.array(ReferralSchema),
  followUp: FollowUpSchema.optional(),
  emergencyInstructions: EmergencyInstructionsSchema,
  lifestyleRecommendations: z.array(z.string()),
  providerInfo: z.object({
    name: z.string(),
    title: z.string(),
    contact: z.string(),
  }),
});

export type PatientExplainer = z.infer<typeof PatientExplainerSchema>;

type Appointment = {
  appoinmentName: string;
  date: Date;
};
