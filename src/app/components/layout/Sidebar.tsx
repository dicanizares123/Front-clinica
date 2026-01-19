"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AuthActions } from "../../utils";

const menuItems = [
  { icon: "home", label: "Inicio", href: "/home" },
  { icon: "calendar_today", label: "Calendario", href: "/home/calendar" },
  { icon: "group", label: "Pacientes", href: "/home/patients" },
  { icon: "receipt_long", label: "Facturas", href: "/home/invoices" },
];

interface SidebarProps {
  user?: {
    username: string;
    email: string;
    role?: string;
    uuid?: string;
    first_names?: string;
    last_names?: string;
    permissions?: any;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, removeTokens } = AuthActions();
  const [isCollapsed, setIsCollapsed] = useState(true);

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
    <aside
      className={`flex h-screen min-h-full flex-col bg-surface-dark border-r border-[#323a46] shadow-xl sticky top-0 transition-all duration-200 ease-in-out p-4 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`flex items-center p-3 mb-5 ${
          isCollapsed ? "justify-center" : "gap-2.5"
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-white cursor-pointer hover:bg-primary-light transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <span className="material-symbols-outlined">menu</span>
          {!isCollapsed && (
            <p className="text-white text-xl font-bold leading-tight tracking-[-0.015em] whitespace-nowrap">
              Menú
            </p>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2 flex-grow">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isCollapsed ? "justify-center" : ""
            } ${
              pathname === item.href
                ? "bg-primary-light text-white"
                : "text-gray-300 hover:bg-primary-light hover:text-white"
            }`}
            title={isCollapsed ? item.label : ""}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {!isCollapsed && (
              <p className="text-sm font-medium leading-normal whitespace-nowrap">
                {item.label}
              </p>
            )}
          </Link>
        ))}

        <button
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-primary-light hover:text-white cursor-pointer w-full transition-colors ${
            isCollapsed ? "justify-center" : "text-left"
          }`}
          onClick={handleLogout}
          title={isCollapsed ? "Cerrar sesión" : ""}
        >
          <span className="material-symbols-outlined">logout</span>
          {!isCollapsed && (
            <p className="text-sm font-medium leading-normal whitespace-nowrap">
              Cerrar sesión
            </p>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex flex-col gap-4 mt-auto">
          <div className="flex gap-3 items-center">
            <div className="bg-primary-light rounded-full p-2">
              <span className="material-symbols-outlined text-white">
                person
              </span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-medium leading-normal">
                {user?.first_names} {user?.last_names}
              </h1>
              <p className="text-gray-300 text-sm font-normal leading-normal mt-1">
                {user?.role || "Administrador "}
              </p>
              <p className="text-gray-300 text-sm font-normal leading-normal mt-1">
                {user?.email || "admin@example.com"}
              </p>
            </div>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="flex flex-col gap-4 mt-auto">
          <div className="flex justify-center">
            <div className="bg-primary-light rounded-full p-2">
              <span className="material-symbols-outlined text-white">
                person
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
