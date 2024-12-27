import { GetServerSideProps } from "next";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import styles from "./styles.module.css";
import Head from "next/head";
import { getSession } from "next-auth/react";
import { Textarea } from "../../components/textarea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { db } from "@/services/firebaseConnection";
import {
    addDoc,
    collection,
    query,
    orderBy,
    where,
    onSnapshot,
    doc,
    deleteDoc,
} from "firebase/firestore";
import Link from "next/link";

interface HomeProps {
    user: {
        email: string;
    };
}

interface TaskProps {
    id: string;
    created: string;
    public: boolean;
    tarefa: string;
    user: string;
}

export default function Dashboard({ user }: HomeProps) {
    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);
    const [tasks, setTasks] = useState<TaskProps[]>([]);

    useEffect(() => {
        const tarefasRef = collection(db, "tarefas");
        const q = query(
            tarefasRef,
            orderBy("created", "desc"),
            where("user", "==", user?.email)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista: TaskProps[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as TaskProps));

            setTasks(lista);
        });

        return () => unsubscribe(); // Desinscreve para evitar vazamentos de memória.
    }, [user?.email]);

    const handleRegisterTask = async (task: FormEvent) => {
        task.preventDefault();

        if (!input.trim()) return;

        try {
            await addDoc(collection(db, "tarefas"), {
                tarefa: input.trim(),
                created: new Date().toISOString(),
                user: user?.email,
                public: publicTask,
            });
            setInput("");
            setPublicTask(false);
        } catch (err) {
            console.error("Erro ao registrar tarefa:", err);
        }
    };

    const handleShare = async (id: string) => {
        try {
            await navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_URL}/task/${id}`
            );
            alert("URL copiada com sucesso!");
        } catch (err) {
            console.error("Erro ao copiar URL:", err);
        }
    };

    const handleDeleteTask = async (id: string) => {
        try {
            await deleteDoc(doc(db, "tarefas", id));
        } catch (err) {
            console.error("Erro ao deletar tarefa:", err);
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Meu Painel de Tarefas</title>
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
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={(e) => setPublicTask(e.target.checked)}
                                />
                                <label>Deixar tarefa pública?</label>
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
                                    <label className={styles.tag}>PÚBLICO</label>
                                    <button
                                        className={styles.shareButton}
                                        onClick={() => handleShare(task.id)}
                                    >
                                        <FiShare2 size={22} color="#3183ff" />
                                    </button>
                                </div>
                            )}
                            <div className={styles.taskContent}>
                                <p>
                                    {task.public ? (
                                        <Link href={`/task/${task.id}`}>
                                            {task.tarefa}
                                        </Link>
                                    ) : (
                                        task.tarefa
                                    )}
                                </p>
                                <button
                                    className={styles.trashButton}
                                    onClick={() => handleDeleteTask(task.id)}
                                >
                                    <FaTrash size={24} color="#ea3140" />
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
