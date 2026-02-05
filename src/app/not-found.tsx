"use client";

import { useRouter } from "next/navigation";
import Button from "./components/shared/Button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{ backgroundColor: "#f3f3ff" }}
    >
      <div className="max-w-lg w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="material-symbols-outlined !text-[60px] text-orange-600">
              search_off
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Error 404 - Página no encontrada
        </h1>
        <p className="text-gray-600 mb-8">
          No pudimos encontrar la página que buscas.
        </p>

        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-8">
          <p className="text-orange-600 font-medium text-center break-words">
            La URL solicitada no existe en este servidor.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/")}
            className="w-full bg-[#9098f8] hover:bg-[#7a82e8] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
