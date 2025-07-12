export enum ConsultationStatus {
  WAITING = "WAITING",
  ACTIVE = "ACTIVE",
  COMPLETE = "COMPLETE",
}

// Used for frontend status mapping in consultation router
export type FrontendConsultationStatus =
  | "waiting"
  | "in_progress"
  | "completed"
  | "cancelled";

/*
  Note: Backend (Prisma) enum uses 'COMPLETE', but frontend uses 'completed'.
  'CANCELLED' is only a frontend state, not stored in the backend.
  The mapping in consultation.ts intentionally translates between these.
*/
