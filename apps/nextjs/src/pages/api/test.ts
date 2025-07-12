import { type NextApiRequest, type NextApiResponse } from "next";

import { getHeidiSession } from "../../server/heidi-fns";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const consultNotes = [
    "109809741668977226983209560304378806042",
    "145724014565595129429559506201071574120",
    "13492367013098732992868300977265587593",
    "11901873742259810244555103576895445913",
  ];

  const session = await getHeidiSession(consultNotes[1]);

  res.status(200).json(session);
}
