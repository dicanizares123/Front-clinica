"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthActions } from "../../utils";

const menuItems = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
  { icon: "group", label: "Usuarios", href: "/dashboard/users" },
  { icon: "receipt_long", label: "Facturas", href: "/dashboard/invoices" },
  { icon: "settings", label: "Configuración", href: "/dashboard/settings" },
];

interface SidebarProps {
  user?: {
    username: string;
    email: string;
    role?: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, removeTokens } = AuthActions();

  const handleLogout = () => {
    logout()
      .res(() => {
        removeTokens();
        router.push("/");
      })
      .catch(() => {
        removeTokens();
        router.push("/");
      });
  };

  return (
    <aside className="flex h-screen min-h-full flex-col bg-card-light p-4 border-r border-slate-100/50 shadow-2xl w-64 sticky top-0">
      <div className="flex items-center gap-2.5 p-3 mb-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-primary cursor-pointer"
        >
          <span className="material-symbols-outlined">menu</span>
          <p className="text-text-light dark:text-text-dark text-xl font-bold leading-tight tracking-[-0.015em]">
            Menú
          </p>
        </Link>
      </div>

      <div className="flex flex-col gap-2 flex-grow">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              pathname === item.href
                ? "bg-primary/20 text-primary"
                : "text-text-secondary-light hover:bg-gray-100 dark:hover:bg-white/10"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <p className="text-sm font-medium leading-normal">{item.label}</p>
          </Link>
        ))}

        <button
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary-light hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer w-full text-left transition-colors"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined">logout</span>
          <p className="text-sm font-medium leading-normal">Cerrar sesión</p>
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        <div className="flex gap-3 items-center">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
              {user?.username || "Admin Name"}
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
              {user?.role || "Administrator"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
