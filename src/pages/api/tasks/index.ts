import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import getDb, { generateId } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === "GET") {
    const db = getDb();
    const email = req.query.email as string;

    if (email) {
      const tasks = db
        .prepare(
          "SELECT * FROM tasks WHERE user_email = ? ORDER BY created DESC"
        )
        .all(email);
      return res.json(tasks);
    }

    return res.status(400).json({ error: "Email é obrigatório" });
  }

  if (req.method === "POST") {
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const { tarefa, public: isPublic } = req.body;
    if (!tarefa?.trim()) {
      return res.status(400).json({ error: "Tarefa é obrigatória" });
    }

    const db = getDb();
    const id = generateId();
    const created = new Date().toISOString();

    db.prepare(
      "INSERT INTO tasks (id, tarefa, created, user_email, public) VALUES (?, ?, ?, ?, ?)"
    ).run(id, tarefa.trim(), created, session.user.email, isPublic ? 1 : 0);

    return res.status(201).json({
      id,
      tarefa: tarefa.trim(),
      created,
      user: session.user.email,
      public: !!isPublic,
    });
  }

  return res.status(405).json({ error: "Método não permitido" });
}
