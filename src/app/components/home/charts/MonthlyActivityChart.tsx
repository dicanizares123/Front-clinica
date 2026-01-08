"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import useSWR from "swr";
import { fetcher } from "@/app/fetcher";

interface PatientData {
  day: number; // Día del mes (1-31)
  patients: number; // Cantidad de pacientes atendidos
  date: string; // Fecha formateada (ej: "1 Nov")
}

interface MonthlyActivityChartProps {
  data?: PatientData[];
}

export default function MonthlyActivityChart({
  data,
}: MonthlyActivityChartProps) {
  const [mounted, setMounted] = useState(false);

  // Esperar a que el componente esté montado en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Integración con backend - descomenta cuando esté listo
  // const { data: backendData, error, isLoading } = useSWR('/api/patients/monthly-stats', fetcher);

  // Obtener mes actual
  const getCurrentMonth = () => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[new Date().getMonth()];
  };

  // Generar datos de prueba para el mes actual
  const generateMockData = (): PatientData[] => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const mockData: PatientData[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayName = date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });

      // Generar número aleatorio de pacientes (20-100)
      const patients = Math.floor(Math.random() * 80) + 20;

      mockData.push({
        day,
        patients,
        date: dayName,
      });
    }

    return mockData;
  };

  // Solo generar datos en el cliente
  const chartData = mounted ? data || generateMockData() : [];
  // Cuando el backend esté listo, usa: backendData || generateMockData()

  // Calcular estadísticas
  const totalPatients = chartData.reduce((sum, item) => sum + item.patients, 0);
  const avgPatients =
    chartData.length > 0 ? Math.round(totalPatients / chartData.length) : 0;
  const maxPatients =
    chartData.length > 0
      ? Math.max(...chartData.map((item) => item.patients))
      : 0;

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {payload[0].payload.date}
          </p>
          <p className="text-sm text-primary font-bold">
            {payload[0].value} pacientes
          </p>
        </div>
      );
    }
    return null;
  };

  // Mostrar loading mientras se monta el componente
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
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em]">
            Pacientes Atendidos - {getCurrentMonth()}
          </h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
            Actividad diaria del mes actual
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{totalPatients}</p>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Total del mes
          </p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-background-light dark:bg-background-dark p-3 rounded-lg">
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Promedio diario
          </p>
          <p className="text-lg font-bold text-text-light dark:text-text-dark">
            {avgPatients}
          </p>
        </div>
        <div className="bg-background-light dark:bg-background-dark p-3 rounded-lg">
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Máximo en un día
          </p>
          <p className="text-lg font-bold text-green-600">{maxPatients}</p>
        </div>
        <div className="bg-background-light dark:bg-background-dark p-3 rounded-lg">
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Días registrados
          </p>
          <p className="text-lg font-bold text-blue-600">{chartData.length}</p>
        </div>
      </div>

      {/* Gráfica lineal */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
              label={{
                value: "Pacientes",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: "#94a3b8" },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "14px" }}
              iconType="line"
              formatter={() => "Pacientes atendidos"}
            />
            <Line
              type="monotone"
              dataKey="patients"
              stroke="#000000"
              strokeWidth={3}
              dot={{ fill: "#000000", r: 4 }}
              activeDot={{ r: 6, fill: "#000000" }}
              // Animación
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* 
      Nota para integración con backend 
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          💡 <strong>Backend:</strong> Descomentar línea 26 y crear endpoint{" "}
          <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
            GET /api/patients/monthly-stats
          </code>{" "}
          que retorne:{" "}
          <code>{"{ day: number, patients: number, date: string }[]"}</code>
        </p>
      </div> */}
    </div>
  );
}
