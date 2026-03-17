import styles from "./styles.module.css";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className={styles.header}>
      <section className={styles.content}>
        <nav className={styles.nav}>
          <Link href="/">
            <h1 className={styles.logo}>
              Tarefas<span>+</span>
            </h1>
          </Link>
          {session?.user && (
            <Link href="/dashboard" className={styles.link}>
              Meu Painel
            </Link>
          )}
        </nav>
        {status !== "loading" && (
          session ? (
            <button className={styles.loginButton} onClick={() => signOut()}>
              {session.user?.name}
            </button>
          ) : (
            <Link href="/auth/login" className={styles.loginButton}>
              Entrar
            </Link>
          )
        )}
      </section>
    </header>
  );
}
