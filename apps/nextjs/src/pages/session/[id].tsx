import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { generateObject } from "ai";
import { toast } from "sonner";
import z from "zod";

import type { PatientExplainer } from "../../../types/patient-explainer";
import { PatientExplainerSchema } from "../../../types/patient-explainer";
import ConcisePatientLetter from "../../components/concise-patient-letter";
import { ConsultIdsNavigator } from "../../components/ConsultIdsNavigator";
import PatientExplainerLetter from "../../components/patient-explainer-letter";
import { Button } from "../../components/ui/button";
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

  if (!id) {
    return <div>No ID</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">SessionPage - ID: {id}</div>
      {getHeidiSessionFromIdQuery.isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-4 w-12 animate-pulse rounded-full bg-neutral-400"
            />
          ))}
        </div>
      )}
      <div className="flex gap-4">
        {getHeidiSessionFromIdQuery.isError && (
          <div className="flex">Error</div>
        )}
        {getHeidiSessionFromIdQuery.data && (
          <pre className="max-h-[500px] max-w-lg overflow-y-auto whitespace-pre-wrap rounded-lg bg-neutral-900 p-4 text-xs text-white">
            {JSON.stringify(getHeidiSessionFromIdQuery.data, null, 2)}
          </pre>
        )}
        <div className="flex flex-col gap-2">
          <Button
            disabled={generateSchemaMutation.isPending}
            onClick={generateSchema}
          >
            {generateSchemaMutation.isPending
              ? "Generating..."
              : "Generate Schema"}
          </Button>
          {generatedSchema ? (
            <PatientExplainerLetter data={generatedSchema} />
          ) : (
            <div className="flex">Please generate letter</div>
          )}
        </div>
      </div>
      <ConsultIdsNavigator />
    </div>
  );
}
