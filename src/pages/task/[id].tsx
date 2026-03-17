import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { Textarea } from "@/components/textarea";
import { FaTrash } from "react-icons/fa";
import getDb from "@/lib/db";
import styles from "./styles.module.css";

interface TaskDetailProps {
  item: {
    tarefa: string;
    created: string;
    public: boolean;
    user: string;
    taskId: string;
  };
  allComments: Comment[];
}

interface Comment {
  id: string;
  comment: string;
  taskId: string;
  user: string;
  name: string;
}

export default function Task({ item, allComments }: TaskDetailProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [comments, setComments] = useState<Comment[]>(allComments || []);

  async function handleComment(e: FormEvent) {
    e.preventDefault();

    if (!input.trim()) return;
    if (!session?.user?.email || !session?.user?.name) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: input.trim(),
          taskId: item.taskId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [
          ...prev,
          {
            id: data.id,
            comment: data.comment,
            user: data.user,
            name: data.name,
            taskId: data.taskId,
          },
        ]);
        setInput("");
      }
    } catch (err) {
      console.error("Erro ao adicionar comentario:", err);
    }
  }

  async function handleDeleteComment(id: string) {
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Erro ao deletar comentario:", err);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Detalhes da tarefa | Tarefas+</title>
      </Head>

      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>{item.tarefa}</p>
        </article>
      </main>

      <section className={styles.commentsContainer}>
        <h2>Deixar comentario</h2>
        <form onSubmit={handleComment}>
          <Textarea
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
            placeholder="Digite seu comentario..."
          />
          <button
            disabled={!session?.user}
            className={styles.button}
            type="submit"
          >
            Enviar comentario
          </button>
        </form>
      </section>

      <section className={styles.commentsContainer}>
        <h2>Todos os comentarios</h2>
        {comments.length === 0 && (
          <span>Nenhum comentario ainda.</span>
        )}

        {comments.map((comment) => (
          <article key={comment.id} className={styles.comment}>
            <div className={styles.headComment}>
              <label className={styles.commentsLabel}>{comment.name}</label>
              {comment.user === session?.user?.email && (
                <button
                  className={styles.buttonTrash}
                  onClick={() => handleDeleteComment(comment.id)}
                  title="Deletar comentario"
                >
                  <FaTrash size={16} color="#ef4444" />
                </button>
              )}
            </div>
            <p>{comment.comment}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const db = getDb();

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    | { tarefa: string; created: string; public: number; user_email: string }
    | undefined;

  if (!task || !task.public) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const rawComments = db
    .prepare("SELECT * FROM comments WHERE task_id = ? ORDER BY created DESC")
    .all(id) as {
    id: string;
    comment: string;
    user_email: string;
    user_name: string;
    task_id: string;
  }[];

  const allComments: Comment[] = rawComments.map((c) => ({
    id: c.id,
    comment: c.comment,
    user: c.user_email,
    name: c.user_name,
    taskId: c.task_id,
  }));

  return {
    props: {
      item: {
        tarefa: task.tarefa,
        public: !!task.public,
        created: new Date(task.created).toLocaleDateString(),
        user: task.user_email,
        taskId: id,
      },
      allComments,
    },
  };
};
