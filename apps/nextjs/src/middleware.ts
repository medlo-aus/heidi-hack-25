import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - login (login page should be permitted)
     * - favicon.ico (favicon file)
     * - Any file extensions (images)
     * - api/webhook (webhook endpoints)
     * - api/cron (cron job endpoints)
     * Feel free to modify this pattern to include more paths.
     */
    // "/((?!_next/static|_next/image|login|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // "*",
    "/((?!_next/static|_next/image|favicon.ico|api/webhook|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

/**
 * Removed '$' from the negative lookahead to include the home route ('/') in the middleware.
 * This ensures that the middleware runs on the home route as well, while still excluding the specified paths.
 * Added 'api/webhook' and 'api/cron' to the negative lookahead to avoid these routes.
 */
