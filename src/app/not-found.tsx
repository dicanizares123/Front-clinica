"use client";

import { useRouter } from "next/navigation";
import Button from "./components/shared/Button";

export default function NotFound() {
  const router = useRouter();

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
          ¡Algo salió mal, Error 404!
        </h1>
        <p className="text-text-secondary mb-6">
          No pudimos encontrar la página que buscas.
        </p>

        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-left mb-8">
          <p className="text-red-400 font-medium text-center break-words">
            La URL solicitada no existe en este servidor.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            textButton="Volver al Inicio"
            type="button"
            onClick={() => router.push("/")}
            className="w-full bg-surface-dark border border-[#323a46] hover:bg-[#323a46] !text-white"
          />
        </div>
      </div>
    </div>
  );
}
