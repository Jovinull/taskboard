import styles from "./styles.module.css";
import Head from "next/head";

export default function Dashboard() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Meu painel de Tarefas</title>
            </Head>

            <h1>Pagina Painel</h1>
        </div>
    );
}