"use client";

interface DayData {
  day: string;
  percentage: number;
  isHighlight?: boolean;
}

interface WeeklyActivityChartProps {
  data?: DayData[];
}

export default function WeeklyActivityChart({
  data,
}: WeeklyActivityChartProps) {
  // Datos de prueba
  const chartData = data || [
    { day: "Lun", percentage: 60, isHighlight: false },
    { day: "Mar", percentage: 80, isHighlight: false },
    { day: "Mié", percentage: 95, isHighlight: true },
    { day: "Jue", percentage: 50, isHighlight: false },
    { day: "Vie", percentage: 75, isHighlight: false },
    { day: "Sáb", percentage: 30, isHighlight: false },
    { day: "Dom", percentage: 40, isHighlight: false },
  ];

  return (
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-xl">
      <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] mb-4">
        Reporte Gráfico Pacientes
      </h2>
      <div className="flex items-end h-64 space-x-4">
        {chartData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center flex-1 h-full justify-end"
          >
            <div
              className={`${
                item.isHighlight
                  ? "bg-primary"
                  : "bg-primary/20 dark:bg-primary/30"
              } w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer`}
              style={{ height: `${item.percentage}%` }}
            ></div>
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
