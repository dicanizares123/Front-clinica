"use client";

import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-custom.css";
import { useState, useCallback } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/fetcher";

// Configurar moment en español
moment.locale("es");
const localizer = momentLocalizer(moment);

interface AppointmentEvent extends Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: "consultation" | "therapy" | "emergency";
  patient?: string;
  doctor?: string;
}

interface WeeklyScheduleProps {
  events?: AppointmentEvent[];
}

export default function WeeklySchedule({ events }: WeeklyScheduleProps) {
  // Integración con backend - descomenta cuando esté listo
  // const { data: backendAppointments, mutate } = useSWR('/api/appointments', fetcher);

  // Datos de prueba mientras no hay backend
  const [appointments] = useState<AppointmentEvent[]>(
    events || [
      {
        id: 1,
        title: "Consulta - Juan Pérez",
        start: new Date(2025, 10, 10, 9, 0),
        end: new Date(2025, 10, 10, 10, 0),
        type: "consultation",
        patient: "Juan Pérez",
        doctor: "Dr. García",
      },
      {
        id: 2,
        title: "Terapia Grupal",
        start: new Date(2025, 10, 11, 14, 0),
        end: new Date(2025, 10, 11, 16, 0),
        type: "therapy",
        doctor: "Dra. Martínez",
      },
      {
        id: 3,
        title: "Emergencia - María López",
        start: new Date(2025, 10, 12, 11, 0),
        end: new Date(2025, 10, 12, 12, 0),
        type: "emergency",
        patient: "María López",
        doctor: "Dr. Rodríguez",
      },
      {
        id: 4,
        title: "Consulta - Carlos Ruiz",
        start: new Date(2025, 10, 13, 16, 0),
        end: new Date(2025, 10, 13, 17, 0),
        type: "consultation",
        patient: "Carlos Ruiz",
        doctor: "Dr. García",
      },
      {
        id: 5,
        title: "Terapia Individual - Ana Silva",
        start: new Date(2025, 10, 14, 10, 0),
        end: new Date(2025, 10, 14, 11, 30),
        type: "therapy",
        patient: "Ana Silva",
        doctor: "Dra. Martínez",
      },
    ]
  );

  // Estilos personalizados por tipo de evento
  const eventStyleGetter = (event: AppointmentEvent) => {
    const colors = {
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
    };

    return {
      style: {
        ...colors[event.type],
        color: "white",
        borderRadius: "4px",
        padding: "4px 8px",
        fontSize: "13px",
      },
    };
  };

  // Handler para crear nueva cita (al seleccionar un slot)
  const handleSelectSlot = useCallback(
    async (slotInfo: { start: Date; end: Date; action: string }) => {
      console.log("handleSelectSlot llamado", slotInfo);
      const title = prompt("Ingrese el título de la cita:");
      if (!title) return;

      const newAppointment = {
        title,
        start: slotInfo.start.toISOString(),
        end: slotInfo.end.toISOString(),
        type: "consultation",
        patient: "Paciente nuevo",
        doctor: "Por asignar",
      };

      console.log("Nueva cita a crear:", newAppointment);

      // Cuando tengas el backend listo, descomenta esto:
      /*
    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment),
      });
      
      // Revalidar datos
      mutate();
      
      alert('Cita creada exitosamente');
    } catch (error) {
      console.error('Error al crear cita:', error);
      alert('Error al crear la cita');
    }
    */

      alert(
        `Cita creada (modo prueba):\n\n${title}\n${slotInfo.start.toLocaleString()} - ${slotInfo.end.toLocaleString()}\n\nCuando el backend esté listo, esto se guardará en la base de datos.`
      );
    },
    []
  );

  // Handler para ver/editar cita existente
  const handleSelectEvent = useCallback((event: AppointmentEvent) => {
    console.log("Evento seleccionado:", event);

    const details = `
Cita: ${event.title}
Paciente: ${event.patient || "N/A"}
Doctor: ${event.doctor || "N/A"}
Tipo: ${event.type}
Inicio: ${event.start.toLocaleString()}
Fin: ${event.end.toLocaleString()}
    `.trim();

    alert(details);

    // Cuando tengas el backend listo, aquí puedes abrir un modal
    // para editar o eliminar la cita
  }, []);

  return (
    <div className="col-span-3 bg-white p-6 rounded-xl shadow-2xl">
      <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-4">
        Horario de la Semana
      </h2>

      <div style={{ height: "700px" }}>
        <Calendar
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          // Configuración de vista
          defaultView="week"
          views={["month", "week", "day", "agenda"]}
          // Horario de trabajo
          min={new Date(0, 0, 0, 7, 0)} // 7am
          max={new Date(0, 0, 0, 23, 0)} // 11pm
          // Paso de tiempo en minutos
          step={30}
          timeslots={2}
          // Interactividad
          selectable
          onSelectSlot={handleSelectSlot}
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
                culture
              )} - ${localizer?.format(end, "HH:mm", culture)}`,
            agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
              `${localizer?.format(
                start,
                "HH:mm",
                culture
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

      {/* Leyenda */}
      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Consulta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Terapia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Emergencia</span>
        </div>
      </div>
    </div>
  );
}
