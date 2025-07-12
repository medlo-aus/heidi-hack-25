// pages/_app.tsx
import { type AppType } from "next/app";
import Script from "next/script";
import { api } from "@/utils/api";
import { PagesTopLoader } from "nextjs-toploader/pages";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { Toaster as SonnerToaster } from "sonner";

import "@/styles/globals.css";

import { useEffect } from "react";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { ConsultationProvider } from "@/contexts/consultation-context";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ThemeProvider } from "next-themes";

import { TooltipProvider } from "../components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

// Create a new QueryClient instance
const queryClient = new QueryClient({
  // @TODO: might be able to find a better way to handle global error handling
  // https://barrymichaeldoyle.com/blog/tanstack-v5
  // https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose#a-bad-api
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 48, // 48 hours
    },
  },
});

// Create a persister
const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
});

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // checks that we are client-side
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      if (posthogKey) {
        posthog.init(posthogKey, {
          api_host:
            process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
          person_profiles: "always", // or 'always' to create profiles for anonymous users as well
          loaded: (posthog) => {
            if (process.env.NODE_ENV === "development") posthog.debug(); // debug mode in development
          },
          session_recording: {
            maskAllInputs: false,
            maskInputOptions: {
              password: true, // Highly recommended as a minimum!!
              date: false,
              tel: false,
              month: false,
              text: false,
              range: false,
              search: false,
              textarea: false,
              select: false,
            },
          },
        });
      }
    }

    // Track page views
    const handleRouteChange = () => posthog?.capture("$pageview");
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  const content = (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily
            ? inter.style.fontFamily
            : "sans-serif"};
        }
      `}</style>
      <PagesTopLoader color="black" showSpinner={false} />
      <Component {...pageProps} />
    </>
  );

  return (
    <PostHogProvider client={posthog}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={0}>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
          >
            <AuthProvider>
              <ConsultationProvider>
                {content}
                <Toaster />
                <SonnerToaster />
              </ConsultationProvider>
            </AuthProvider>
          </PersistQueryClientProvider>
        </TooltipProvider>
      </ThemeProvider>
      <Script
        id="plausible"
        defer
        data-domain="doccy.com.au"
        src="https://plausible.io/js/script.outbound-links.js"
        strategy="afterInteractive"
      />
    </PostHogProvider>
  );
};

export default api.withTRPC(MyApp);