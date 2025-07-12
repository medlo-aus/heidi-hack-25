import { useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PaymentCancelPage() {
  const router = useRouter();
  const returnTo = "/patient-medical-form";

  useEffect(() => {
    // Redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push(returnTo);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, returnTo]);

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">Payment Cancelled</h1>
        <p className="text-muted-foreground">
          Your payment has been cancelled. You will be redirected back to the
          patient medical form page shortly.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/patient-medical-form")}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Patient Medical Form
        </Button>
      </div>
    </div>
  );
}
