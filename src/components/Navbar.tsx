import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { CheckSquare, LogOut } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold tracking-tight">
            Tarefas<span className="text-red-500">+</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {status !== "loading" &&
            (session ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/tasks"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  Explorar
                </Link>
                <div className="mx-1 h-5 w-px bg-slate-800" />
                <span className="text-sm text-slate-400">{session.user?.name}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-red-400"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/tasks"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  Explorar
                </Link>
                <Link
                  href="/auth/login"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Entrar
                </Link>
              </>
            ))}
        </nav>
      </div>
    </header>
  );
}
