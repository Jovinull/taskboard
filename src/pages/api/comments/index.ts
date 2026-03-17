import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import getDb, { generateId } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const taskId = req.query.taskId as string;
    if (!taskId) {
      return res.status(400).json({ error: "taskId é obrigatório" });
    }

    const db = getDb();
    const comments = db
      .prepare("SELECT * FROM comments WHERE task_id = ? ORDER BY created DESC")
      .all(taskId);
    return res.json(comments);
  }

  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email || !session?.user?.name) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const { comment, taskId } = req.body;
    if (!comment?.trim() || !taskId) {
      return res
        .status(400)
        .json({ error: "Comentário e taskId são obrigatórios" });
    }

    const db = getDb();
    const id = generateId();
    const created = new Date().toISOString();

    db.prepare(
      "INSERT INTO comments (id, comment, created, user_email, user_name, task_id) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(id, comment.trim(), created, session.user.email, session.user.name, taskId);

    return res.status(201).json({
      id,
      comment: comment.trim(),
      user: session.user.email,
      name: session.user.name,
      taskId,
    });
  }

  return res.status(405).json({ error: "Método não permitido" });
}
