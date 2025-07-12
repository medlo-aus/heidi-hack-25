import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { CertificateReason, Gender, LeaveFrom } from "../../../types/form-data";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

// Zod schema for validating user profile data
const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(255),
  lastName: z.string().min(1, "Last name is required").max(255),
  email: z.string().email("Invalid email format").max(255),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  gender: z.string().max(10),
  address: z.string().optional(),
  hasRegularGP: z.boolean().optional(),
});

export const userRouter = createTRPCRouter({
  // Get user profile data for the current logged-in user
  getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view your profile",
      });
    }

    try {
      // Print full context user details for debugging
      console.log(
        "Current user context:",
        JSON.stringify(
          {
            id: ctx.user.id,
            email: ctx.user.email,
            role: ctx.user.role,
            aud: ctx.user.aud,
            full: ctx.user,
          },
          null,
          2,
        ),
      );

      console.log("Fetching user profile for authSubId:", ctx.user.id);

      const user = await ctx.db.user.findUnique({
        where: {
          authSubId: ctx.user.id,
        },
        include: {
          patient: true,
        },
      });

      if (!user) {
        console.log("No user found with authSubId:", ctx.user.id);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found in database",
        });
      }

      console.log(
        "Found user:",
        user.id,
        user.authSubId,
        user.firstName,
        user.lastName,
      );

      // Format date to YYYY-MM-DD for HTML form
      const formattedDateOfBirth = user.dateOfBirth
        ? user.dateOfBirth.toISOString().split("T")[0]
        : "";

      return {
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: formattedDateOfBirth,
        gender: user.gender || "",
        address: user.address || "",
        hasRegularGP: user.patient?.hasRegularGP || false,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve user profile",
      });
    }
  }),
});
