import { GetServerSideProps } from "next";
import { ChangeEvent, FormEvent, useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { Textarea } from "@/components/textarea";
import styles from "./styles.module.css";

interface DashboardProps {
  user: {
    email: string;
  };
}

interface Task {
  id: string;
  created: string;
  public: boolean;
  tarefa: string;
  user: string;
}

export default function Dashboard({ user }: DashboardProps) {
  const [input, setInput] = useState("");
  const [publicTask, setPublicTask] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = useCallback(async () => {
    const res = await fetch(`/api/tasks?email=${encodeURIComponent(user.email)}`);
    const data = await res.json();
    setTasks(
      data.map((t: { id: string; tarefa: string; created: string; user_email: string; public: number }) => ({
        id: t.id,
        tarefa: t.tarefa,
        created: t.created,
        user: t.user_email,
        public: !!t.public,
      }))
    );
  }, [user.email]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleRegisterTask(e: FormEvent) {
    e.preventDefault();

    if (!input.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tarefa: input.trim(),
          public: publicTask,
        }),
      });

      if (res.ok) {
        setInput("");
        setPublicTask(false);
        loadTasks();
      }
    } catch (err) {
      console.error("Erro ao registrar tarefa:", err);
    }
  }

  async function handleShare(id: string) {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_URL}/task/${id}`
      );
      alert("URL copiada com sucesso!");
    } catch (err) {
      console.error("Erro ao copiar URL:", err);
    }
  }

  async function handleDeleteTask(id: string) {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Erro ao deletar tarefa:", err);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu Painel | Tarefas+</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual sua tarefa?</h1>
            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder="Digite sua tarefa..."
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(e.target.value)
                }
              />
              <div className={styles.checkboxArea}>
                <input
                  type="checkbox"
                  id="publicTask"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={(e) => setPublicTask(e.target.checked)}
                />
                <label htmlFor="publicTask">Deixar tarefa publica?</label>
              </div>
              <button className={styles.button} type="submit">
                Registrar
              </button>
            </form>
          </div>
        </section>

        <section className={styles.taskContainer}>
          <h1>Minhas Tarefas</h1>
          {tasks.map((task) => (
            <article key={task.id} className={styles.task}>
              {task.public && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>Publica</label>
                  <button
                    className={styles.shareButton}
                    onClick={() => handleShare(task.id)}
                    title="Copiar link"
                  >
                    <FiShare2 size={20} color="#3b82f6" />
                  </button>
                </div>
              )}
              <div className={styles.taskContent}>
                <p>
                  {task.public ? (
                    <Link href={`/task/${task.id}`}>{task.tarefa}</Link>
                  ) : (
                    task.tarefa
                  )}
                </p>
                <button
                  className={styles.trashButton}
                  onClick={() => handleDeleteTask(task.id)}
                  title="Deletar tarefa"
                >
                  <FaTrash size={20} color="#ef4444" />
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: { email: session.user.email },
    },
  };
};
