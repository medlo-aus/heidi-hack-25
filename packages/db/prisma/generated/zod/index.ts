import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull;
  if (v === 'JsonNull') return Prisma.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.function(z.tuple([]), z.any()) }),
    z.record(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','authSub','firstName','lastName']);

export const Patient_summaryScalarFieldEnumSchema = z.enum(['id','heidiSessionId','jsonOutput','createdAt']);

export const Heidi_auth_sessionScalarFieldEnumSchema = z.enum(['id','heidiSessionId','expiresAt','createdAt']);

export const Heidi_sessionScalarFieldEnumSchema = z.enum(['id','sessionId','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const JsonNullValueInputSchema = z.enum(['JsonNull',]).transform((value) => (value === 'JsonNull' ? Prisma.JsonNull : value));

export const QueryModeSchema = z.enum(['default','insensitive']);

export const userOrderByRelevanceFieldEnumSchema = z.enum(['id','authSub','firstName','lastName']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.JsonNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const patient_summaryOrderByRelevanceFieldEnumSchema = z.enum(['id','heidiSessionId']);

export const heidi_auth_sessionOrderByRelevanceFieldEnumSchema = z.enum(['id','heidiSessionId']);

export const heidi_sessionOrderByRelevanceFieldEnumSchema = z.enum(['id','sessionId']);

export const ConsultationStatusSchema = z.enum(['WAITING','ACTIVE','COMPLETE']);

export type ConsultationStatusType = `${z.infer<typeof ConsultationStatusSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const userSchema = z.object({
  id: z.string().uuid(),
  authSub: z.string(),
  firstName: z.string(),
  lastName: z.string(),
})

export type user = z.infer<typeof userSchema>

/////////////////////////////////////////
// USER PARTIAL SCHEMA
/////////////////////////////////////////

export const userPartialSchema = userSchema.partial()

export type userPartial = z.infer<typeof userPartialSchema>

// USER OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const userOptionalDefaultsSchema = userSchema.merge(z.object({
  id: z.string().uuid().optional(),
}))

export type userOptionalDefaults = z.infer<typeof userOptionalDefaultsSchema>

/////////////////////////////////////////
// PATIENT SUMMARY SCHEMA
/////////////////////////////////////////

export const patient_summarySchema = z.object({
  id: z.string(),
  heidiSessionId: z.string(),
  /**
   * should follow PatientExplainerSchema
   */
  jsonOutput: JsonValueSchema,
  createdAt: z.coerce.date(),
})

export type patient_summary = z.infer<typeof patient_summarySchema>

/////////////////////////////////////////
// PATIENT SUMMARY PARTIAL SCHEMA
/////////////////////////////////////////

export const patient_summaryPartialSchema = patient_summarySchema.partial()

export type patient_summaryPartial = z.infer<typeof patient_summaryPartialSchema>

// PATIENT SUMMARY OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const patient_summaryOptionalDefaultsSchema = patient_summarySchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
}))

export type patient_summaryOptionalDefaults = z.infer<typeof patient_summaryOptionalDefaultsSchema>

/////////////////////////////////////////
// HEIDI AUTH SESSION SCHEMA
/////////////////////////////////////////

export const heidi_auth_sessionSchema = z.object({
  /**
   * has_
   */
  id: z.string(),
  /**
   * from the heidi session
   */
  heidiSessionId: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type heidi_auth_session = z.infer<typeof heidi_auth_sessionSchema>

/////////////////////////////////////////
// HEIDI AUTH SESSION PARTIAL SCHEMA
/////////////////////////////////////////

export const heidi_auth_sessionPartialSchema = heidi_auth_sessionSchema.partial()

export type heidi_auth_sessionPartial = z.infer<typeof heidi_auth_sessionPartialSchema>

// HEIDI AUTH SESSION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const heidi_auth_sessionOptionalDefaultsSchema = heidi_auth_sessionSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
}))

export type heidi_auth_sessionOptionalDefaults = z.infer<typeof heidi_auth_sessionOptionalDefaultsSchema>

/////////////////////////////////////////
// HEIDI SESSION SCHEMA
/////////////////////////////////////////

export const heidi_sessionSchema = z.object({
  /**
   * hs_
   */
  id: z.string(),
  sessionId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type heidi_session = z.infer<typeof heidi_sessionSchema>

/////////////////////////////////////////
// HEIDI SESSION PARTIAL SCHEMA
/////////////////////////////////////////

export const heidi_sessionPartialSchema = heidi_sessionSchema.partial()

export type heidi_sessionPartial = z.infer<typeof heidi_sessionPartialSchema>

// HEIDI SESSION OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const heidi_sessionOptionalDefaultsSchema = heidi_sessionSchema.merge(z.object({
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}))

export type heidi_sessionOptionalDefaults = z.infer<typeof heidi_sessionOptionalDefaultsSchema>
