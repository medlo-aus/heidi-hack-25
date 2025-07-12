import { createClient } from "./component";

// Save the current Supabase session to localStorage under a custom key
export async function saveSupabaseSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    localStorage.setItem("guest_supabase_session", JSON.stringify(session));
  }
}

// Restore the Supabase session from localStorage, if available
export async function restoreSupabaseSession() {
  const supabase = createClient();
  const savedSession = localStorage.getItem("guest_supabase_session");
  if (savedSession) {
    try {
      const sessionObj = JSON.parse(savedSession);
      await supabase.auth.setSession(sessionObj);
    } catch (e) {
      console.error("Failed to restore Supabase session", e);
      localStorage.removeItem("guest_supabase_session");
    }
  }
}
