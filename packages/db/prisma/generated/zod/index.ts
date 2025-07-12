import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','authSub','firstName','lastName']);

export const Heidi_auth_sessionScalarFieldEnumSchema = z.enum(['id','token','expiresAt','createdAt']);

export const Heidi_sessionScalarFieldEnumSchema = z.enum(['id','sessionId','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const userOrderByRelevanceFieldEnumSchema = z.enum(['id','authSub','firstName','lastName']);

export const heidi_auth_sessionOrderByRelevanceFieldEnumSchema = z.enum(['id','token']);

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
// HEIDI AUTH SESSION SCHEMA
/////////////////////////////////////////

export const heidi_auth_sessionSchema = z.object({
  /**
   * has_
   */
  id: z.string(),
  token: z.string(),
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
