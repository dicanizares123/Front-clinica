"use client";

import useSWR from "swr";
import { fetcher } from "../../app/fetcher";
import DashboardLayout from "../components/layout/DashboardLayout";
import Header from "../components/layout/Header";
import StatsGrid from "../components/dashboard/stats/StatsGrid";
import WeeklyActivityChart from "../components/dashboard/charts/WeeklyActivityChart";
import PendingTask from "../components/dashboard/task/PendingTask";
import WeeklySchedule from "../components/dashboard/schedule/WeeklySchedule";
import { useState } from "react";
export default function Home() {
  const { data: user } = useSWR("/auth/users/me/", fetcher);
  const [showCalendarTip, setShowCalendarTip] = useState(true);

  // Llamadas SWR para datos dinámicos (descomentarlas cuando los endpoints estén disponibles)
  // const { data: stats } = useSWR("/api/dashboard/stats", fetcher);
  // const { data: chartData } = useSWR("/api/dashboard/chart", fetcher);
  // const { data: tasks } = useSWR("/api/dashboard/tasks", fetcher);
  // const { data: schedule } = useSWR("/api/dashboard/schedule", fetcher);

  return (
    <DashboardLayout user={user}>
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
        title="Dashboard y Actividades Principales"
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

        {/* Horario semanal - ancho completo */}
        <WeeklySchedule />
      </div>
    </DashboardLayout>
  );
}
