/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { type AppRouter } from "@/server/api/root";
import { supabase } from "@/utils/supabase/browser";
import { httpBatchLink, httpLink, loggerLink, splitLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

// Create a function to get auth headers
const getAuthHeaders = async () => {
  let headers = {};

  if (typeof window !== "undefined") {
    try {
      const { data } = await supabase.auth.getSession();

      if (data?.session?.access_token) {
        headers = {
          ...headers,
          Authorization: `Bearer ${data.session.access_token}`,
        };
      }
    } catch (error) {
      console.error("Error getting Supabase session:", error);
    }
  }

  return headers;
};

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        splitLink({
          condition(op) {
            return Boolean(op.context.skipBatch);
          },
          true: httpLink({
            url: `${getBaseUrl()}/api/trpc`,
            transformer: superjson,
            headers: getAuthHeaders,
            async fetch(url, options) {
              console.log("tRPC request URL:", url);
              const response = await window.fetch(url, options);

              // Debug error responses
              if (!response.ok) {
                console.error("tRPC response status:", response.status);
                try {
                  const text = await response.clone().text();
                  console.error("tRPC response text:", text.substring(0, 500));
                } catch (e) {
                  console.error("Failed to read response text:", e);
                }
              }

              return response;
            },
          }),
          false: httpBatchLink({
            /**
             * Transformer used for data de-serialization from the server.
             *
             * @see https://trpc.io/docs/data-transformers
             */
            transformer: superjson,
            url: `${getBaseUrl()}/api/trpc`,
            headers: getAuthHeaders,
            async fetch(url, options) {
              console.log("tRPC batch request URL:", url);
              const response = await window.fetch(url, options);

              // Debug error responses
              if (!response.ok) {
                console.error("tRPC batch response status:", response.status);
                try {
                  const text = await response.clone().text();
                  console.error(
                    "tRPC batch response text:",
                    text.substring(0, 500),
                  );
                } catch (e) {
                  console.error("Failed to read batch response text:", e);
                }
              }

              return response;
            },
          }),
        }),
      ],
    };
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
  transformer: superjson,
});

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
