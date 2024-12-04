import { GetServerSideProps } from "next";
import styles from "./styles.module.css";
import Head from "next/head";
import { getSession } from "next-auth/react";

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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req })

    if (!session?.user) {
        // Se não tem usuario vamos redirecionar para /
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    return {
        props: {}
    }
}