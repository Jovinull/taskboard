import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import getDb from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const { id } = req.query;
  const db = getDb();

  const comment = db.prepare("SELECT * FROM comments WHERE id = ?").get(id) as
    | { user_email: string }
    | undefined;

  if (!comment) {
    return res.status(404).json({ error: "Comentário não encontrado" });
  }

  if (comment.user_email !== session.user.email) {
    return res.status(403).json({ error: "Sem permissão" });
  }

  db.prepare("DELETE FROM comments WHERE id = ?").run(id);
  return res.json({ message: "Comentário deletado" });
}
