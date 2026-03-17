import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import heroImg from "../../public/assets/hero.png";
import getDb from "../lib/db";

interface HomeProps {
  posts: number;
  comments: number;
}

export default function Home({ posts, comments }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma facil</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo Tarefas+"
            src={heroImg}
            priority
          />
        </div>

        <h1 className={styles.title}>
          Sistema feito para voce organizar{" "}
          seus estudos e tarefas
        </h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+{posts} posts</span>
          </section>
          <section className={styles.box}>
            <span>+{comments} comentarios</span>
          </section>
        </div>

        <Link href="/tasks" className={styles.publicLink}>
          Ver tarefas publicas
        </Link>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const db = getDb();

  const posts = db.prepare("SELECT COUNT(*) as count FROM tasks").get() as {
    count: number;
  };
  const comments = db
    .prepare("SELECT COUNT(*) as count FROM comments")
    .get() as { count: number };

  return {
    props: {
      posts: posts.count || 0,
      comments: comments.count || 0,
    },
    revalidate: 60,
  };
};
