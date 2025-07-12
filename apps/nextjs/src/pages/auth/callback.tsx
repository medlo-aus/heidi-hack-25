import { useEffect } from "react";
import { useRouter } from "next/router";
import { AuthLayout } from "@/components/AuthLayout";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    void router.push("/login");
  }, [router]);

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h2 className="text-2xl font-semibold">Verifying your email...</h2>
        <p className="text-center text-sm text-muted-foreground">
          Please wait while we verify your email address.
        </p>
      </div>
    </AuthLayout>
  );
}
