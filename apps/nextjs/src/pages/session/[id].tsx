import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { generateObject } from "ai";
import { formatDistanceToNow } from "date-fns";
import { BotIcon, SmartphoneIcon } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import type { PatientExplainer } from "../../../types/patient-explainer";
import { PatientExplainerSchema } from "../../../types/patient-explainer";
import ConcisePatientLetter from "../../components/concise-patient-letter";
import { ConsultIdsNavigator } from "../../components/ConsultIdsNavigator";
import { GoogleIcon } from "../../components/Icons";
import PatientExplainerLetter from "../../components/patient-explainer-letter";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { cn } from "../../lib/utils";
import { consultNoteSessionIds } from "../../server/heidi-fns";
import { api } from "../../utils/api";

export default function SessionPage() {
  const router = useRouter();
  const { id } = router.query;

  const getHeidiSessionFromIdQuery = api.public.getHeidiSessionFromId.useQuery(
    {
      id: id as string,
    },
    {
      enabled: !!id,
    },
  );

  const [generatedSchema, setGeneratedSchema] =
    useState<PatientExplainer | null>(null);

  const generateSchemaMutation =
    api.public.generateSchemaMutation.useMutation();

  const generateSchema = async () => {
    const result = await generateSchemaMutation
      .mutateAsync({
        input: JSON.stringify(getHeidiSessionFromIdQuery.data),
      })
      .then((result) => {
        setGeneratedSchema(result);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error generating schema: " + error.message);
      });
  };

  const sendToPatientMutation = api.public.sendPatientLink.useMutation();

  const sendToPatient = async () => {
    toast.promise(
      sendToPatientMutation.mutateAsync({
        input: `https://heidi-hack-25-nextjs.vercel.app/session/${id}`,
      }),
      {
        loading: "Sending to patient...",
        success: "Sent to patient",
        error: (error) => "Error sending to patient: " + error.message,
      },
    );
  };

  useEffect(() => {
    setGeneratedSchema(null);
  }, [id]);

  const fetchSelectSessionsQuery = api.public.fetchSelectSessions.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: Infinity,
      refetchOnReconnect: false,
      refetchIntervalInBackground: false,
    },
  );

  if (!id) {
    return <div>No ID</div>;
  }

  return (
    <div className="flex w-full flex-row justify-center gap-4 p-4">
      <div className="flex flex-col gap-2">
        <div className="space-y-2">
          {fetchSelectSessionsQuery.data?.map((session) => {
            const isCurrentSession = session.session_id === id;
            return (
              <Link
                href={`/session/${session.session_id}`}
                key={session.session_id}
                className="block"
              >
                <Card
                  className={cn(
                    "cursor-pointer border border-border p-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800",
                    isCurrentSession &&
                      "border-primary bg-neutral-50 ring-2 ring-primary dark:bg-neutral-800",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {session.session_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(session.created_at))} ago
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {session.session_id.slice(0, 8)}...
                        {session.session_id.slice(-8)}
                      </span>
                    </div>
                    <ExternalLinkIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Card>
              </Link>
            );
          })}
          {fetchSelectSessionsQuery.isPending && (
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                      <div className="h-3 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                      <div className="h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                    <div className="h-4 w-4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* <div className="flex">SessionPage - ID: {id}</div> */}
        {getHeidiSessionFromIdQuery.isError && (
          <div className="flex">Error</div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2">
            <Button
              disabled={generateSchemaMutation.isPending}
              onClick={generateSchema}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              {generateSchemaMutation.isPending
                ? "Generating..."
                : "Generate Patient Notes"}
            </Button>
            <Button
              onClick={sendToPatient}
              //   disabled={!sendToPatientMutation.isPending}
            >
              <SmartphoneIcon className="mr-2 h-4 w-4" />
              {sendToPatientMutation.isPending
                ? "Sending..."
                : "Send to Patient"}
            </Button>
          </div>
          {generateSchemaMutation.isPending && (
            <div className="relative flex min-h-[80vh] flex-col gap-2">
              <div className="absolute left-1/2 top-64 z-10 flex min-w-64 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-black/5 bg-white/50 p-4 backdrop-blur-sm">
                <BotIcon className="mr-2 min-h-8 min-w-8" />
                Gemeni Is Preparing Your Patient Notes...
              </div>
              {Array.from({ length: 32 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-4 animate-pulse rounded-full bg-neutral-400 ${
                    index % 4 === 0
                      ? "w-32"
                      : index % 4 === 1
                        ? "w-24"
                        : index % 4 === 2
                          ? "w-40"
                          : "w-16"
                  }`}
                />
              ))}
            </div>
          )}
          {generatedSchema ? (
            <PatientExplainerLetter data={generatedSchema} />
          ) : null}
        </div>

        {/* <details className="transcript">
          <summary className="list-none">
            {getHeidiSessionFromIdQuery.data?.consult_note && (
              <div className="max-h-[500px] max-w-lg overflow-y-auto whitespace-pre-wrap rounded-lg bg-neutral-900 p-4 text-xs text-white">
                {getHeidiSessionFromIdQuery.data.consult_note.result}
              </div>
            )}
          </summary>
        </details> */}

        <summary className="list-none">
          <details>
            {getHeidiSessionFromIdQuery.data && (
              <pre className="max-h-[500px] max-w-lg overflow-y-auto whitespace-pre-wrap rounded-lg bg-neutral-900 p-4 text-xs text-white">
                {JSON.stringify(getHeidiSessionFromIdQuery.data, null, 2)}
              </pre>
            )}
          </details>
        </summary>
      </div>
      {/* <ConsultIdsNavigator /> */}
    </div>
  );
}
