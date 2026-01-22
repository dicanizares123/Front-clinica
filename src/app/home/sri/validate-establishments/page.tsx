"use client";

import HomeLayout from "@/app/components/layout/HomeLayout";
import { validateEstablishmentSRI } from "@/api/apiOlimpSri";
import { useState } from "react";
import ResponseValidateEstablishment from "@/interfaces/ResponseValidateEstablishment";

export default function ValidateEstablishmentsPage() {
  const [ruc, setRuc] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] =
    useState<ResponseValidateEstablishment | null>(null);
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
      const result = await validateEstablishmentSRI(ruc);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || "Error al validar los establecimientos");
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
              Validar Establecimientos
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Consulta los establecimientos registrados de un RUC en el SRI.
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
              {loading ? "Consultando..." : "Consultar"}
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

            {/* Tabla de establecimientos */}
            {response.data && response.data.length > 0 && (
              <div className="bg-[#1a1f2e] rounded-lg p-4 border border-[#323a46] overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#323a46]">
                      <th className="text-text-light text-sm font-semibold py-3 px-4">
                        Número
                      </th>
                      <th className="text-text-light text-sm font-semibold py-3 px-4">
                        Nombre Comercial
                      </th>
                      <th className="text-text-light text-sm font-semibold py-3 px-4">
                        Tipo
                      </th>
                      <th className="text-text-light text-sm font-semibold py-3 px-4">
                        Dirección
                      </th>
                      <th className="text-text-light text-sm font-semibold py-3 px-4">
                        Estado
                      </th>
                      <th className="text-text-light text-sm font-semibold py-3 px-4">
                        Matriz
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {response.data.map((establishment, index) => (
                      <tr
                        key={index}
                        className="border-b border-[#323a46] hover:bg-[#252d3d] transition-colors"
                      >
                        <td className="text-text-secondary-light text-sm py-3 px-4">
                          {establishment.numeroEstablecimiento}
                        </td>
                        <td className="text-text-secondary-light text-sm py-3 px-4">
                          {establishment.nombreFantasiaComercial}
                        </td>
                        <td className="text-text-secondary-light text-sm py-3 px-4">
                          {establishment.tipoEstablecimiento}
                        </td>
                        <td className="text-text-secondary-light text-sm py-3 px-4">
                          {establishment.direccionCompleta}
                        </td>
                        <td className="text-text-secondary-light text-sm py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              establishment.estado === "ACTIVO"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {establishment.estado}
                          </span>
                        </td>
                        <td className="text-text-secondary-light text-sm py-3 px-4">
                          {establishment.matriz}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </HomeLayout>
  );
}
