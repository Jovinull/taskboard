import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  CheckSquare,
  ListTodo,
  MessageSquare,
  Shield,
  Zap,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import getDb from "@/lib/db";

interface HomeProps {
  posts: number;
  comments: number;
}

export default function Home({ posts, comments }: HomeProps) {
  return (
    <>
      <Head>
        <title>Tarefas+ | Gerencie suas tarefas com eficiência</title>
      </Head>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-sm text-slate-300">
            <CheckSquare className="h-4 w-4 text-blue-400" />
            Plataforma de gestão de tarefas
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Gerencie suas tarefas com{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              eficiência
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Organize, priorize e acompanhe suas tarefas de forma profissional.
            Defina status, prioridades e prazos para manter tudo sob controle.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/register"
              className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40"
            >
              Começar agora
            </Link>
            <Link
              href="/tasks"
              className="rounded-lg border border-slate-700 px-8 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800"
            >
              Ver tarefas públicas
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-slate-800 px-6">
          <div className="flex flex-col items-center gap-1 py-10">
            <div className="flex items-center gap-2 text-3xl font-bold text-white">
              <ListTodo className="h-7 w-7 text-blue-400" />
              {posts}
            </div>
            <span className="text-sm text-slate-400">Tarefas criadas</span>
          </div>
          <div className="flex flex-col items-center gap-1 py-10">
            <div className="flex items-center gap-2 text-3xl font-bold text-white">
              <MessageSquare className="h-7 w-7 text-emerald-400" />
              {comments}
            </div>
            <span className="text-sm text-slate-400">Comentários</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h2 className="mb-4 text-center text-3xl font-bold">
          Tudo que você precisa
        </h2>
        <p className="mx-auto mb-16 max-w-xl text-center text-slate-400">
          Ferramentas profissionais para gerenciar suas tarefas do início ao fim.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: ListTodo,
              title: "Organize",
              desc: "Crie tarefas com título, descrição, prioridade e prazo. Mantenha tudo estruturado.",
              iconClass: "text-blue-400",
              bgClass: "bg-blue-500/10",
            },
            {
              icon: Zap,
              title: "Acompanhe",
              desc: "Defina status (A fazer, Em progresso, Revisão, Concluído) e acompanhe o progresso.",
              iconClass: "text-amber-400",
              bgClass: "bg-amber-500/10",
            },
            {
              icon: Users,
              title: "Colabore",
              desc: "Compartilhe tarefas publicamente e receba comentários da comunidade.",
              iconClass: "text-emerald-400",
              bgClass: "bg-emerald-500/10",
            },
            {
              icon: Shield,
              title: "Priorize",
              desc: "Classifique por urgência (Baixa, Média, Alta, Urgente) para focar no que importa.",
              iconClass: "text-red-400",
              bgClass: "bg-red-500/10",
            },
            {
              icon: CheckSquare,
              title: "Sem dependências",
              desc: "Funciona 100% local. Sem necessidade de serviços externos ou contas em nuvem.",
              iconClass: "text-purple-400",
              bgClass: "bg-purple-500/10",
            },
            {
              icon: MessageSquare,
              title: "Comentários",
              desc: "Adicione comentários em tarefas públicas para trocar ideias e dar feedback.",
              iconClass: "text-cyan-400",
              bgClass: "bg-cyan-500/10",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-colors hover:border-slate-700"
            >
              <div className={`mb-4 inline-flex rounded-lg p-2.5 ${feature.bgClass}`}>
                <feature.icon className={`h-5 w-5 ${feature.iconClass}`} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="mb-4 text-3xl font-bold">Pronto para começar?</h2>
          <p className="mb-8 text-slate-400">
            Crie sua conta gratuitamente e comece a organizar suas tarefas agora.
          </p>
          <Link
            href="/auth/register"
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700"
          >
            Criar conta grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        <p>Tarefas+ &mdash; 100% local, sem dependências externas.</p>
      </footer>
    </>
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
