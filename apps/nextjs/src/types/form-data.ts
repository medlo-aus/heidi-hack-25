export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other",
}

export enum CertificateReason {
  Flu = "Flu",
  Covid19 = "Covid-19",
  Migraine = "Migraine",
  Injury = "Injury",
  Cold = "Cold",
  Asthma = "Asthma",
  BackPain = "Back Pain",
  MentalHealth = "Mental Health",
  Other = "Other",
}

export enum LeaveFrom {
  Work = "Work",
  Studies = "Studies",
  Other = "Other",
}

export interface FormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender: Gender;
  streetAddress: string;
  suburb: string;
  postcode: number;
  state: string;
  phoneNumber: string;

  // Certificate Purpose
  certificateReason: CertificateReason;
  leaveFrom: LeaveFrom;
  certificateStartDate: Date;
  certificateEndDate: Date;

  // Symptom Info
  symptomsInfo: string;
  pastHistory: string;
}
