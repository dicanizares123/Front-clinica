"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import HomeLayout from "@/app/components/layout/HomeLayout";
import Schedule from "@/app/components/home/schedule/Schedule";
import AppointmentModal from "@/app/components/home/schedule/AppointmentModal";

export default function CalendarPage() {
  const { data: userData } = useSWR("/auth/users/me/", fetcher);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  // Forzar refresh del Schedule
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

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
        </div>

        {/* Calendario a pantalla completa */}
        <Schedule key={refreshKey} user={user} onRefresh={handleRefresh} />
      </div>
    </HomeLayout>
  );
}
