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

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const userOrderByRelevanceFieldEnumSchema = z.enum(['id','authSub','firstName','lastName']);

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
