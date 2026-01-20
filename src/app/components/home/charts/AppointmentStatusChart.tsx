"use client";

import { useState, useEffect } from "react";
import useSWR from "swr"; // Importamos SWR
import { fetcher } from "@/app/fetcher"; // Importamos el fetcher configurado
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface StatusData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface AppointmentStatusChartProps {
  data?: StatusData[];
}

// Interfaz para las props del Tooltip personalizado
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  total: number;
}

// 1. MOVEMOS EL COMPONENTE FUERA para evitar recreación en cada render
const CustomTooltip = ({ active, payload, total }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as StatusData;
    const percentage =
      total > 0 ? ((data.value / total) * 100).toFixed(1) : "0";

    return (
      <div
        className="bg-white dark:bg-surface-dark p-3 rounded-md shadow-xl border-2"
        style={{ borderColor: data.color }} // Borde del color de la rebanada
      >
        <p className="text-sm font-bold mb-1 text-gray-800 dark:text-white">
          {data.name}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {data.value}
          </span>
          <span className="text-sm text-gray-500 font-medium">
            ({percentage}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Componente de Leyenda (Renderizado manualmente fuera del gráfico para mejor control de espacio)
const ChartLegend = ({
  data,
  total,
}: {
  data: StatusData[];
  total: number;
}) => {
  return (
    <div className="flex flex-col gap-3 mt-8 w-full max-w-[300px] mx-auto">
      {data.map((entry, index) => (
        <div
          key={`legend-${index}`}
          className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-white/5 px-2 rounded transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark truncate max-w-[120px]">
              {entry.name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-[35px] text-right">
              {total > 0
                ? `${((entry.value / total) * 100).toFixed(0)}%`
                : "0%"}
            </span>
            <span className="text-sm font-bold text-text-primary dark:text-white font-mono min-w-[25px] text-right">
              {entry.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AppointmentStatusChart({
  data,
}: AppointmentStatusChartProps) {
  const [mounted, setMounted] = useState(false);

  // Integración con Backend usando SWR
  // La URL '/api/appointments/chart-data/' se concatenará a la base URL en fetcher.ts
  const { data: backendData, isLoading } = useSWR(
    "/api/appointments/chart-data/",
    fetcher,
  );

  console.log("Backend Data:", backendData);

  // 2. CORRECCIÓN DEL USEEFFECT: Usamos setTimeout para evitar "Cascading Render"
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Prioridad: 1. Props (data) -> 2. Backend (backendData) -> 3. Mock/Vacio
  const chartData: StatusData[] = data || backendData || [];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (!mounted || isLoading) {
    return (
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-xl h-full flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-text-secondary-light">
          {isLoading ? "Cargando datos..." : "Cargando gráfica..."}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-dark rounded-md shadow p-6 border border-[#323a46] h-full flex flex-col items-center">
      <div className="w-full flex justify-start mb-2">
        <h3 className="text-base font-semibold text-text-primary">
          Dashboard Estado de Citas En Los Ultimos 6
        </h3>
      </div>

      <div className="w-full flex-1 flex flex-col items-center">
        {/* Contenedor del Gráfico */}
        <div className="relative w-full h-[300px] flex-shrink-0">
          {/* Eliminado el texto central 'Total' para gráfica sólida */}

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                labelLine={false}
                outerRadius={140} // Radio más grande para aprovechar espacio
                innerRadius={0} // 0 para hacerla sólida (Pie Chart)
                paddingAngle={0} // Sin separación para look sólido clásico
                dataKey="value"
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-out"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={total} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Lista de Leyenda Externa Centrada */}
        <ChartLegend data={chartData} total={total} />
      </div>
    </div>
  );
}
