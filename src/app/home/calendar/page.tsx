"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import HomeLayout from "@/app/components/layout/HomeLayout";
import Schedule from "@/app/components/home/schedule/Schedule";
import AppointmentModal from "@/app/components/home/schedule/AppointmentModal";

interface BackendAppointment {
  id: number;
  uuid: string;
  title: string;
  start: string;
  end: string;
  patient_name: string;
  patient_phone: string;
  specialty: string;
  status: string;
  status_display: string;
  notes: string;
}

export default function CalendarPage() {
  const { data: userData } = useSWR("/auth/users/me/", fetcher);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener fecha de hoy
  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  }, []);

  // Obtener citas del día actual
  const { data: todayAppointments, isLoading } = useSWR<BackendAppointment[]>(
    `/api/appointments/my-calendar/?start_date=${today}&end_date=${today}`,
    fetcher,
    {
      refreshInterval: 30000, // Actualizar cada 30 segundos
    },
  );

  // Filtrar citas por búsqueda
  const filteredAppointments = useMemo(() => {
    if (!todayAppointments) return [];
    if (!searchTerm) return todayAppointments;

    const term = searchTerm.toLowerCase();
    return todayAppointments.filter(
      (apt) =>
        apt.patient_name.toLowerCase().includes(term) ||
        apt.title.toLowerCase().includes(term),
    );
  }, [todayAppointments, searchTerm]);

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
      <div className="flex flex-col gap-6 h-full">
        {/* Header */}
        <div className="flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="text-gray-900 text-2xl font-bold leading-tight">
              Calendario de Citas
            </h1>
            <p className="text-gray-600 text-sm">
              Gestiona y visualiza todas las citas programadas
            </p>
          </div>
        </div>

        {/* Layout de dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Panel lateral - Citas recientes y buscador */}
          <div className="lg:col-span-1 h-full">
            <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
              <h2 className="text-gray-900 text-lg font-bold mb-4">
                Citas de Hoy
              </h2>

              {/* Buscador */}
              <div className="mb-6 flex-shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#9098f8] focus:outline-none text-sm"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 text-xl">
                    search
                  </span>
                </div>
              </div>

              {/* Lista de citas del día */}
              <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9098f8]"></div>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                      event_busy
                    </span>
                    <p className="text-gray-500 text-sm">
                      {searchTerm
                        ? "No se encontraron citas"
                        : "No hay citas para hoy"}
                    </p>
                  </div>
                ) : (
                  filteredAppointments.map((apt) => {
                    const startTime = new Date(apt.start).toLocaleTimeString(
                      "es-ES",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    );
                    const endTime = new Date(apt.end).toLocaleTimeString(
                      "es-ES",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    );

                    const bgColor =
                      apt.status === "scheduled"
                        ? "#f59e0b"
                        : apt.status === "confirmed"
                          ? "#10b981"
                          : apt.status === "completed"
                            ? "#6b7280"
                            : "#ef4444";

                    const statusText =
                      apt.status === "scheduled"
                        ? "Programada"
                        : apt.status === "confirmed"
                          ? "Confirmada"
                          : apt.status === "completed"
                            ? "Completada"
                            : "Cancelada";

                    return (
                      <div
                        key={apt.uuid}
                        className="border border-gray-200 rounded-lg p-4 hover:border-[#9098f8] transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-gray-900 font-semibold text-sm">
                            {apt.patient_name}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: bgColor }}
                          >
                            {statusText}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              schedule
                            </span>
                            <span>
                              {startTime} - {endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              medical_services
                            </span>
                            <span>{apt.specialty}</span>
                          </div>
                          {apt.notes && (
                            <div className="flex items-start gap-1 mt-2 pt-2 border-t border-gray-100">
                              <span className="material-symbols-outlined text-base">
                                notes
                              </span>
                              <span className="line-clamp-2">{apt.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Calendario principal */}
          <div className="lg:col-span-2 h-full min-h-0">
            <Schedule key={refreshKey} user={user} onRefresh={handleRefresh} />
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
