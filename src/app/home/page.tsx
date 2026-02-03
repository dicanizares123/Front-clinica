"use client";

import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "../../app/fetcher";
import HomeLayout from "../components/layout/HomeLayout";
import Header from "../components/layout/Header";
import StatsGrid from "../components/home/stats/StatsGrid";
import PendingTask from "../components/home/task/PendingTask";
import AppointmentStatusChart from "../components/home/charts/AppointmentStatusChart";

export default function Home() {
  const { data: userData } = useSWR("/auth/users/me/", fetcher);
  const [showNotifications, setShowNotifications] = useState(false);

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

  return (
    <HomeLayout user={user}>
      <Header
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        notificationPanel={
          showNotifications ? <PendingTask maxHeight="600px" /> : null
        }
      />

      <div className="flex flex-col gap-6 h-full flex-1">
        {/* Row 1: Stats */}
        <div>
          <h2 className="text-text-primary text-xl font-semibold mb-4">
            Acciones Rápidas
          </h2>
          <StatsGrid />
        </div>

        {/* Row 2: Appointment Status Chart */}
        <div className="flex-1 min-h-0">
          <AppointmentStatusChart />
        </div>
      </div>

      {/* Backdrop to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </HomeLayout>
  );
}
