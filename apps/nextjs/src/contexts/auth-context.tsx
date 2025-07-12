import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import {
  setGuestSession,
  clearGuestSession,
  guestSessionExists,
  getGuestSession,
} from "@/utils/guest-session-utils";
import { clearConsultId, clearPatientMedicalForm, clearPaymentIntentId } from "@/utils/patient-consult-utils";
import { clearDoctorConsultationId } from "@/utils/doctor-consult-utils";
import { supabase } from "@/utils/supabase/browser";
import {
  type Session,
  type User,
} from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isGuest: boolean; /* Comprehensive guest detection: user metadata OR localStorage indicators */
  userOption: string | null;
  signInWithEmailPassword: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error: Error | null }>;
  signInWithGoogle: () => Promise<{
    success: boolean;
    error: Error | null;
    url: string | null;
  }>;
  signInWithPhone: (
    phone: string,
  ) => Promise<{ success: boolean; error: Error | null }>;
  signInAnonymously: () => Promise<{
    error: Error | null;
    userId: string | null;
    session: Session | null;
  }>;
  sendMagicLink: (
    email: string,
    redirectTo?: string,
  ) => Promise<{ success: boolean; error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  /* 
   * Refs to prevent duplicate auth operations, similar to the mutation prevention pattern.
   * These track if auth operations are currently in progress to prevent race conditions.
   */
  const authStateUpdateInProgressRef = useRef(false);
  const signOutInProgressRef = useRef(false);
  const refreshInProgressRef = useRef(false);

  const {
    data: userData,
    isLoading: isUserQueryLoading,
  } = api.user.getUserById.useQuery(
    { authSubId: user?.id ?? "" },
    { enabled: !!user?.id },
  );

  // User type and guest detection
  const userOption = userData?.userOption ?? "P";
  const isGuest = !!user?.user_metadata?.is_guest || (!user && guestSessionExists());

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth state change handler
  useEffect(() => {
    setIsLoading(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentAuthSession) => {
        /* 
         * Prevent duplicate auth state updates, similar to preventing duplicate mutations.
         * This is especially important with React StrictMode which can cause double execution.
         */
        if (authStateUpdateInProgressRef.current) {
          console.log("[AuthContext] Auth state update already in progress, skipping duplicate");
          return;
        }

        authStateUpdateInProgressRef.current = true;

        try {
          console.log("[AuthContext] Processing auth state change, event:", event);
          setSession(currentAuthSession);
          setUser(currentAuthSession?.user ?? null);

          // Handle guest session storage - only on client side
          if (currentAuthSession?.user?.user_metadata?.is_guest) {
            // Store guest session and auth ID
            setGuestSession(JSON.stringify(currentAuthSession));
          } else if (currentAuthSession) {
            // Registered user - clear guest data
            clearGuestSession();
          } else {
            // No session - clear guest session but keep other guest data
            clearGuestSession();
          }

          setIsLoading(false);
        } finally {
          /* 
           * Always reset the flag when done, regardless of success or failure.
           * This ensures the flag doesn't get stuck if an error occurs.
           */
          authStateUpdateInProgressRef.current = false;
        }
      },
    );

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, [isMounted, router]);

  // Handle redirection after user data is loaded
  useEffect(() => {
    /* 
     * Only redirect when:
     * 1. Component is mounted
     * 2. User is authenticated and not a guest
     * 3. User data query has completed (not loading)
     * 4. We have the user data with userOption
     * 5. We're currently on the login page (to avoid unwanted redirects)
     */
    if (
      isMounted && 
      user && 
      !user.user_metadata?.is_guest && 
      !isUserQueryLoading && 
      userData && 
      (router.pathname === "/login" || router.pathname === "/")
    ) {
      console.log("[AuthContext] User data loaded, userOption:", userData.userOption, "redirecting...");
      
      if (userData.userOption === "D") {
        console.log("[AuthContext] Redirecting to doctor dashboard");
        void router.push("/doctor-dashboard");
      } else if (userData.userOption === "P") {
        console.log("[AuthContext] Redirecting to patient dashboard");
        void router.push("/patient-dashboard");
      }
    }
  }, [isMounted, user, isUserQueryLoading, userData, router]);

  // Handle unauthorized access to protected routes
  useEffect(() => {
    if (!isMounted || isLoading || isUserQueryLoading) return;

    const protectedRoutes = [
      "/doctor-dashboard",
      "/patient-dashboard",
      "/admin",
      "/payment",
      "/queue",
      "/consultation",
    ];

    const isProtectedRoute = protectedRoutes.some(route => 
      router.pathname.startsWith(route)
    );

    if (isProtectedRoute && !user && !isGuest) {
      console.log("[AuthContext] Unauthorized access to protected route, redirecting to login");
      void router.replace("/login");
    }
  }, [isMounted, user, isGuest, isLoading, isUserQueryLoading, router.pathname]);

  // Log user state changes
  useEffect(() => {
    if (isMounted && ((user && !isLoading) || (!user && isGuest))) {
      console.log(
        "[AuthContext]: Auth state -",
        "ID:", user?.id || "potential-guest",
        "Email:", user?.email || "none",
        "isGuest:", isGuest,
        "userOption:", userOption,
        "userData:", userData,
        "isUserQueryLoading:", isUserQueryLoading,
        "hasGuestData:", isGuest,
      );
    }
  }, [isMounted, user, isLoading, isGuest, userOption, userData, isUserQueryLoading]);

  const signInWithEmailPassword = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { success: !error, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInAnonymously = async () => {
    if (user?.user_metadata?.is_guest && session) {
      return { error: null, userId: user.id, session: session };
    }

    setIsLoading(true);
    try {
      if (user && !user.user_metadata?.is_guest) {
        await supabase.auth.signOut();
      }
      const { data, error } = await supabase.auth.signInAnonymously({
        options: {
          data: { is_guest: true, created_at: new Date().toISOString() },
        },
      });
      if (error) throw error;
      return {
        error: null,
        userId: data.user?.id ?? null,
        session: data.session,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const sendMagicLink = async (email: string, redirectTo?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            redirectTo ?? `${window.location.origin}/auth-resolve`,
          shouldCreateUser: false,
        },
      });
      return { success: !error, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (signOutInProgressRef.current) {
      console.log("[AuthContext] Sign out already in progress, skipping duplicate");
      return;
    }

    signOutInProgressRef.current = true;
    setIsLoading(true);

    try {
      console.log("[AuthContext] Processing sign out");

      // Remove guest session from local storage
      if (user?.user_metadata?.is_guest) {
        clearGuestSession();
      }

      // Remove doctor consultation ID from local storage
      if (userOption === "D") {
        clearDoctorConsultationId();
      }

      // Remove patient consultation ID, medical form, and payment intent ID from local storage
      if (userOption === "P") {
        clearConsultId();
        clearPatientMedicalForm();
        clearPaymentIntentId();
      }

      // Clear residual supabase tokens
      for (const key in localStorage) {
        if (key.startsWith("sb")) {
          localStorage.removeItem(key);
        }
      }      

      // Clear supabase session and redirect in parallel
      await Promise.all([
        supabase.auth.signOut(),
        router.replace("/login", undefined, { shallow: false })
      ]);
    } finally {
      signOutInProgressRef.current = false;
      setIsLoading(false);
    }
  };

  // Implement signInWithGoogle method
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `/`,
        },
      });
      return {
        success: !error,
        error: error,
        url: data.url,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to sign in with Google"),
        url: null,
      };
    }
  };

  // Implement signInWithPhone method
  const signInWithPhone = async (phone: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      return { success: !error, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Derived isLoading for the context: true if not mounted, Supabase auth is loading OR if user is set but their specific data isn't loaded yet.
  const finalIsLoading =
    !isMounted || isLoading || isUserQueryLoading;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading: finalIsLoading, // Use the derived comprehensive loading state
        isGuest,
        userOption,
        signInWithEmailPassword,
        signInWithGoogle,
        signInWithPhone,
        signInAnonymously,
        sendMagicLink,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export a singleton instance of the Supabase client
export { supabase };
