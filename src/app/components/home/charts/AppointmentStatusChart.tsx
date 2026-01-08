"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface StatusData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

interface AppointmentStatusChartProps {
  data?: StatusData[];
}

// Colores para cada estado de cita
const STATUS_CONFIG = {
  confirmada: { label: "Confirmadas", color: "#22c55e" },
  pendiente: { label: "Pendientes", color: "#f59e0b" },
  cancelada: { label: "Canceladas", color: "#ef4444" },
  completada: { label: "Completadas", color: "#3b82f6" },
  no_asistio: { label: "No asistió", color: "#6b7280" },
};

export default function AppointmentStatusChart({
  data,
}: AppointmentStatusChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Integración con backend - descomenta cuando esté listo
  // const { data: backendData, error, isLoading } = useSWR('/api/appointments/status-stats', fetcher);

  // Datos de prueba
  const generateMockData = (): StatusData[] => {
    return [
      { name: "Confirmadas", value: 45, color: "#22c55e" },
      { name: "Pendientes", value: 23, color: "#f59e0b" },
      { name: "Canceladas", value: 8, color: "#ef4444" },
      { name: "Completadas", value: 67, color: "#3b82f6" },
      { name: "No asistió", value: 5, color: "#6b7280" },
    ];
  };

  const chartData = mounted ? data || generateMockData() : [];
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold" style={{ color: data.color }}>
            {data.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {data.value} citas ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Label personalizado dentro del pie
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null; // No mostrar label si es menor al 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Legend personalizada
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (!mounted) {
    return (
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-xl h-96 flex items-center justify-center">
        <div className="animate-pulse text-text-secondary-light">
          Cargando gráfica...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em]">
            Estado de Citas
          </h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
            Distribución por estado del mes actual
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{total}</p>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Total de citas
          </p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="bg-background-light dark:bg-background-dark p-2 rounded-lg text-center"
          >
            <p className="text-lg font-bold" style={{ color: item.color }}>
              {item.value}
            </p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
              {item.name}
            </p>
          </div>
        ))}
      </div>

      {/* Gráfica de pastel */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
