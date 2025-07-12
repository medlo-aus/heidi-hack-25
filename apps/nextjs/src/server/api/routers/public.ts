import { TRPCError } from "@trpc/server";
import { generateObject } from "ai";
import { z } from "zod";

import { PatientExplainerSchema } from "../../../../types/patient-explainer";
import { getHeidiSession } from "../../heidi-fns";
import { createTRPCRouter, publicProcedure } from "../trpc";

const HEIDI_API_URL =
  "https://registrar.api.heidihealth.com/api/v2/ml-scribe/open-api/";

export const publicRouter = createTRPCRouter({
  getSession: publicProcedure.mutation(async ({ ctx }) => {
    try {
      /* 
        Fetch JWT token from Heidi API
        This endpoint is used to get a JWT token for third party integrations
        The token is used to authenticate requests to the Heidi API
        The token expires after a certain time period
      */
      const response = await fetch(
        `${HEIDI_API_URL}jwt?email=test@heidihealth.com&third_party_internal_id=123`,
        {
          method: "GET",
          headers: {
            "Heidi-Api-Key": "MI0QanRHLm4ovFkBVqcBrx3LCiWLT8eu",
          },
        },
      );

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch JWT token",
        });
      }

      const data = (await response.json()) as {
        token: string;
        expiration_time: string;
      };

      return {
        token: data.token,
        expirationTime: new Date(data.expiration_time),
      };
    } catch (error) {
      console.error("Error fetching JWT token:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch JWT token",
      });
    }
  }),
  getSessionAndReturnSessionId: publicProcedure
    .input(
      z.object({
        authToken: z.string(),
      }),
    )
    .mutation(async ({ ctx }) => {
      try {
        /* 
        Fetch JWT token from Heidi API
        This endpoint is used to get a JWT token for third party integrations
        The token is used to authenticate requests to the Heidi API
        The token expires after a certain time period
      */
        const response = await fetch(
          `${HEIDI_API_URL}jwt?email=test@heidihealth.com&third_party_internal_id=123`,
          {
            method: "GET",
            headers: {
              "Heidi-Api-Key": "MI0QanRHLm4ovFkBVqcBrx3LCiWLT8eu",
            },
          },
        );

        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch JWT token",
          });
        }

        const data = (await response.json()) as {
          token: string;
          expiration_time: string;
        };

        const result = {
          token: data.token,
          expirationTime: new Date(data.expiration_time),
        };
      } catch (error) {
        console.error("Error fetching JWT token:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch JWT token",
        });
      }
    }),
  getHeidiSession: publicProcedure.query(async ({ ctx }) => {
    const session = await getHeidiSession();
    return session;
  }),
  fetchSelectSessions: publicProcedure.query(async ({ ctx }) => {
    const sessions = await getHeidiSession();
    return sessions;
  }),
  getHeidiSessionFromId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await getHeidiSession(input.id);
      return session;
    }),
  generateSchemaMutation: publicProcedure
    .input(
      z.object({
        input: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await generateObject({
        model: "google/gemini-2.0-flash-001",
        schema: PatientExplainerSchema,
        prompt: [
          {
            role: "system",
            content: `You are a helpful assistant that generates a patient explainer for the following session data.
              
              Make up a patient name/age/gender if needed.
              `,
          },
          {
            role: "user",
            content: input.input,
          },
        ],
      });
      return result.object;
    }),
  sendPatientLink: publicProcedure
    .input(
      z.object({
        input: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // @TODO: add twilio submission
      // from: "+61483904803", // Medlo SMS number
      // const accountSid = process.env.TWILIO_ACCOUNT_SID;
      // const authToken = process.env.TWILIO_AUTH_TOKEN;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "please implement me!",
      });
    }),
});
