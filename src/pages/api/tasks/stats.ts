import type { NextApiRequest, NextApiResponse } from "next";
import getDb from "@/lib/db";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const posts = db.prepare("SELECT COUNT(*) as count FROM tasks").get() as {
    count: number;
  };
  const comments = db
    .prepare("SELECT COUNT(*) as count FROM comments")
    .get() as { count: number };

  return res.json({
    posts: posts.count,
    comments: comments.count,
  });
}
