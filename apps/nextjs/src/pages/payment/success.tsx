import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/utils/api";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { paymentIntentId, consultationId } = router.query;
  const [linkedConsultationId, setLinkedConsultationId] = useState<
    string | undefined
  >();
  const { user, isGuest, session } = useAuth();

  // If someone tries to access this page directly without a payment intent ID, redirect them
  useEffect(() => {
    if (!paymentIntentId) {
      router.push("/");
    }
  }, [paymentIntentId, router]);

  // If we have a consultation ID from the query, store it for guest session persistence
  useEffect(() => {
    const { consultationId } = router.query;
    if (typeof consultationId === "string" && consultationId) {
      setLinkedConsultationId(consultationId);

      // Store the consultation ID in localStorage for guest users
      if (isGuest && session && user) {
        console.log("[PaymentSuccess] Linking consultation to guest session", {
          consultationId,
          userId: user.id,
        });
        setGuestConsultationId(consultationId);
      }
    }
  }, [router.query, isGuest, session, user]);

  // Log guest session information for debugging
  useEffect(() => {
    if (isGuest && user) {
      console.log("Payment success: Guest user detected", {
        userId: user.id,
        isGuest,
        hasSession: !!session,
        consultationId: linkedConsultationId,
      });
    }
  }, [isGuest, user, session, linkedConsultationId]);

  const handleContinueToQueue = () => {
    router.push("/queue");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Payment Successful!
        </h1>
        <p className="mb-6 text-gray-600">
          Thank you for your payment. Please proceed to the queue.
          {/* {isGuest && (
            <span className="mt-2 block text-sm text-blue-600">
              Your guest session has been saved. You can close this browser and
              return later to check your status.
            </span>
          )} */}
        </p>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Transaction ID: <span className="font-mono">{paymentIntentId}</span>
          </p>
          <Button
            onClick={handleContinueToQueue}
            className="mb-2 w-full bg-blue-600 hover:bg-blue-700"
          >
            Continue to Queue
          </Button>
        </div>
      </div>
    </div>
  );
}
