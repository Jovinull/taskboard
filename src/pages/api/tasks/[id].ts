import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import getDb from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    const db = getDb();
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    return res.json(task);
  }

  if (req.method === "DELETE") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const db = getDb();
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
      | { user_email: string }
      | undefined;

    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    if (task.user_email !== session.user.email) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    return res.json({ message: "Tarefa deletada" });
  }

  return res.status(405).json({ error: "Método não permitido" });
}
