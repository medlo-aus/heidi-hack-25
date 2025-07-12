import { type NextApiRequest, type NextApiResponse } from "next";
import { generateText } from "ai";

import {
  consultNoteSessionIds,
  getConsultNote,
  getHeidiSession,
} from "../../server/heidi-fns";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const allSessions = await Promise.all(
    consultNoteSessionIds.map((consultNote) => getHeidiSession(consultNote)),
  ).then((sessions) => {
    return sessions;
    // return sessions.map((session) => {
    //   return session?.consult_note.result;
    // });
  });

  //   const sessionRes = await getHeidiSession(consultNotes[0]);

  //   const consultRes = await getConsultNote(consultNotes[0]).catch((err) => {
  //     console.error(err);
  //     return null;
  //   });

  const result = await generateText({
    model: "google/gemini-2.0-flash-001",
    prompt: [
      {
        role: "user",
        content: "how are you today?",
      },
    ],
  });

  res.status(200).json({ allSessions });
}
