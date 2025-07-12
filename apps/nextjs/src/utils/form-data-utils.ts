import type { FormData } from "@/types/form-data";
import { CertificateReason, Gender, LeaveFrom } from "@/types/form-data";

const FORM_DATA_KEY = "patient-medical-form";

/**
 * Parses and returns FormData from localStorage, converting date strings to Date objects
 * and mapping enums to their correct types. Returns null if not found or invalid.
 */
export function getLocalFormData(): FormData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(FORM_DATA_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Convert date strings to Date objects
    if (parsed.dateOfBirth) parsed.dateOfBirth = new Date(parsed.dateOfBirth);
    if (parsed.certificateStartDate)
      parsed.certificateStartDate = new Date(parsed.certificateStartDate);
    if (parsed.certificateEndDate)
      parsed.certificateEndDate = new Date(parsed.certificateEndDate);
    // Map enums from strings if needed
    if (parsed.certificateReason)
      parsed.certificateReason =
        CertificateReason[
          parsed.certificateReason as keyof typeof CertificateReason
        ] ?? parsed.certificateReason;
    if (parsed.leaveFrom)
      parsed.leaveFrom =
        LeaveFrom[parsed.leaveFrom as keyof typeof LeaveFrom] ??
        parsed.leaveFrom;
    if (parsed.gender)
      parsed.gender =
        Gender[parsed.gender as keyof typeof Gender] ?? parsed.gender;
    return parsed as FormData;
  } catch (error) {
    console.error("Error parsing form data from localStorage:", error);
    localStorage.removeItem(FORM_DATA_KEY); // Clear corrupted data
    return null;
  }
}

/**
 * Maps FormData to the consultation DB schema fields (excluding userId, isGuest, isPriority, days, etc.)
 * Use this when posting to the DB.
 */
export function mapFormDataToConsultationPayload(formData: FormData) {
  // All fields must match the consultation model in schema.prisma
  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    dateOfBirth: formData.dateOfBirth,
    gender: formData.gender,
    streetAddress: formData.streetAddress,
    suburb: formData.suburb,
    postcode: formData.postcode,
    state: formData.state,
    phoneNumber: formData.phoneNumber,
    certificateReason: formData.certificateReason,
    leaveFrom: formData.leaveFrom,
    certificateStartDate: formData.certificateStartDate,
    certificateEndDate: formData.certificateEndDate,
    symptomsInfo: formData.symptomsInfo,
    pastHistory: formData.pastHistory,
  };
}
