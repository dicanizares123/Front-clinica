"use client";

import { useState } from "react";

interface ScheduleEvent {
  id: number;
  day: number; // 0-6 (Lunes-Domingo)
  hour: number; // 7-23 (7am-11pm)
  title: string;
  type: "success" | "primary" | "warning";
}

interface WeeklyScheduleProps {
  events?: ScheduleEvent[];
}

const eventColors = {
  success: "bg-green-500/20 text-green-700 dark:text-green-300",
  primary: "bg-primary/20 text-primary",
  warning: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
};

export default function WeeklySchedule({ events }: WeeklyScheduleProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Datos de prueba
  const scheduleEvents = events || [
    {
      id: 1,
      day: 0,
      hour: 9,
      title: "Reunión equipo",
      type: "success" as const,
    },
    { id: 2, day: 2, hour: 10, title: "Entrevista", type: "primary" as const },
    { id: 3, day: 2, hour: 11, title: "Deploy", type: "warning" as const },
    {
      id: 4,
      day: 4,
      hour: 14,
      title: "Sprint Planning",
      type: "success" as const,
    },
  ];

  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const hours = Array.from({ length: 17 }, (_, i) => i + 7); // 7am a 11pm

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const changeWeek = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  return (
    <div className="col-span-3 bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em]">
          Horario de la Semana
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            {formatDate(selectedDate)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => changeWeek(-1)}
              className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
              aria-label="Semana anterior"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() => changeWeek(1)}
              className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
              aria-label="Semana siguiente"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-8 border-t border-l border-border-light rounded-t-lg">
            {/* Encabezado con columna de horas */}
            <div className="text-center py-3 border-b border-r border-border-light text-sm font-medium bg-background-light dark:bg-background-dark">
              Hora
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="text-center py-3 border-b border-r border-border-light text-sm font-medium bg-background-light dark:bg-background-dark"
              >
                {day}
              </div>
            ))}

            {/* Filas por cada hora */}
            {hours.map((hour) => (
              <div key={hour} className="contents">
                {/* Columna de hora */}
                <div className="text-center py-3 border-b border-r border-border-light text-sm text-text-secondary-light dark:text-text-secondary-dark bg-background-light/50 dark:bg-background-dark/50 font-medium">
                  {hour}:00
                </div>

                {/* Celdas para cada día */}
                {days.map((_, dayIndex) => {
                  const dayEvents = scheduleEvents.filter(
                    (event) => event.day === dayIndex && event.hour === hour
                  );

                  return (
                    <div
                      key={`${hour}-${dayIndex}`}
                      className="p-2 border-b border-r border-border-light dark:border-border-dark min-h-[70px] relative hover:bg-background-light/50 dark:hover:bg-background-dark/50 transition-colors cursor-pointer"
                    >
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`${
                            eventColors[event.type]
                          } p-2 rounded-md text-xs mb-1 font-medium`}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
