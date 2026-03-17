import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import getDb from "@/lib/db";
import styles from "./styles.module.css";

interface Task {
  id: string;
  tarefa: string;
  created: string;
  user_name: string;
}

interface TasksProps {
  tasks: Task[];
}

export default function Tasks({ tasks }: TasksProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas Publicas | Tarefas+</title>
      </Head>

      <main className={styles.main}>
        <h1>Tarefas Publicas</h1>

        {tasks.length === 0 && (
          <p className={styles.empty}>Nenhuma tarefa publica ainda.</p>
        )}

        {tasks.map((task) => (
          <Link key={task.id} href={`/task/${task.id}`} className={styles.taskLink}>
            <article className={styles.task}>
              <p className={styles.taskText}>{task.tarefa}</p>
              <div className={styles.taskMeta}>
                <span>{task.user_name}</span>
                <span>{new Date(task.created).toLocaleDateString()}</span>
              </div>
            </article>
          </Link>
        ))}
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const db = getDb();

  const tasks = db
    .prepare(
      `SELECT t.id, t.tarefa, t.created, u.name as user_name
       FROM tasks t
       JOIN users u ON t.user_email = u.email
       WHERE t.public = 1
       ORDER BY t.created DESC`
    )
    .all() as Task[];

  return {
    props: {
      tasks: tasks.map((t) => ({
        id: t.id,
        tarefa: t.tarefa,
        created: t.created,
        user_name: t.user_name,
      })),
    },
  };
};
