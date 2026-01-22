"use client";

import HomeLayout from "@/app/components/layout/HomeLayout";
import { validateRucSRI } from "@/api/apiOlimpSri";
import { useState } from "react";
import ResponseValidateRuc from "@/interfaces/ResponseValidateRuc";

export default function ValidateRucPage() {
  const [ruc, setRuc] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseValidateRuc | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!ruc.trim()) {
      setError("Por favor ingresa un RUC válido");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await validateRucSRI(ruc);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || "Error al validar el RUC");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = response?.status === "OK" || response?.code === 200;

  return (
    <HomeLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-text-light dark:text-text-dark text-2xl font-bold leading-tight">
              Validar RUC
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Verifica si un RUC está registrado y activo en el SRI.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-[#323a46]">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-text-light text-sm font-medium mb-2">
                Número de RUC
              </label>
              <input
                type="text"
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
                placeholder="Ej: 1790753913001"
                className="w-full px-4 py-2 bg-[#1a1f2e] border border-[#323a46] rounded-lg text-text-light placeholder-gray-500 focus:outline-none focus:border-primary-light"
                maxLength={13}
              />
            </div>
            <button
              onClick={handleValidate}
              disabled={loading}
              className="px-6 py-2 bg-primary-light hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Validando..." : "Validar"}
            </button>
          </div>
        </div>

        {/* Respuesta con error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6">
            <h3 className="text-red-500 font-bold text-lg mb-2">Error</h3>
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Respuesta exitosa */}
        {response && (
          <div
            className={`rounded-xl p-6 border ${
              isSuccess
                ? "bg-green-500/10 border-green-500"
                : "bg-red-500/10 border-red-500"
            }`}
          >
            <h3
              className={`font-bold text-lg mb-2 ${
                isSuccess ? "text-green-500" : "text-red-500"
              }`}
            >
              {response.status}
            </h3>
            <p
              className={`mb-4 ${
                isSuccess ? "text-green-400" : "text-red-400"
              }`}
            >
              {response.message}
            </p>
            <div className="bg-[#1a1f2e] rounded-lg p-4 border border-[#323a46]">
              <p className="text-text-light font-mono text-sm">
                <span className="text-gray-400">Código:</span> {response.code}
              </p>
              <p className="text-text-light font-mono text-sm mt-2">
                <span className="text-gray-400">Resultado:</span>{" "}
                {response.data}
              </p>
            </div>
          </div>
        )}
      </div>
    </HomeLayout>
  );
}
