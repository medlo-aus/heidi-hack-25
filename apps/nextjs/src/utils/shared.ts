import { z } from "zod";

// Position mappings
export const parentPositions = ["Consultant", "Registrar", "Resident"] as const;
export type ParentPosition = (typeof parentPositions)[number];

export const parentPositionsToShortHand: Record<
  (typeof parentPositions)[number],
  string
> = {
  Registrar: "REG",
  Consultant: "CONS",
  Resident: "RES",
} as const;

// Role mappings
export const roleParentCategories = [
  "Surgery",
  "Anaesthetics",
  "Emergency Medicine",
  "General Medicine",
  "Geriatrics",
  "Intensive Care",
  "Psychiatry",
  "Oncology",
  "Obstetrics & Gynaecology",
  "Orthopaedics",
  "Paediatrics",
  "Plastics",
  "Rehab",
  "Radiology",
  "Pathology",
  "Urgent Care",
  "Other",
] as const;
export type RoleParentCategory = (typeof roleParentCategories)[number];

export const RoleParentCategoryEnum = z.enum(roleParentCategories);

export const roleParentCategoriesToShortHand: Record<
  (typeof roleParentCategories)[number],
  string
> = {
  Surgery: "SURG",
  Anaesthetics: "ANAES",
  "Emergency Medicine": "ED",
  "General Medicine": "GEN MED",
  Geriatrics: "GERI",
  Other: "OTHER",
  "Intensive Care": "ICU",
  Psychiatry: "PSYCH",
  Oncology: "ONC",
  "Obstetrics & Gynaecology": "O&G",
  Orthopaedics: "ORTHO",
  Paediatrics: "PAEDS",
  Plastics: "PLAS",
  Rehab: "REHAB",
  Radiology: "RAD",
  Pathology: "PATH",
  "Urgent Care": "URG.C",
} as const;

export const OpenAiModels = [
  "o1-preview",
  "o1-mini",
  "gpt-4o",
  "gpt-4o-2024-05-13",
  "gpt-4o-2024-08-06",
  "gpt-4o-mini",
  "gpt-4o-mini-2024-07-18",
  "gpt-4-turbo",
  "gpt-4-turbo-2024-04-09",
  "gpt-4-turbo-preview",
  "gpt-4-0125-preview",
  "gpt-4-1106-preview",
  "gpt-4",
  "gpt-4-0613",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-1106",
] as const;

export const OpenAiModelEnum = z.enum(OpenAiModels);
export type OpenAiModel = z.infer<typeof OpenAiModelEnum>;
