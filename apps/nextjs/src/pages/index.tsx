import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Clipboard, Clock, Loader, Shield, Stethoscope } from "lucide-react";

import { api } from "../utils/api";

export default function Home() {
  const getSessionMutation = api.public.getSession.useMutation({});

  const getHeidiSessionMutation = api.public.getHeidiSession.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: Infinity,
      refetchOnReconnect: false,

      refetchIntervalInBackground: false,
    },
  );

  return (
    <div className="flex min-h-screen flex-col justify-center">
      <header className="absolute top-0 z-50 w-full bg-transparent">
        <div className="container mx-auto flex h-14 items-center px-2 sm:px-4">
          <div className="mr-4 flex items-center">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <span className="inline-block text-xl font-extrabold text-black">
                Heidi
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="prose flex-1">
        <div className="container mx-auto flex flex-col items-center gap-4 py-8">
          <Button
            // onClick={() => getHeidiSessionMutation()}
            disabled={getHeidiSessionMutation.isPending}
          >
            {getHeidiSessionMutation.isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Fetching session...
              </>
            ) : (
              "Get Session"
            )}
          </Button>

          {getHeidiSessionMutation.data && (
            <pre className="max-w-lg whitespace-pre-wrap rounded-lg bg-neutral-900 p-4 text-white">
              {JSON.stringify(getHeidiSessionMutation.data, null, 2)}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}
