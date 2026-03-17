import { GetServerSideProps } from "next";
import { useState, useEffect, useCallback, FormEvent } from "react";
import Head from "next/head";
import Link from "next/link";
import { getSession } from "next-auth/react";
import {
  Plus,
  Trash2,
  ExternalLink,
  Search,
  ListTodo,
  Clock,
  Eye,
  CheckCircle,
  AlertTriangle,
  ChevronUp,
  Calendar,
} from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";

interface DashboardProps {
  user: { email: string };
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  public: number;
  due_date: string | null;
  user_email: string;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  overdue: number;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof ListTodo }> = {
  todo: { label: "A fazer", color: "text-slate-400 bg-slate-400/10", icon: ListTodo },
  in_progress: { label: "Em progresso", color: "text-blue-400 bg-blue-400/10", icon: Clock },
  review: { label: "Revisão", color: "text-purple-400 bg-purple-400/10", icon: Eye },
  done: { label: "Concluída", color: "text-emerald-400 bg-emerald-400/10", icon: CheckCircle },
};

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: "Baixa", color: "text-slate-400 bg-slate-400/10" },
  medium: { label: "Média", color: "text-blue-400 bg-blue-400/10" },
  high: { label: "Alta", color: "text-amber-400 bg-amber-400/10" },
  urgent: { label: "Urgente", color: "text-red-400 bg-red-400/10" },
};

export default function Dashboard({ user }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, todo: 0, inProgress: 0, review: 0, done: 0, overdue: 0 });
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [search, setSearch] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const loadTasks = useCallback(async () => {
    const params = new URLSearchParams({ email: user.email });
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterPriority !== "all") params.set("priority", filterPriority);
    if (search) params.set("search", search);

    const res = await fetch(`/api/tasks?${params}`);
    const data = await res.json();
    setTasks(data);
  }, [user.email, filterStatus, filterPriority, search]);

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/tasks/stats");
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadStats();
  }, [loadTasks, loadStats]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description,
        priority,
        due_date: dueDate || null,
        public: isPublic,
      }),
    });

    if (res.ok) {
      toast.success("Tarefa criada!");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setIsPublic(false);
      setShowForm(false);
      loadTasks();
      loadStats();
    } else {
      toast.error("Erro ao criar tarefa");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Tarefa deletada");
      setTasks((prev) => prev.filter((t) => t.id !== id));
      loadStats();
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
      loadStats();
    }
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/task/${id}`);
    toast.success("Link copiado!");
  }

  return (
    <DashboardLayout title="Dashboard">
      <Head>
        <title>Dashboard | Tarefas+</title>
      </Head>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-blue-500/20 bg-blue-400/10 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-400/10 p-2">
              <ListTodo className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-500/20 bg-slate-400/10 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-400/10 p-2">
              <ListTodo className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.todo}</p>
              <p className="text-xs text-slate-400">A fazer</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-400/10 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-400/10 p-2">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
              <p className="text-xs text-slate-400">Em progresso</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-400/10 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-400/10 p-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.done}</p>
              <p className="text-xs text-slate-400">Concluídas</p>
            </div>
          </div>
        </div>
      </div>

      {stats.overdue > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4" />
          {stats.overdue} tarefa(s) com prazo vencido
        </div>
      )}

      {/* New task section */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {showForm ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          Nova tarefa
        </button>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Título *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Nome da tarefa"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detalhes da tarefa (opcional)"
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Prazo
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 sm:col-span-2">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-blue-500"
                />
                <label htmlFor="isPublic" className="text-sm text-slate-300">
                  Tornar tarefa pública
                </label>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Criar tarefa
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tarefas..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
        >
          <option value="all">Todos status</option>
          <option value="todo">A fazer</option>
          <option value="in_progress">Em progresso</option>
          <option value="review">Revisão</option>
          <option value="done">Concluída</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
        >
          <option value="all">Todas prioridades</option>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
      </div>

      {/* Task list */}
      <div className="rounded-xl border border-slate-800 bg-slate-900">
        {tasks.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ListTodo className="mx-auto mb-3 h-10 w-10 text-slate-600" />
            <p className="text-sm text-slate-400">Nenhuma tarefa encontrada</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {tasks.map((task) => {
              const st = STATUS_MAP[task.status] || STATUS_MAP.todo;
              const pr = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
              const isOverdue =
                task.due_date &&
                new Date(task.due_date) < new Date() &&
                task.status !== "done";

              return (
                <div
                  key={task.id}
                  className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-800/50"
                >
                  {/* Status select */}
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={clsx(
                      "mt-0.5 rounded-md border-0 px-2 py-1 text-xs font-medium outline-none",
                      st.color
                    )}
                  >
                    <option value="todo">A fazer</option>
                    <option value="in_progress">Em progresso</option>
                    <option value="review">Revisão</option>
                    <option value="done">Concluída</option>
                  </select>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {task.public ? (
                        <Link
                          href={`/task/${task.id}`}
                          className={clsx(
                            "font-medium hover:text-blue-400",
                            task.status === "done" && "text-slate-500 line-through"
                          )}
                        >
                          {task.title}
                        </Link>
                      ) : (
                        <span
                          className={clsx(
                            "font-medium",
                            task.status === "done" && "text-slate-500 line-through"
                          )}
                        >
                          {task.title}
                        </span>
                      )}
                      {task.public === 1 && (
                        <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                          Pública
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className={clsx("rounded-full px-2 py-0.5 font-medium", pr.color)}>
                        {pr.label}
                      </span>
                      {task.due_date && (
                        <span
                          className={clsx(
                            "flex items-center gap-1",
                            isOverdue ? "text-red-400" : "text-slate-500"
                          )}
                        >
                          <Calendar className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {task.public === 1 && (
                      <button
                        onClick={() => handleShare(task.id)}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-700 hover:text-blue-400"
                        title="Copiar link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-700 hover:text-red-400"
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });
  if (!session?.user) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: { user: { email: session.user.email } } };
};
