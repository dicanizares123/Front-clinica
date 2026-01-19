"use client";

import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import StatsCard from "./StatsCard";

interface StatsData {
  totalClients: number;
  todayRevenue: number;
  totalInvoices: number;
}

interface StatsGridProps {
  data?: StatsData;
}

export default function StatsGrid({ data }: StatsGridProps) {
  // Obtener pacientes desde backend
  const { data: patientsData } = useSWR("/api/patients/", fetcher);

  console.log("Patients data:", patientsData);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full">
      <StatsCard
        title="Clientes Total"
        value={patientsData?.count || 0}
        icon="groups"
        color="blue"
      />
      <StatsCard
        title="USA EL SERVICIO DE RENTA INTERNA ECUADOR EN UN MISMO LUGAR"
        imageSrc="https://facturasrapidasec.com/wp-content/uploads/2026/01/sri-seeklogo-1024x657.png"
        color="purple"
        className="bg-white/80"
        titleClassName="text-black/70"
      />
    </div>
  );
}
