"use client";

import useSWR from "swr";
import { fetcher } from "../../app/fetcher";
import HomeLayout from "../components/layout/HomeLayout";
import Header from "../components/layout/Header";
import StatsGrid from "../components/home/stats/StatsGrid";
import PendingTask from "../components/home/task/PendingTask";
import AppointmentStatusChart from "../components/home/charts/AppointmentStatusChart";
export default function Home() {
  const { data: userData } = useSWR("/auth/users/me/", fetcher);

  // Debug: ver qué está retornando el backend
  console.log("User data from backend:", userData);

  // Extraer solo las propiedades necesarias
  const user = userData
    ? {
        username: userData.username || "Usuario",
        email: userData.email || "",
        role: userData.role_name || "Usuario", // ← Usar role_name
        uuid: userData.uuid || "",
        first_names: userData.first_names || "",
        last_names: userData.last_names || "",
        // Permisos del rol (para uso futuro)
        permissions: userData.role || {},
      }
    : undefined;

  // Llamadas SWR para datos dinámicos (descomentarlas cuando los endpoints estén disponibles)
  // const { data: stats } = useSWR("/api/home/stats", fetcher);
  // const { data: chartData } = useSWR("/api/home/chart", fetcher);
  // const { data: tasks } = useSWR("/api/home/tasks", fetcher);
  // const { data: schedule } = useSWR("/api/home/schedule", fetcher);

  return (
    <HomeLayout user={user}>
      <Header
        title="Inicio y Actividades Principales"
        subtitle="Vista general de tu sistema"
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Sección principal */}
        <div className="col-span-3 lg:col-span-2 flex flex-col gap-6">
          {/* Stats Grid */}
          <StatsGrid />

          {/* Chart de pastel - Estado de citas */}
          <AppointmentStatusChart />
        </div>

        {/* Sidebar derecho */}
        <div className="col-span-3 lg:col-span-1 flex flex-col gap-6">
          <PendingTask maxHeight="500px" />
        </div>
      </div>
    </HomeLayout>
  );
}
