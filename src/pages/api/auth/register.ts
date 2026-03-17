import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import getDb from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
  }

  const db = getDb();

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "Este email já está cadastrado" });
  }

  const hash = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(
    name,
    email,
    hash
  );

  return res.status(201).json({ message: "Usuário criado com sucesso" });
}
