"use client";

import useSWR from "swr";
import { fetcher } from "../../app/fetcher";
import HomeLayout from "../components/layout/HomeLayout";
import Header from "../components/layout/Header";
import StatsGrid from "../components/home/stats/StatsGrid";
import WeeklyActivityChart from "../components/home/charts/WeeklyActivityChart";
import PendingTask from "../components/home/task/PendingTask";
import { useState } from "react";
export default function Home() {
  const { data: userData } = useSWR("/auth/users/me/", fetcher);
  const [showCalendarTip, setShowCalendarTip] = useState(true);

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
      {showCalendarTip && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Si los botones del calendario no responden,
            recarga la página (F5)
          </p>
          <button
            onClick={() => setShowCalendarTip(false)}
            className="text-blue-700 hover:text-blue-900"
          >
            ✕
          </button>
        </div>
      )}
      <Header
        title="Inicio y Actividades Principales"
        subtitle="Vista general de tu sistema"
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Sección principal */}
        <div className="col-span-3 lg:col-span-2 flex flex-col gap-6">
          {/* Stats Grid */}
          <StatsGrid />

          {/* Chart */}
          <WeeklyActivityChart />
        </div>

        {/* Sidebar derecho */}
        <div className="col-span-3 lg:col-span-1 flex flex-col gap-6">
          <PendingTask />
        </div>
      </div>
    </HomeLayout>
  );
}
