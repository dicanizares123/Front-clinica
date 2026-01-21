"use client";

import { Calendar, momentLocalizer, Event, View } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-custom.css";
import { useState, useCallback, useMemo, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import AppointmentModal from "./AppointmentModal";
import AppointmentDetailModal from "./AppointmentDetailModal";

// Configurar moment en español
moment.locale("es");
const localizer = momentLocalizer(moment);

interface AppointmentEvent extends Event {
  id: string;
  numericId?: number; // ID numérico para los endpoints
  title: string;
  start: Date;
  end: Date;
  type:
    | "consultation"
    | "therapy"
    | "emergency"
    | "scheduled"
    | "confirmed"
    | "completed"
    | "cancelled";
  patient?: string;
  doctor?: string;
  status?: string;
  notes?: string;
  patient_phone?: string;
}

// Interfaz para la respuesta del backend
interface BackendAppointment {
  id: number;
  uuid: string;
  title: string;
  start: string; // ISO format: "2025-11-20T11:00:00"
  end: string; // ISO format: "2025-11-20T12:00:00"
  patient_id: number;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  specialty: string;
  status: string;
  status_display: string;
  color: string;
  duration_minutes: number;
  notes: string;
}

interface ScheduleProps {
  events?: AppointmentEvent[];
  user?: {
    role?: string;
    permissions?: {
      is_admin?: boolean;
    };
  };
  onRefresh?: () => void;
}

export default function Schedule({ events, user, onRefresh }: ScheduleProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("week");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce para la búsqueda (espera 500ms después de que el usuario deje de escribir)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Estados para los modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentEvent | null>(null);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<{
    date?: Date;
    time?: string;
  }>({});

  // Calcular el rango de fechas según la vista actual
  const { start_date, end_date } = useMemo(() => {
    const startDate = moment(currentDate);
    const endDate = moment(currentDate);

    switch (currentView) {
      case "month":
        startDate.startOf("month");
        endDate.endOf("month");
        break;
      case "week":
        startDate.startOf("week");
        endDate.endOf("week");
        break;
      case "day":
        startDate.startOf("day");
        endDate.endOf("day");
        break;
      case "agenda":
        startDate.startOf("day");
        endDate.add(30, "days");
        break;
      default:
        startDate.startOf("week");
        endDate.endOf("week");
    }

    return {
      start_date: startDate.format("YYYY-MM-DD"),
      end_date: endDate.format("YYYY-MM-DD"),
    };
  }, [currentDate, currentView]);

  // 🚀 Usar SWR para fetch con cache automático y token incluido
  const {
    data: backendData,
    error,
    isLoading,
    mutate,
  } = useSWR<BackendAppointment[]>(
    debouncedSearchTerm
      ? `/api/appointments/my-calendar/?search=${encodeURIComponent(debouncedSearchTerm)}`
      : `/api/appointments/my-calendar/?start_date=${start_date}&end_date=${end_date}`,
    fetcher,
    {
      revalidateOnFocus: false, // No revalidar al enfocar la ventana
      dedupingInterval: 30000, // Deduplicar requests por 30 segundos
    },
  );

  // Transformar las citas del backend al formato del calendario
  const appointments = useMemo((): AppointmentEvent[] => {
    if (!backendData || !Array.isArray(backendData)) return events || [];

    return backendData.map((apt) => {
      const startDate = new Date(apt.start);
      const endDate = new Date(apt.end);

      const statusTypeMap: Record<string, AppointmentEvent["type"]> = {
        scheduled: "scheduled",
        confirmed: "confirmed",
        completed: "completed",
        cancelled: "cancelled",
        emergency: "emergency",
      };

      return {
        id: apt.uuid,
        numericId: apt.id, // ID numérico para los endpoints
        title: apt.title,
        start: startDate,
        end: endDate,
        type: statusTypeMap[apt.status] || "scheduled",
        patient: apt.patient_name,
        doctor: apt.specialty,
        status: apt.status,
        notes: apt.notes,
        patient_phone: apt.patient_phone,
      };
    });
  }, [backendData, events]);

  // Handler para navegación del calendario
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  // Handler para cambio de vista
  const handleViewChange = useCallback((newView: View) => {
    setCurrentView(newView);
  }, []);

  // Estilos personalizados por tipo de evento/estado
  const eventStyleGetter = (event: AppointmentEvent) => {
    const colors: Record<
      string,
      { backgroundColor: string; borderLeft: string }
    > = {
      consultation: {
        backgroundColor: "#10b981",
        borderLeft: "4px solid #059669",
      },
      therapy: {
        backgroundColor: "#3b82f6",
        borderLeft: "4px solid #2563eb",
      },
      emergency: {
        backgroundColor: "#ef4444",
        borderLeft: "4px solid #dc2626",
      },
      scheduled: {
        backgroundColor: "#f59e0b",
        borderLeft: "4px solid #d97706",
      },
      confirmed: {
        backgroundColor: "#10b981",
        borderLeft: "4px solid #059669",
      },
      completed: {
        backgroundColor: "#6b7280",
        borderLeft: "4px solid #4b5563",
      },
      cancelled: {
        backgroundColor: "#ef4444",
        borderLeft: "4px solid #dc2626",
      },
    };

    return {
      style: {
        ...(colors[event.type] || colors.consultation),
        color: "white",
        borderRadius: "4px",
        padding: "4px 8px",
        fontSize: "13px",
      },
    };
  };

  // Handler para crear nueva cita (al seleccionar un slot)
  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; action: string }) => {
      // Abrir modal de crear cita con la fecha y hora seleccionadas
      setSelectedSlotInfo({
        date: slotInfo.start,
        time: slotInfo.start.toTimeString().slice(0, 5),
      });
      setIsCreateModalOpen(true);
    },
    [],
  );

  // Handler para ver/editar cita existente
  const handleSelectEvent = useCallback((event: AppointmentEvent) => {
    setSelectedAppointment(event);
    setIsDetailModalOpen(true);
  }, []);

  // Callback cuando se crea o actualiza una cita exitosamente
  const handleAppointmentSuccess = useCallback(() => {
    mutate(); // Refrescar datos del calendario con SWR
    onRefresh?.(); // Llamar callback externo si existe
  }, [mutate, onRefresh]);

  // Mostrar estado de carga
  if (isLoading && appointments.length === 0) {
    return (
      <div className="col-span-3 bg-surface-dark p-6 rounded-xl shadow-lg border border-[#323a46]">
        <h2 className="text-text-primary text-lg font-bold mb-4">
          Horario de la Semana
        </h2>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-text-secondary">Cargando citas...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    const errorMessage = error.message || "Error al cargar las citas";
    return (
      <div className="col-span-3 bg-surface-dark p-6 rounded-xl shadow-lg border border-[#323a46]">
        <h2 className="text-text-primary text-lg font-bold mb-4">
          Horario de la Semana
        </h2>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="material-symbols-outlined text-5xl text-red-500">
              error
            </span>
            <p className="text-red-500">{errorMessage}</p>
            <button
              onClick={() => mutate()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-3 bg-surface-dark p-6 rounded-xl shadow-lg border border-[#323a46]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-text-primary text-lg font-bold">
          Horario de la Semana
        </h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Actualizando...
          </div>
        )}
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, apellido o cédula..."
              className="w-full px-4 py-2 pl-10 bg-background-dark border border-[#323a46] rounded-lg text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary">
              search
            </span>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 bg-background-dark border border-[#323a46] rounded-lg text-text-secondary hover:text-text-primary hover:bg-[#323a46] transition-colors"
              title="Limpiar búsqueda"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Vista de resultados de búsqueda */}
      {debouncedSearchTerm ? (
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <span className="material-symbols-outlined text-5xl mb-2">
                search_off
              </span>
              <p>
                No se encontraron citas con &ldquo;{debouncedSearchTerm}&rdquo;
              </p>
            </div>
          ) : (
            <>
              <p className="text-text-secondary text-sm mb-4">
                {appointments.length} cita(s) encontrada(s)
              </p>
              {/* Vista tipo Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appointments.map((apt) => {
                  const bgColor =
                    apt.type === "scheduled"
                      ? "#f59e0b"
                      : apt.type === "confirmed"
                        ? "#10b981"
                        : apt.type === "completed"
                          ? "#6b7280"
                          : "#ef4444";

                  const statusText =
                    apt.type === "scheduled"
                      ? "Programada"
                      : apt.type === "confirmed"
                        ? "Confirmada"
                        : apt.type === "completed"
                          ? "Completada"
                          : "Cancelada";

                  return (
                    <div
                      key={apt.id}
                      onClick={() => handleSelectEvent(apt)}
                      className="bg-surface-dark border border-[#323a46] rounded-lg p-5 cursor-pointer hover:border-primary transition-colors"
                    >
                      {/* Encabezado con icono y estado */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-3xl">
                            event
                          </span>
                          <div>
                            <h3 className="text-text-primary font-semibold text-base">
                              {apt.title}
                            </h3>
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white mt-1"
                              style={{ backgroundColor: bgColor }}
                            >
                              {statusText}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Información de la cita */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <span className="material-symbols-outlined text-base">
                            person
                          </span>
                          <span>{apt.patient}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <span className="material-symbols-outlined text-base">
                            calendar_today
                          </span>
                          <span>
                            {apt.start.toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <span className="material-symbols-outlined text-base">
                            schedule
                          </span>
                          <span>
                            {apt.start.toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {" - "}
                            {apt.end.toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Calendario */}
          <div style={{ height: "700px" }}>
            <Calendar
              localizer={localizer}
              events={appointments}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              // Configuración de vista
              defaultView="week"
              view={currentView}
              date={currentDate}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              views={["month", "week", "day"]}
              // Horario de trabajo
              min={new Date(0, 0, 0, 7, 0)} // 7am
              max={new Date(0, 0, 0, 23, 0)} // 11pm
              // Paso de tiempo en minutos
              step={30}
              timeslots={2}
              // Interactividad
              selectable={false}
              onSelectEvent={handleSelectEvent}
              // Estilos personalizados
              eventPropGetter={eventStyleGetter}
              // Formato de fecha/hora
              formats={{
                timeGutterFormat: "HH:mm",
                eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                  `${localizer?.format(
                    start,
                    "HH:mm",
                    culture,
                  )} - ${localizer?.format(end, "HH:mm", culture)}`,
                agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
                  `${localizer?.format(
                    start,
                    "HH:mm",
                    culture,
                  )} - ${localizer?.format(end, "HH:mm", culture)}`,
              }}
              // Mensajes en español
              messages={{
                next: "Siguiente",
                previous: "Anterior",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
                date: "Fecha",
                time: "Hora",
                event: "Evento",
                noEventsInRange: "No hay eventos en este rango",
                showMore: (total) => `+ Ver más (${total})`,
              }}
            />
          </div>
        </>
      )}

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Programada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Completada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Cancelada</span>
        </div>
      </div>

      {/* Información de citas */}
      <div className="mt-2 text-sm text-gray-500">
        {appointments.length === 0 ? (
          <p>No hay citas programadas para este período.</p>
        ) : (
          <p>{appointments.length} cita(s) encontrada(s)</p>
        )}
      </div>

      {/* Modal para crear nueva cita */}
      <AppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedSlotInfo({});
        }}
        onSuccess={handleAppointmentSuccess}
        selectedDate={selectedSlotInfo.date}
        selectedTime={selectedSlotInfo.time}
      />

      {/* Modal para ver/editar cita */}
      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSuccess={handleAppointmentSuccess}
        appointment={selectedAppointment}
        user={user}
      />
    </div>
  );
}
