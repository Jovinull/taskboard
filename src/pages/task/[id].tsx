import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { db } from "@/services/firebaseConnection";
import {
  doc,
  collection,
  query,
  where,
  getDoc,
  addDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { Textarea } from "@/components/textarea";
import { FaTrash } from "react-icons/fa";
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
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input.trim(),
        created: new Date(),
        user: session.user.email,
        name: session.user.name,
        taskId: item.taskId,
      });

      setComments((prev) => [
        ...prev,
        {
          id: docRef.id,
          comment: input.trim(),
          user: session.user!.email!,
          name: session.user!.name!,
          taskId: item.taskId,
        },
      ]);
      setInput("");
    } catch (err) {
      console.error("Erro ao adicionar comentario:", err);
    }
  }

  async function handleDeleteComment(id: string) {
    try {
      await deleteDoc(doc(db, "comments", id));
      setComments((prev) => prev.filter((c) => c.id !== id));
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
  const docRef = doc(db, "tarefas", id);

  const [snapshot, snapshotComments] = await Promise.all([
    getDoc(docRef),
    getDocs(query(collection(db, "comments"), where("taskId", "==", id))),
  ]);

  if (!snapshot.exists() || !snapshot.data()?.public) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const data = snapshot.data();
  const miliseconds = data?.created?.seconds * 1000;

  const allComments: Comment[] = snapshotComments.docs.map((doc) => ({
    id: doc.id,
    comment: doc.data().comment,
    user: doc.data().user,
    name: doc.data().name,
    taskId: doc.data().taskId,
  }));

  return {
    props: {
      item: {
        tarefa: data?.tarefa,
        public: data?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: data?.user,
        taskId: id,
      },
      allComments,
    },
  };
};
