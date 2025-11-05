"use client";

import useSWR from "swr";
import { fetcher } from "../../app/fetcher";
import { AuthActions } from "../utils";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const { data: user } = useSWR("/auth/users/me/", fetcher);

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
    <div className="bg-background-light font-display">
      <div className="relative flex h-auto min-h-screen w-full flex-row">
        <aside className="flex h-screen min-h-full flex-col bg-card-light p-4 border-r border-slate-100/50 shadow-xl w-64 sticky top-0">
          <div className="flex items-center gap-2.5 p-3 mb-5">
            <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-primary">
              <span className="material-symbols-outlined"> menu </span>
              <p className="text-text-light dark:text-text-dark text-xl font-bold leading-tight tracking-[-0.015em]">
                Menú
              </p>
            </a>
          </div>
          <div className="flex flex-col gap-2 flex-grow">
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/20 text-primary"
              href="#"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium leading-normal">Dashboard</p>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/10"
              href="#"
            >
              <span className="material-symbols-outlined">group</span>
              <p className="text-sm font-medium leading-normal">Usuarios</p>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/10"
              href="#"
            >
              <span className="material-symbols-outlined">pie_chart</span>
              <p className="text-sm font-medium leading-normal">Reportes</p>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/10"
              href="#"
            >
              <span className="material-symbols-outlined"> receipt_long </span>
              <p className="text-sm font-medium leading-normal">Facturas</p>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/10"
              href="#"
            >
              <span className="material-symbols-outlined">settings</span>
              <p className="text-sm font-medium leading-normal">
                Configuración
              </p>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/10"
              onClick={handleLogout}
            >
              <span className="material-symbols-outlined"> logout </span>
              <p className="text-sm font-medium leading-normal">
                Cerrar sesión
              </p>
            </a>
          </div>
          <div className="flex flex-col gap-4 mt-auto">
            <div className="flex gap-3 items-center">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full"
                data-alt="Avatar de Admin"
              >
                <span className="material-symbols-outlined"> person </span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
                  Admin Name
                </h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </aside>
        <main className="flex-1 p-8">
          <header className="flex items-center justify-between whitespace-nowrap mb-8">
            <div className="flex items-center gap-4 text-text-light dark:text-text-dark">
              <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em]">
                Dashboard Principal
              </h2>
            </div>
          </header>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-3 lg:col-span-2 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-lg flex items-center gap-4">
                  <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-500 rounded-full p-3">
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      Clientes Total
                    </p>
                    <p className="text-2xl font-bold text-text-light dark:text-text-dark">
                      1,250
                    </p>
                  </div>
                </div>
                <div className="bg-card-light p-4 rounded-xl shadow-lg flex items-center gap-4">
                  <div className="bg-green-100 dark:bg-green-500/20 text-green-500 rounded-full p-3">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      Recaudado Hoy
                    </p>
                    <p className="text-2xl font-bold text-text-light dark:text-text-dark">
                      $8,450
                    </p>
                  </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-lg flex items-center gap-4">
                  <div className="bg-purple-100 dark:bg-purple-500/20 text-purple-500 rounded-full p-3">
                    <span className="material-symbols-outlined">
                      {" "}
                      folder_open{" "}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      Facturas Totales
                    </p>
                    <p className="text-2xl font-bold text-text-light dark:text-text-dark">
                      5,721
                    </p>
                  </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-lg flex items-center gap-4">
                  <div className="bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-full p-3">
                    <span className="material-symbols-outlined">send</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      Por Enviar al SRI
                    </p>
                    <p className="text-2xl font-bold text-text-light dark:text-text-dark">
                      82
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-lg">
                <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] mb-4">
                  Estadísticas de Actividad Semanal
                </h2>
                <div className="flex items-end h-64 space-x-4">
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <div
                      className="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg"
                      style={{ height: "60%" }}
                    ></div>
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                      Lun
                    </span>
                  </div>
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <div
                      className="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg"
                      style={{ height: "80%" }}
                    ></div>
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                      Mar
                    </span>
                  </div>
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <div
                      className="bg-primary w-full rounded-t-lg"
                      style={{ height: "95%" }}
                    ></div>
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                      Mié
                    </span>
                  </div>
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <div
                      className="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg"
                      style={{ height: "50%" }}
                    ></div>
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                      Jue
                    </span>
                  </div>
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <div
                      className="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg"
                      style={{ height: "75%" }}
                    ></div>
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                      Vie
                    </span>
                  </div>
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <div
                      className="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg"
                      style={{ height: "30%" }}
                    ></div>
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                      Sáb
                    </span>
                  </div>
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <div
                      className="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg"
                      style={{ height: "40%" }}
                    ></div>
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                      Dom
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-3 lg:col-span-1 flex flex-col gap-6">
              <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-lg">
                <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] mb-4">
                  Tareas Pendientes
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 rounded-lg bg-background-light dark:bg-background-dark">
                    <div className="bg-primary/20 text-primary p-2 rounded-full">
                      <span className="material-symbols-outlined text-base">
                        check_circle
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-light dark:text-text-dark">
                        Aprobar solicitud de nuevo usuario
                      </p>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        Hace 15 minutos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-3 rounded-lg bg-background-light dark:bg-background-dark">
                    <div className="bg-orange-500/20 text-orange-500 p-2 rounded-full">
                      <span className="material-symbols-outlined text-base">
                        description
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-light dark:text-text-dark">
                        El reporte de ventas está listo
                      </p>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        Hace 1 hora
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-3 rounded-lg bg-background-light dark:bg-background-dark">
                    <div className="bg-green-500/20 text-green-500 p-2 rounded-full">
                      <span className="material-symbols-outlined text-base">
                        cloud_upload
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-light dark:text-text-dark">
                        Backup del sistema completado
                      </p>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        Hace 3 horas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-3 bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-lg">
              <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] mb-4">
                Horario de la Semana
              </h2>
              <div className="grid grid-cols-7 border-t border-l border-border-light  rounded-t-lg">
                <div className="text-center py-2 border-b border-border-light  text-sm">
                  Lunes
                </div>
                <div className="text-center py-2 border-b border-border-light  text-sm">
                  Martes
                </div>
                <div className="text-center py-2 border-b border-border-light  text-sm">
                  Miércoles
                </div>
                <div className="text-center py-2 border-b border-border-light  text-sm">
                  Jueves
                </div>
                <div className="text-center py-2 border-b border-border-light  text-sm">
                  Viernes
                </div>
                <div className="text-center py-2 border-b border-border-light  text-sm">
                  Sábado
                </div>
                <div className="text-center py-2 border-b border-border-light  text-sm">
                  Domingo
                </div>
                <div className="p-2 h-40 border-b border-r border-border-light dark:border-border-dark">
                  <div className="bg-green-500/20 text-green-700 dark:text-green-300 p-1.5 rounded-md text-xs">
                    Reunión equipo
                  </div>
                </div>
                <div className="p-2 h-40 border-b border-r border-border-light dark:border-border-dark"></div>
                <div className="p-2 h-40 border-b border-r border-border-light dark:border-border-dark">
                  <div className="bg-primary/20 text-primary p-1.5 rounded-md text-xs mb-1">
                    Entrevista
                  </div>
                  <div className="bg-orange-500/20 text-orange-700 dark:text-orange-300 p-1.5 rounded-md text-xs">
                    Deploy
                  </div>
                </div>
                <div className="p-2 h-40 border-b border-r border-border-light dark:border-border-dark"></div>
                <div className="p-2 h-40 border-b border-r border-border-light dark:border-border-dark">
                  <div className="bg-green-500/20 text-green-700 dark:text-green-300 p-1.5 rounded-md text-xs">
                    Sprint Planning
                  </div>
                </div>
                <div className="p-2 h-40 border-b border-r border-border-light dark:border-border-dark bg-gray-50 dark:bg-white/5"></div>
                <div className="p-2 h-40 border-b border-r border-border-light dark:border-border-dark bg-gray-50 dark:bg-white/5"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
