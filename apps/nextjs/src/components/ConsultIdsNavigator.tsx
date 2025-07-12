import Link from "next/link";
import { ExternalLink, ExternalLinkIcon } from "lucide-react";

import { consultNoteSessionIds } from "../server/heidi-fns";

export const ConsultIdsNavigator = () => {
  return (
    <div className="flex flex-col gap-2">
      {consultNoteSessionIds.map((id) => (
        <Link href={`/session/${id}`} key={id} className="flex">
          <ExternalLinkIcon className="mr-2 h-4 w-4" />
          {id.slice(0, 5)}...{id.slice(-5)}
        </Link>
      ))}
    </div>
  );
};
