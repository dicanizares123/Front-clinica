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

// Componente de Leyenda (Renderizado al lado derecho del gráfico)
const ChartLegend = ({
  data,
  total,
}: {
  data: StatusData[];
  total: number;
}) => {
  return (
    <div className="flex flex-col gap-4">
      {data.map((entry, index) => {
        const percentage =
          total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0";
        return (
          <div key={`legend-${index}`} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 shadow-md"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-base font-medium text-gray-700 whitespace-nowrap">
              {entry.name} [{percentage}%]
            </span>
          </div>
        );
      })}
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
      <div className="bg-white p-6 rounded-xl shadow-sm h-full flex items-center justify-center min-h-[400px] border border-gray-200">
        <div className="animate-pulse text-gray-600">
          {isLoading ? "Cargando datos..." : "Cargando gráfica..."}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 h-full flex flex-col min-h-[400px]">
      <div className="w-full flex justify-start mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          Dashboard Estado de Citas En Los Ultimos 6 Meses
        </h3>
      </div>

      <div className="w-full flex-1 flex items-center justify-center gap-16 min-h-0">
        {/* Contenedor del Gráfico */}
        <div className="relative h-full max-h-[500px] aspect-square">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                labelLine={false}
                outerRadius="85%"
                innerRadius={0}
                paddingAngle={0}
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

        {/* Leyenda al lado derecho */}
        <ChartLegend data={chartData} total={total} />
      </div>
    </div>
  );
}
