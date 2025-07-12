import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthLayout } from "@/components/AuthLayout";
import { GoogleIcon, MedloLogo, MedloLogoSquare } from "@/components/Icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useJoinActiveCall } from "@/hooks/use-join-active-call";
import { api } from "@/utils/api";
import * as guestUtils from "@/utils/guest-session-utils";
import { supabase } from "@/utils/supabase/browser";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import { useConsultation } from "@/contexts/consultation-context";

type QueryParams = {
  totalAmount?: number;
  hospitalName?: string;
  phone_autofill?: string;
  promotion?: string;
  isSignUp?: boolean;
};

export default function LoginPage() {
  const router = useRouter();

  // AuthContext for user option and details
  const {
    user,
    isGuest,
    isLoading,
    signInAnonymously,
    signInWithEmailPassword,
    signInWithGoogle,
    signInWithPhone,
    userOption,
  } = useAuth();
  // Consult context for patient
  const {
    status: consultationStatus,
    consultationId,
    isLoading: isConsultationLoading,
    checkConsultationStatus,
  } = useConsultation();
  
  const { joinCall, isLoading: isJoiningCall } = useJoinActiveCall();

  const [isPending, setIsPending] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPhoneOption, setShowPhoneOption] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "guest">(
    "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const justSignedUpOrIn = useRef(false);
  const [messageFromRedirect, setMessageFromRedirect] = useState<string | null>(
    null,
  );
  const [isGooglePending, setIsGooglePending] = useState(false);

  // Setup tRPC mutations
  const registerMutation = api.user.register.useMutation();

  useEffect(() => {
    if (isLoading || isConsultationLoading || !router.isReady) return;
  
    // Prevent immediate re-run after login/signup
    if (justSignedUpOrIn.current) {
      justSignedUpOrIn.current = false;
      return;
    }
  
    const { email: emailParam, message, isSignUp: isSignUpParam } = router.query;
  
    if (typeof emailParam === "string") setEmail(emailParam);
    if (typeof message === "string") setMessageFromRedirect(message);
    if (isSignUpParam === "true") setAuthMode("signup");
    
    /* 
     * Enhanced consultation status checking for both guest and registered users.
     * This provides better redirection assistance when there's an ongoing consultation.
     */
    const handleConsultationRedirection = async () => {
      if (!isGuest && userOption === "D") {
        toast.info("Redirecting to doctor dashboard...");
        void router.push("/doctor-dashboard");
        return;
      }
      
      // For guests: Check stored consultation ID and status
      if (isGuest && consultationId) {
        if (consultationStatus === "ACTIVE") {
          toast.info("Rejoining your active consultation...");
          void joinCall(consultationId);
          return;
        }
        
        if (consultationStatus === "WAITING") {
          toast.info("Returning to queue...");
          void router.push("/queue");
          return;
        }
      }

      // For registered users: Check for ongoing consultations
      if (user && !isGuest) {
        try {
          // Call checkConsultationStatus to update context state
          await checkConsultationStatus();
          
          // After the call, check the updated context state
          if (consultationStatus === "ACTIVE" && consultationId) {
            toast.info("Rejoining your active consultation...");
            void joinCall(consultationId);
            return;
          }
          
          if (consultationStatus === "WAITING" && consultationId) {
            toast.info("Returning to queue...");
            void router.push("/queue");
            return;
          }

          // No ongoing consultation - redirect to dashboard
          if (consultationStatus === "NONE") {
            void router.push("/patient-dashboard");
            return;
          }
        } catch (error) {
          console.error("Error checking consultation status:", error);
          // Continue with normal flow if status check fails
          void router.push("/patient-dashboard");
        }
      }
    };

    void handleConsultationRedirection();
  
    // Guest state handling - show guest option if no user and no ongoing consultation
    if (isGuest && !user && consultationStatus === "NONE" && authMode === "login") {
      setAuthMode("guest");
    }
  }, [
    isLoading,
    isConsultationLoading,
    router.isReady,
    user,
    isGuest,
    consultationStatus,
    consultationId,
    checkConsultationStatus,
    joinCall,
    router,
    authMode,
  ]);
  
  

  async function loginGoogleHandler() {
    setIsGooglePending(true);
    try {
      const { success, error, url } = await signInWithGoogle();

      if (!success || error) {
        toast.error(error?.message || "Failed to initiate Google Sign-In.");
      } else if (url) {
        window.location.href = url;
      } else {
        toast.error("Could not get Google OAuth URL.");
      }
    } catch (error: any) {
      toast.error(
        error?.message || "An unexpected error occurred with Google Sign-In.",
      );
    } finally { 
      // setIsGooglePending(false); // Page will redirect, so this might not be necessary
    }
  }

  const handleGuestLogin = async () => {
    setIsPending(true);
    justSignedUpOrIn.current = true; // Prevent immediate redirect loops
    try {
      const {
        error,
        session: guestSession,
        userId,
      } = await signInAnonymously();

      if (error) {
        console.error(
          "[handleGuestLogin] Error signing in anonymously:",
          error,
        );
        toast.error(error.message || "Failed to sign in as guest.");
        justSignedUpOrIn.current = false;
        setIsPending(false);
        return;
      }
      if (!guestSession || !userId) {
        console.error(
          "[handleGuestLogin] Missing session or userId after anonymous sign-in",
        );
        toast.error("Failed to establish guest session.");
        justSignedUpOrIn.current = false;
        setIsPending(false);
        return;
      }
      
      /* Guest login successful - redirect to medical form */
      toast.success("Continuing as guest...");
      void router.push("/patient-medical-form");
    } catch (error: any) {
      console.error(
        "[handleGuestLogin] Error during guest login process:",
        error,
      );
      toast.error(error?.message || "An error occurred during guest login.");
      justSignedUpOrIn.current = false;
    } finally {
      setIsPending(false);
    }
  };

  // Manage login of email and password type using auth context
  async function handleEmailPasswordLogin(e: FormEvent) {
    e.preventDefault();
    setIsPending(true);
    justSignedUpOrIn.current = true;
    try {
      const { success, error } = await signInWithEmailPassword(email, password);
      if (!success && error) {
        toast.error(error.message || "Invalid email or password");
        justSignedUpOrIn.current = false;
        setIsPending(false);
      } else if (success) {
        toast.success("Signed in successfully!");
        
        // Set a shorter timeout and let the useEffect handle the redirect
        setTimeout(() => {
          justSignedUpOrIn.current = false; // Allow useEffect to handle redirect
          setIsPending(false);
        }, 300);
      }
    } catch (error: any) {
      toast.error(error?.message || "Invalid email or password");
      justSignedUpOrIn.current = false;
      setIsPending(false);
    }
  }

  // Manage signup of email and password type using trpc user router
  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsPending(true);
    try {
      await registerMutation.mutateAsync({
        email,
        password,
        firstName,
        lastName,
      });
      // Clear the form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
      toast.success(
        "Account created successfully! Please check your email to verify your account.",
      );
      setAuthMode("login");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create account.");
    } finally {
      setIsPending(false);
    }
  }

  // Handle phone authentication
  async function loginPhone(e: FormEvent) {
    e.preventDefault();
    setIsPending(true);
    try {
      const { success, error } = await signInWithPhone(phoneNumber);
      if (!success && error) {
        toast.error(error.message || "Phone authentication failed.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Phone authentication is not implemented.");
    } finally {
      setIsPending(false);
    }
  }

  // Show loading state while checking auth and consultation status
  if (isLoading || isConsultationLoading || isJoiningCall) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <p>
            {isLoading 
              ? "Checking your session..." 
              : isJoiningCall
                ? "Joining your consultation..."
                : "Checking consultation status..."}
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-center text-2xl font-semibold">
            {authMode === "login"
              ? "Welcome Back"
              : authMode === "signup"
                ? "Create Account"
                : "Continue as Guest"}
          </h2>
          <p className="text-center text-sm text-muted-foreground">
            {authMode === "login"
              ? "Sign in to access your account"
              : authMode === "signup"
                ? "Create a new account to get started"
                : "Continue without creating an account"}
          </p>

          {/* Display redirect message if present */}
          {messageFromRedirect && (
            <div className="mt-2 rounded-md bg-blue-50 p-3 text-center text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {messageFromRedirect}
            </div>
          )}
        </div>

        {!showPhoneOption ? (
          <div className="flex flex-col gap-2">
            {authMode === "signup" ? (
              <form
                onSubmit={handleSignUp}
                className="flex flex-col gap-2"
                autoComplete="off"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-2 w-full"
                  disabled={isPending || registerMutation.isPending}
                >
                  {isPending || registerMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            ) : authMode === "login" ? (
              <form
                onSubmit={handleEmailPasswordLogin}
                className="flex flex-col gap-2"
                autoComplete="off"
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-2 w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleGuestLogin}
                  className="mt-2 w-full"
                  disabled={isPending}
                  variant="outline"
                >
                  {isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-neutral-600"></div>
                      Continuing as Guest...
                    </>
                  ) : (
                    "Continue as Guest"
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  No account will be created. You can access your consultation
                  after payment.
                </p>
              </div>
            )}

            {/* Social Login Options */}
            {authMode !== "guest" && (
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={loginGoogleHandler}
                    disabled={isGooglePending}
                  >
                    {isGooglePending ? (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-neutral-600"></div>
                    ) : (
                      <GoogleIcon className="mr-2 h-4 w-4" />
                    )}
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPhoneOption(true)}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Phone
                  </Button>
                </div>
              </div>
            )}

            {/* Toggle between login, signup, and guest modes */}
            <div className="mt-4 text-center text-sm">
              {authMode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setAuthMode("signup")}
                  >
                    Sign up
                  </button>
                  {" or "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setAuthMode("guest")}
                  >
                    continue as guest
                  </button>
                </>
              ) : authMode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setAuthMode("login")}
                  >
                    Sign in
                  </button>
                  {" or "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setAuthMode("guest")}
                  >
                    continue as guest
                  </button>
                </>
              ) : (
                <>
                  Have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setAuthMode("login")}
                  >
                    Sign in
                  </button>
                  {" or "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setAuthMode("signup")}
                  >
                    create an account
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <form onSubmit={loginPhone} className="flex flex-col gap-2">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+61 400 000 000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="mt-2 w-full">
                Send Code
              </Button>
            </form>

            <button
              type="button"
              className="mt-2 text-center text-sm text-blue-600 hover:underline"
              onClick={() => setShowPhoneOption(false)}
            >
              Back to other login options
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
