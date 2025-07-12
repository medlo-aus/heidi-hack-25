import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Hook that shows a browser alert when trying to navigate away with unsaved changes
 * Handles both browser navigation and Next.js client-side routing
 * @param isDirty - Boolean indicating if there are unsaved changes
 * @param message - Message to show in the alert
 */
export function useBeforeUnload(isDirty: boolean, message: string) {
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    const handleRouteChange = (url: string) => {
      if (isDirty && !window.confirm(message)) {
        router.events.emit("routeChangeError");
        // Throw error to abort route change
        throw `Route change to "${url}" was aborted`;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [isDirty, message, router]);
}
