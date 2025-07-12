import { createClient as createAdminClient } from "@supabase/supabase-js";

import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
  getUser: adminProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
    });
    return user;
  }),
});
