import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { generateObject } from "ai";
import { formatDistanceToNow } from "date-fns";
import { SmartphoneIcon } from "lucide-react";
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

  const fetchSelectSessionsQuery = api.public.fetchSelectSessions.useQuery();

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
          </div>
          {generatedSchema ? (
            <PatientExplainerLetter data={generatedSchema} />
          ) : (
            <div className="flex">Please generate letter</div>
          )}
        </div>
      </div>
      {/* <ConsultIdsNavigator /> */}
    </div>
  );
}
