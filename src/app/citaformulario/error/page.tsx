"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Button from "../../components/shared/Button";

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get("message") || "Ocurrió un error inesperado";

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{ backgroundColor: "#f3f3ff" }}
    >
      <div className="max-w-lg w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
            <span className="material-symbols-outlined !text-[60px] text-red-600">
              error
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          ¡Algo salió mal!
        </h1>
        <p className="text-gray-600 mb-8">No pudimos procesar su solicitud.</p>

        <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-8">
          <p className="text-red-600 font-medium text-center break-words">
            {message}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push("/citaformulario")}
            className="w-full bg-[#9098f8] hover:bg-[#7a82e8] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background-dark flex items-center justify-center text-white">
          Cargando...
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
