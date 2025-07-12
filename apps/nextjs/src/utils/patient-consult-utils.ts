import type { FormData } from "@/types/form-data";

// Stores the Stripe Payment Intent ID created for the current consultation.
// Used to verify or resume payment flow before a consultation begins.
const PAYMENT_INTENT_ID_KEY = "payment-intent-id";

// Stores the patient's medical form data (e.g. symptoms, history) as JSON.
// Used to persist form input between steps and page refreshes.
const PATIENT_MEDICAL_FORM_KEY = "patient-medical-form";

// Stores the current consultation ID for the user (guest or registered).
// Used to track and poll consultation status (WAITING, ACTIVE, etc.).
const CONSULT_ID_KEY = "consult-id";

export const getPaymentIntentId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PAYMENT_INTENT_ID_KEY);
};

export const storePaymentIntentId = (paymentIntentId: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(PAYMENT_INTENT_ID_KEY, paymentIntentId);
};

export const clearPaymentIntentId = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PAYMENT_INTENT_ID_KEY);
};

export const getConsultId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSULT_ID_KEY);
};

export const storeConsultId = (consultId: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSULT_ID_KEY, consultId);
  
  /* 
   * Dispatch custom event to notify ConsultationContext of the change.
   * StorageEvent only fires for changes from other tabs, so we need this
   * custom event for same-tab changes.
   */
  window.dispatchEvent(new CustomEvent("consultIdChanged", {
    detail: { key: "consult-id", newValue: consultId }
  }));
};

export const clearConsultId = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONSULT_ID_KEY);
  
  /* 
   * Dispatch custom event to notify ConsultationContext of the change.
   */
  window.dispatchEvent(new CustomEvent("consultIdChanged", {
    detail: { key: "consult-id", newValue: null }
  }));
};

export const getPatientMedicalForm = (): FormData | null => {
  if (typeof window === "undefined") return null;
  const formData = localStorage.getItem(PATIENT_MEDICAL_FORM_KEY);
  return formData ? JSON.parse(formData) : null;
};

export const storePatientMedicalForm = (formData: FormData): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(PATIENT_MEDICAL_FORM_KEY, JSON.stringify(formData));
};

export const clearPatientMedicalForm = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PATIENT_MEDICAL_FORM_KEY);
};

export const clearAllConsultData = (): void => {
  clearConsultId();
  clearPatientMedicalForm();
  clearPaymentIntentId();
  
  /* Also clear any legacy consultation-related keys */
  if (typeof window !== "undefined") {
    localStorage.removeItem("consultation-id");
  }
};