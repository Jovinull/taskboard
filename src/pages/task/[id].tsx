import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trash2,
  Send,
  Pencil,
} from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import getDb from "@/lib/db";

interface TaskData {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  public: number;
  due_date: string | null;
  user_email: string;
  user_name: string;
  created_at: string;
}

interface CommentData {
  id: string;
  content: string;
  task_id: string;
  user_email: string;
  user_name: string;
  created_at: string;
}

interface Props {
  task: TaskData;
  comments: CommentData[];
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  todo: { label: "A fazer", color: "text-slate-400 bg-slate-400/10" },
  in_progress: { label: "Em progresso", color: "text-blue-400 bg-blue-400/10" },
  review: { label: "Revisão", color: "text-purple-400 bg-purple-400/10" },
  done: { label: "Concluída", color: "text-emerald-400 bg-emerald-400/10" },
};

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: "Baixa", color: "text-slate-400 bg-slate-400/10" },
  medium: { label: "Média", color: "text-blue-400 bg-blue-400/10" },
  high: { label: "Alta", color: "text-amber-400 bg-amber-400/10" },
  urgent: { label: "Urgente", color: "text-red-400 bg-red-400/10" },
};

export default function TaskDetail({ task, comments: initialComments }: Props) {
  const { data: session } = useSession();
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [editing, setEditing] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editStatus, setEditStatus] = useState(task.status);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.due_date || "");
  const [taskData, setTaskData] = useState(task);

  const isOwner = session?.user?.email === taskData.user_email;
  const st = STATUS_MAP[taskData.status] || STATUS_MAP.todo;
  const pr = PRIORITY_MAP[taskData.priority] || PRIORITY_MAP.medium;

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    if (!commentInput.trim() || !session?.user) return;

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentInput.trim(), taskId: taskData.id }),
    });

    if (res.ok) {
      const data = await res.json();
      setComments((prev) => [data, ...prev]);
      setCommentInput("");
      toast.success("Comentário adicionado");
    }
  }

  async function handleDeleteComment(id: string) {
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success("Comentário removido");
    }
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/tasks/${taskData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDesc,
        status: editStatus,
        priority: editPriority,
        due_date: editDueDate || null,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setTaskData({ ...taskData, ...updated });
      setEditing(false);
      toast.success("Tarefa atualizada");
    }
  }

  return (
    <>
      <Head>
        <title>{taskData.title} | Tarefas+</title>
      </Head>
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/tasks"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        {/* Task card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          {editing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-lg font-semibold text-white outline-none focus:border-blue-500"
              />
              <textarea
                value={editDesc}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditDesc(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="todo">A fazer</option>
                  <option value="in_progress">Em progresso</option>
                  <option value="review">Revisão</option>
                  <option value="done">Concluída</option>
                </select>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-slate-700 px-5 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={clsx("rounded-full px-2.5 py-1 text-xs font-medium", st.color)}>
                    {st.label}
                  </span>
                  <span className={clsx("rounded-full px-2.5 py-1 text-xs font-medium", pr.color)}>
                    {pr.label}
                  </span>
                </div>
                {isOwner && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800"
                  >
                    <Pencil className="h-3 w-3" />
                    Editar
                  </button>
                )}
              </div>

              <h1 className="mb-2 text-2xl font-bold">{taskData.title}</h1>

              {taskData.description && (
                <p className="mb-4 whitespace-pre-wrap text-slate-400">
                  {taskData.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Criada em {new Date(taskData.created_at).toLocaleDateString("pt-BR")}
                </span>
                {taskData.due_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Prazo: {new Date(taskData.due_date).toLocaleDateString("pt-BR")}
                  </span>
                )}
                <span>por {taskData.user_name}</span>
              </div>
            </>
          )}
        </div>

        {/* Comments */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">
            Comentários ({comments.length})
          </h2>

          {session?.user ? (
            <form onSubmit={handleComment} className="mb-6 flex gap-3">
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Escreva um comentário..."
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <div className="mb-6 rounded-lg border border-slate-800 bg-slate-900 p-4 text-center text-sm text-slate-400">
              <Link href="/auth/login" className="text-blue-400 hover:underline">
                Faça login
              </Link>{" "}
              para comentar
            </div>
          )}

          {comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-slate-800 bg-slate-900 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                        {comment.user_name}
                      </span>
                      <span className="text-xs text-slate-600">
                        {new Date(comment.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {comment.user_email === session?.user?.email && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="rounded p-1 text-slate-600 transition-colors hover:text-red-400"
                        title="Remover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-slate-300">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const db = getDb();

  const task = db
    .prepare(
      `SELECT t.*, u.name as user_name
       FROM tasks t
       JOIN users u ON t.user_email = u.email
       WHERE t.id = ?`
    )
    .get(id) as (TaskData & { public: number }) | undefined;

  if (!task || !task.public) {
    return { redirect: { destination: "/", permanent: false } };
  }

  const comments = db
    .prepare("SELECT * FROM comments WHERE task_id = ? ORDER BY created_at DESC")
    .all(id) as CommentData[];

  return {
    props: {
      task: {
        id: task.id,
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        public: task.public,
        due_date: task.due_date || null,
        user_email: task.user_email,
        user_name: task.user_name,
        created_at: task.created_at,
      },
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        task_id: c.task_id,
        user_email: c.user_email,
        user_name: c.user_name,
        created_at: c.created_at,
      })),
    },
  };
};
