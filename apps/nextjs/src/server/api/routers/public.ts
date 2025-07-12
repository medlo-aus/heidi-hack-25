import { TRPCError } from "@trpc/server";
import { generateObject } from "ai";
import { z } from "zod";

import { PatientExplainerSchema } from "../../../../types/patient-explainer";
import { consultNoteSessionIds, getHeidiSession } from "../../heidi-fns";
import { createTRPCRouter, publicProcedure } from "../trpc";

const twilio = require("twilio");

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
    const allSessions = await Promise.allSettled(
      consultNoteSessionIds.map((consultNote) => getHeidiSession(consultNote)),
    ).then((sessions) => {
      return sessions
        .filter((session) => session.status === "fulfilled")
        .map((session) => session.value);
    });
    return allSessions;
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
        sessionId: z.string(),
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
      try {
        const patientSummary = await ctx.db.patient_summary.create({
          data: {
            id: `ps_${input.sessionId}`,
            heidiSessionId: input.sessionId,
            jsonOutput: result.object,
          },
        });
      } catch (error) {
        console.error("Error creating patient summary:", error);
      }

      return result.object;
    }),
  fetchPatientSummaryFromSessionId: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const patientSummary = await ctx.db.patient_summary.findFirst({
        where: { heidiSessionId: input.sessionId },
      });
      return patientSummary;
    }),
  sendPatientLink: publicProcedure
    .input(
      z.object({
        input: z.string(),
        phoneNumber: z.string().optional().default("+61423659207"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = new twilio(accountSid, authToken);

      // const patientSummary = await ctx.db.patient_summary.findFirst({
      //   where: {
      //     heidiSessionId: input.input,
      //   },
      //   orderBy: {
      //     createdAt: "desc",
      //   },
      // });

      // if (!patientSummary) {
      //   throw new TRPCError({
      //     code: "NOT_FOUND",
      //     message: "Please generate the patient summary first",
      //   });
      // }

      try {
        const message = await client.messages.create({
          body: `Hey Albert, thank you for your recent vist. Please find your session notes here: https://heidi-hack-25-nextjs.vercel.app/session/${input.input}. Contact us if you have any further questions!`,
          from: "+61483904803",
          to: input.phoneNumber,
        });
        return "success!";

        // console.log(message.body);
      } catch (error) {
        console.error("Error sending patient link:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send patient link",
        });
      }
    }),
});
