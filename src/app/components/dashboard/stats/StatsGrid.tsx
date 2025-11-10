"use client";

import StatsCard from "./StatsCard";

interface StatsData {
  totalClients: number;
  todayRevenue: number;
  totalInvoices: number;
  pendingSRI: number;
}

interface StatsGridProps {
  data?: StatsData;
}

export default function StatsGrid({ data }: StatsGridProps) {
  // Datos de prueba
  const stats = data || {
    totalClients: 128,
    todayRevenue: 450,
    totalInvoices: 76,
    pendingSRI: 29,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Clientes Total"
        value={stats.totalClients}
        icon="groups"
        color="blue"
      />
      <StatsCard
        title="Recaudado Hoy"
        value={`$${stats.todayRevenue}`}
        icon="payments"
        color="green"
      />
      <StatsCard
        title="Facturas Totales"
        value={stats.totalInvoices}
        icon="folder_open"
        color="purple"
      />
      <StatsCard
        title="Por Enviar al SRI"
        value={stats.pendingSRI}
        icon="send"
        color="orange"
      />
    </div>
  );
}
