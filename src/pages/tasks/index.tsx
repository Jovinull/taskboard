import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Globe, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import getDb from "@/lib/db";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  user_name: string;
  comment_count: number;
}

interface Props {
  tasks: Task[];
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-slate-400 bg-slate-400/10",
  medium: "text-blue-400 bg-blue-400/10",
  high: "text-amber-400 bg-amber-400/10",
  urgent: "text-red-400 bg-red-400/10",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

const STATUS_LABELS: Record<string, string> = {
  todo: "A fazer",
  in_progress: "Em progresso",
  review: "Revisão",
  done: "Concluída",
};

export default function PublicTasks({ tasks }: Props) {
  return (
    <>
      <Head>
        <title>Tarefas Públicas | Tarefas+</title>
      </Head>
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-sm text-slate-300">
            <Globe className="h-4 w-4 text-blue-400" />
            Tarefas Públicas
          </div>
          <h1 className="text-3xl font-bold">Explorar tarefas</h1>
          <p className="mt-2 text-slate-400">
            Veja tarefas compartilhadas pela comunidade e deixe seus comentários.
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-20 text-center">
            <Globe className="mx-auto mb-3 h-10 w-10 text-slate-600" />
            <p className="text-slate-400">Nenhuma tarefa pública ainda.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/task/${task.id}`}
                className="group rounded-xl border border-slate-800 bg-slate-900 p-5 transition-all hover:border-slate-700 hover:bg-slate-800/50"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium
                    }`}
                  >
                    {PRIORITY_LABELS[task.priority] || "Média"}
                  </span>
                  <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                    {STATUS_LABELS[task.status] || "A fazer"}
                  </span>
                </div>

                <h3 className="mb-1 font-semibold group-hover:text-blue-400">
                  {task.title}
                </h3>

                {task.description && (
                  <p className="mb-3 text-sm text-slate-500 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>por {task.user_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {task.comment_count}
                    </span>
                    <span>
                      {new Date(task.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const db = getDb();

  const tasks = db
    .prepare(
      `SELECT t.*, u.name as user_name,
        (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) as comment_count
       FROM tasks t
       JOIN users u ON t.user_email = u.email
       WHERE t.public = 1
       ORDER BY t.created_at DESC`
    )
    .all() as Task[];

  return {
    props: {
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description || "",
        status: t.status,
        priority: t.priority,
        created_at: t.created_at,
        user_name: t.user_name,
        comment_count: t.comment_count,
      })),
    },
  };
};
