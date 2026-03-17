import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import getDb from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const db = getDb();
  const email = session.user.email;

  const total = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_email = ?").get(email) as { c: number };
  const todo = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_email = ? AND status = 'todo'").get(email) as { c: number };
  const inProgress = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_email = ? AND status = 'in_progress'").get(email) as { c: number };
  const review = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_email = ? AND status = 'review'").get(email) as { c: number };
  const done = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_email = ? AND status = 'done'").get(email) as { c: number };
  const overdue = db.prepare(
    "SELECT COUNT(*) as c FROM tasks WHERE user_email = ? AND due_date < datetime('now') AND status != 'done'"
  ).get(email) as { c: number };

  return res.json({
    total: total.c,
    todo: todo.c,
    inProgress: inProgress.c,
    review: review.c,
    done: done.c,
    overdue: overdue.c,
  });
}
