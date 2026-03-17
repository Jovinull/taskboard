import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import getDb from "@/lib/db";

interface TaskRow {
  id: string;
  user_email: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const db = getDb();

  if (req.method === "GET") {
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    return res.json(task);
  }

  if (req.method === "PUT") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as TaskRow | undefined;
    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    if (task.user_email !== session.user.email) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const { title, description, status, priority, due_date, public: isPublic } = req.body;
    const now = new Date().toISOString();

    db.prepare(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        due_date = ?,
        public = COALESCE(?, public),
        updated_at = ?
      WHERE id = ?`
    ).run(
      title?.trim() || null,
      description !== undefined ? description.trim() : null,
      status || null,
      priority || null,
      due_date !== undefined ? due_date : null,
      isPublic !== undefined ? (isPublic ? 1 : 0) : null,
      now,
      id
    );

    const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    return res.json(updated);
  }

  if (req.method === "DELETE") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as TaskRow | undefined;
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
