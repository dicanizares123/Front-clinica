"use client";

import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import HomeLayout from "@/app/components/layout/HomeLayout";
import WeeklySchedule from "@/app/components/home/schedule/WeeklySchedule";

export default function CalendarPage() {
  const { data: userData } = useSWR("/auth/users/me/", fetcher);

  // Extraer solo las propiedades necesarias del usuario
  const user = userData
    ? {
        username: userData.username || "Usuario",
        email: userData.email || "",
        role: userData.role_name || "Usuario",
        uuid: userData.uuid || "",
        first_names: userData.first_names || "",
        last_names: userData.last_names || "",
        permissions: userData.role || {},
      }
    : undefined;

  return (
    <HomeLayout user={user}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-text-light dark:text-text-dark text-2xl font-bold leading-tight">
              Calendario de Citas
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Gestiona y visualiza todas las citas programadas
            </p>
          </div>

          {/* Botón para crear nueva cita */}
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined">add</span>
            Nueva Cita
          </button>
        </div>

        {/* Calendario a pantalla completa */}
        <WeeklySchedule />
      </div>
    </HomeLayout>
  );
}
