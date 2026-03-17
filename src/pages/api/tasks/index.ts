import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import getDb, { generateId } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const db = getDb();
    const { email, status, priority, search } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório" });
    }

    let sql = "SELECT * FROM tasks WHERE user_email = ?";
    const params: (string | number)[] = [email as string];

    if (status && status !== "all") {
      sql += " AND status = ?";
      params.push(status as string);
    }

    if (priority && priority !== "all") {
      sql += " AND priority = ?";
      params.push(priority as string);
    }

    if (search) {
      sql += " AND (title LIKE ? OR description LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term);
    }

    sql += " ORDER BY created_at DESC";
    const tasks = db.prepare(sql).all(...params);
    return res.json(tasks);
  }

  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const { title, description, status, priority, due_date, public: isPublic } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Título é obrigatório" });
    }

    const db = getDb();
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO tasks (id, title, description, status, priority, public, due_date, user_email, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      title.trim(),
      (description || "").trim(),
      status || "todo",
      priority || "medium",
      isPublic ? 1 : 0,
      due_date || null,
      session.user.email,
      now,
      now
    );

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    return res.status(201).json(task);
  }

  return res.status(405).json({ error: "Método não permitido" });
}
