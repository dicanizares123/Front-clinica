"use client";

import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "@/app/fetcher";
import StatsCard from "./StatsCard";
import { useRouter } from "next/navigation";
import AppointmentModal from "./AppointmentModal";
import AddPatientModal from "./AddPatientModal";

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
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  console.log("Patients data:", patientsData);

  const router = useRouter();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <StatsCard
          title="Clientes Total"
          value={patientsData?.count || 0}
          icon="groups"
          color="blue"
        />
        <StatsCard
          title="Añadir Paciente"
          icon="person_add"
          color="orange"
          onClick={() => setIsPatientModalOpen(true)}
          clickable
        />
        <StatsCard
          title="Crear Nueva Cita"
          icon="event_note"
          color="green"
          onClick={() => setIsAppointmentModalOpen(true)}
          clickable
        />
        <StatsCard
          title="USA EL SERVICIO DE RENTA INTERNA ECUADOR EN UN MISMO LUGAR"
          imageSrc="https://facturasrapidasec.com/wp-content/uploads/2026/01/sri-seeklogo-1024x657.png"
          className="bg-white/80"
          titleClassName="text-black/70"
          onClick={() => router.push("/home/sri")}
        />
      </div>

      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />

      <AddPatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      />
    </>
  );
}
