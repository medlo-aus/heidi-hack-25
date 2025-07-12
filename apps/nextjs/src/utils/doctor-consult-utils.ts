const DOCTOR_CONSULTATION_ID_KEY = "doctor-consultation-id";

export const storeDoctorConsultationId = (consultId: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DOCTOR_CONSULTATION_ID_KEY, consultId);
};

export const getDoctorConsultationId = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(DOCTOR_CONSULTATION_ID_KEY);
};

export const clearDoctorConsultationId = (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(DOCTOR_CONSULTATION_ID_KEY);
};
