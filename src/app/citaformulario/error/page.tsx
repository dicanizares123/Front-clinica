"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Button from "../../components/shared/Button";

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get("message") || "Ocurrió un error inesperado";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark p-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-6 flex justify-center">
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/doctora-extiende-las-manos-illustration-svg-download-png-8542721.png"
            alt="Doctora Confundida"
            className="h-64 object-contain opacity-90"
          />
        </div>

        <h1 className="text-3xl font-bold text-red-500 mb-2">
          ¡Algo salió mal!
        </h1>
        <p className="text-text-secondary mb-6">
          No pudimos procesar su solicitud.
        </p>

        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-left mb-8">
          <p className="text-red-400 font-medium text-center break-words">
            {message}
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            textButton="Volver a intentar"
            type="button"
            onClick={() => router.push("/citaformulario")}
            className="w-full bg-surface-dark border border-[#323a46] hover:bg-[#323a46] !text-white"
          />
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
