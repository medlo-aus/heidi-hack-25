import { useState } from "react";
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

  const fetchPatientSummaryFromSessionIdQuery =
    api.public.fetchPatientSummaryFromSessionId.useQuery(
      {
        sessionId: id as string,
      },
      {
        enabled: !!id,
      },
    );

  if (!id) {
    return <div>No ID</div>;
  }

  return (
    <div className="flex w-full flex-row justify-center gap-4 p-4">
      <div className="flex flex-col gap-4">
        {/* <div className="flex">SessionPage - ID: {id}</div> */}
        {getHeidiSessionFromIdQuery.isError && (
          <div className="flex">Error</div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2"></div>
          {fetchPatientSummaryFromSessionIdQuery.data ? (
            <PatientExplainerLetter
              data={fetchPatientSummaryFromSessionIdQuery.data?.jsonOutput}
            />
          ) : (
            <div className="relative flex min-h-[80vh] flex-col gap-2">
              <div className="absolute left-1/2 top-64 z-10 flex min-w-64 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-black/5 bg-white/50 p-4 backdrop-blur-sm">
                <BotIcon className="mr-2 min-h-8 min-w-8" />
                Gemini Is Preparing Your Patient Notes...
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
        </div>
      </div>
      {/* <ConsultIdsNavigator /> */}
    </div>
  );
}
