"use client";

interface Task {
  id: number;
  title: string;
  time: string;
  icon: string;
  color: "blue" | "orange" | "green";
}

interface PendingTaskProps {
  tasks?: Task[];
}

const colorClasses = {
  blue: "bg-primary/20 text-primary",
  orange: "bg-orange-500/20 text-orange-500",
  green: "bg-green-500/20 text-green-500",
};

export default function PendingTask({ tasks }: PendingTaskProps) {
  // Datos de prueba
  const pendingTasks = tasks || [
    {
      id: 1,
      title: "Notificación 1 - 10:00 AM",
      time: "Hace 15 minutos",
      icon: "check_circle",
      color: "blue" as const,
    },
    {
      id: 2,
      title: "Notificación 2 - 11:00 AM",
      time: "Hace 1 hora",
      icon: "description",
      color: "orange" as const,
    },
    {
      id: 3,
      title: "Notificación 3 - 12:00 PM",
      time: "Hace 3 horas",
      icon: "cloud_upload",
      color: "green" as const,
    },
    {
      id: 4,
      title: "Notificación 4 - 01:00 PM",
      time: "Hace 3 horas",
      icon: "document_scanner",
      color: "green" as const,
    },
    {
      id: 5,
      title: "Notificación 4 - 01:00 PM",
      time: "Hace 3 horas",
      icon: "document_scanner",
      color: "green" as const,
    },
    {
      id: 6,
      title: "Notificación 4 - 01:00 PM",
      time: "Hace 3 horas",
      icon: "document_scanner",
      color: "green" as const,
    },
  ];

  return (
    <div className="bg-card-light p-6 rounded-xl shadow-2xl">
      <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] mb-4">
        Actividades Pendientes
      </h2>
      <div className="space-y-4">
        {pendingTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-4 p-3 rounded-lg bg-background-light dark:bg-background-dark  transition-shadow cursor-pointer"
          >
            <div className={`${colorClasses[task.color]} p-2 rounded-full`}>
              <span className="material-symbols-outlined text-base">
                {task.icon}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-light dark:text-text-dark">
                {task.title}
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {task.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
