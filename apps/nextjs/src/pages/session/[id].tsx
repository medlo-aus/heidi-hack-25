import Link from "next/link";
import { useRouter } from "next/router";

import { ConsultIdsNavigator } from "../../components/ConsultIdsNavigator";
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
      {getHeidiSessionFromIdQuery.isError && <div className="flex">Error</div>}
      {getHeidiSessionFromIdQuery.data && (
        <pre className="max-h-[500px] max-w-lg overflow-y-auto whitespace-pre-wrap rounded-lg bg-neutral-900 p-4 text-xs text-white">
          {JSON.stringify(getHeidiSessionFromIdQuery.data, null, 2)}
        </pre>
      )}
      <ConsultIdsNavigator />
    </div>
  );
}
