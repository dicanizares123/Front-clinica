"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();

  const patient = searchParams.get("patient");
  const doctor = searchParams.get("doctor");
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark p-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-6 flex justify-center">
          <img
            src="https://png.pngtree.com/png-clipart/20221223/original/pngtree-happy-female-doctor-in-medical-uniform-png-image_8800230.png"
            alt="Doctora Feliz"
            className="h-64 object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold text-primary mb-2">
          ¡Agendado con éxito, tomaremos contacto 1 hora antes para confirmar tu
          asistencia!
        </h1>
        <p className="text-text-secondary mb-6">
          Su cita ha sido programada correctamente.
        </p>

        <div className="bg-background-dark p-6 rounded-lg text-left border border-[#323a46] mb-8">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col">
              <span className="text-sm text-text-secondary">Paciente</span>
              <span className="text-lg text-text-primary font-medium">
                {patient}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-text-secondary">Doctor</span>
              <span className="text-lg text-text-primary font-medium">
                {doctor}
              </span>
            </div>
            <div className="flex justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-text-secondary">Fecha</span>
                <span className="text-lg text-text-primary font-medium">
                  {date}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-text-secondary">Hora</span>
                <span className="text-lg text-text-primary font-medium">
                  {time}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background-dark flex items-center justify-center text-white">
          Cargando...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
