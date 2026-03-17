import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Globe,
  LogOut,
  Menu,
  X,
  CheckSquare,
} from "lucide-react";
import clsx from "clsx";

interface Props {
  children: React.ReactNode;
  title: string;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Explorar", href: "/tasks", icon: Globe },
];

export default function DashboardLayout({ children, title }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-200 lg:static",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <Link href="/" className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-500" />
            <span className="text-lg font-bold">
              Tarefas<span className="text-red-500">+</span>
            </span>
          </Link>
          <button
            className="text-slate-400 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const active = router.pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{session?.user?.name}</p>
              <p className="truncate text-xs text-slate-500">{session?.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-lg">
          <button
            className="text-slate-400 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
