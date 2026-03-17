import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import getDb, { generateId } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const taskId = req.query.taskId as string;
    if (!taskId) {
      return res.status(400).json({ error: "taskId é obrigatório" });
    }

    const db = getDb();
    const comments = db
      .prepare("SELECT * FROM comments WHERE task_id = ? ORDER BY created_at DESC")
      .all(taskId);
    return res.json(comments);
  }

  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email || !session?.user?.name) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const { content, taskId } = req.body;
    if (!content?.trim() || !taskId) {
      return res.status(400).json({ error: "Conteúdo e taskId são obrigatórios" });
    }

    const db = getDb();
    const id = generateId();

    db.prepare(
      "INSERT INTO comments (id, content, task_id, user_email, user_name) VALUES (?, ?, ?, ?, ?)"
    ).run(id, content.trim(), taskId, session.user.email, session.user.name);

    return res.status(201).json({
      id,
      content: content.trim(),
      user_email: session.user.email,
      user_name: session.user.name,
      task_id: taskId,
    });
  }

  return res.status(405).json({ error: "Método não permitido" });
}
