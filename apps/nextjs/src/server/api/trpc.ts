/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { type GetServerSidePropsContext } from "next";
import { type User } from "@supabase/supabase-js";
import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@heidi/db";

import { createClient } from "../../utils/supabase/server-props";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

type CreateContextOptions = Record<string, never> & {
  user?: User;
};

/**
 * Helper function to get the user from the request context
 * - Handles both server-side (Next.js) and client-side (Expo) requests
 * - For Next.js, uses the supabase client from server props
 * - For client-side, uses the Authorization header token
 */
export const getUser = async ({ req, res }: GetServerSidePropsContext) => {
  // First try to get user from Authorization header (client-side requests)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const supabase = createClient({ req, res });
      
      // Verify the token using the admin client
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error) {
        console.error('Error verifying token:', error);
        return { error: "Invalid token" };
      }
      
      if (data.user) {
        return data.user;
      }
    } catch (error) {
      console.error('Error processing auth header:', error);
      return { error: "Auth processing error" };
    }
  }
  
  // If no Authorization header, fall back to server-side session
  const supabase = createClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No user found" };
  }

  return user;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (_opts: CreateContextOptions) => {
  return {
    db,
    req: _opts.req,
    res: _opts.res,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (_opts: CreateNextContextOptions) => {
  const { req, res } = _opts;
  
  // Try to get the user before creating the context
  const user = await getUser({ req, res });
  
  return createInnerTRPCContext({
    req,
    res,
    user: !user?.error ? user : undefined
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

const addSessionToContext = t.middleware(async ({ ctx, next }) => {
  const { req, res } = ctx;
  const userRes = await getUser({ req, res });

  if (!userRes?.error) {
    const user = userRes;
    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  } else {
    return next({
      ctx: {
        ...ctx,
        user: null,
      },
    });
  }
});

/**
 * Protected (authenticated) procedure
 *
 * This is the base procedure for queries and mutations that require authentication. It verifies
 * the session is valid and guarantees `ctx.user` is not null.
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(addSessionToContext)
  .use(async ({ next, ctx }) => {
    if (!ctx.user || "error" in ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });

export const adminProcedure = protectedProcedure.use(async ({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // @TODO: add validation logic if special admin permissions are needed i.e.
  // if (!ctx.user?.email?.includes("@heidi.com.au")) {
  //   throw new TRPCError({ code: "UNAUTHORIZED" });
  // }
  return next({ ctx });
});
