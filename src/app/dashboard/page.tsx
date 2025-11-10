"use client";

import useSWR from "swr";
import { fetcher } from "../../app/fetcher";
import DashboardLayout from "../components/layout/DashboardLayout";
import Header from "../components/layout/Header";
import StatsGrid from "../components/dashboard/stats/StatsGrid";
import WeeklyActivityChart from "../components/dashboard/charts/WeeklyActivityChart";
import PendingTask from "../components/dashboard/task/PendingTask";
import WeeklySchedule from "../components/dashboard/schedule/WeeklySchedule";

export default function Home() {
  const { data: user } = useSWR("/auth/users/me/", fetcher);

  // Aquí puedes hacer más llamadas SWR para obtener datos
  // const { data: stats } = useSWR("/api/dashboard/stats", fetcher);
  // const { data: chartData } = useSWR("/api/dashboard/chart", fetcher);
  // const { data: tasks } = useSWR("/api/dashboard/tasks", fetcher);
  // const { data: schedule } = useSWR("/api/dashboard/schedule", fetcher);

  return (
    <DashboardLayout user={user}>
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
