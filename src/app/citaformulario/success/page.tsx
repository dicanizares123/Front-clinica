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
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{ backgroundColor: "#f3f3ff" }}
    >
      <div className="max-w-lg w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <span className="material-symbols-outlined !text-[60px] text-green-600">
              check_circle
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          ¡Cita Agendada Exitosamente!
        </h1>
        <p className="text-gray-600 mb-8">
          Tomaremos contacto 1 hora antes para confirmar tu asistencia.
        </p>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Paciente</span>
              <span className="text-lg text-gray-900 font-semibold">
                {patient}
              </span>
            </div>
            <div className="border-t border-gray-100"></div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Doctor</span>
              <span className="text-lg text-gray-900 font-semibold">
                {doctor}
              </span>
            </div>
            <div className="border-t border-gray-100"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Fecha</span>
                <span className="text-lg text-gray-900 font-semibold">
                  {date}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-600 mb-1">Hora</span>
                <span className="text-lg text-gray-900 font-semibold">
                  {time}
                </span>
              </div>
            </div>
          </div>
        </div>

        <a
          href="/"
          className="inline-block w-full bg-[#9098f8] hover:bg-[#7a82e8] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Volver al Inicio
        </a>
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
