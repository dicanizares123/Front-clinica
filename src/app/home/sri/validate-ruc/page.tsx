"use client";

import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import HomeLayout from "@/app/components/layout/HomeLayout";
import { validateRucSRI } from "@/api/apiOlimpSri";
import { useState, useEffect } from "react";
import ResponseValidateRuc from "@/interfaces/ResponseValidateRuc";
import DataTable, { Column } from "@/app/components/shared/DataTable";

interface RucResult {
  code: number;
  result: string;
}

export default function ValidateRucPage() {
  const [ruc, setRuc] = useState("");
  const [useDefaultRuc, setUseDefaultRuc] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseValidateRuc | null>(null);

  // Obtener datos del usuario
  const { data: userData } = useSWR("/auth/users/me/", fetcher);

  // Obtener RUC del negocio
  const { data: businessRucData } = useSWR("/api/business/ruc/", fetcher);
  const businessRuc = businessRucData?.data?.ruc || null;

  const user = userData
    ? {
        username: userData.username || "Usuario",
        email: userData.email || "",
        role: userData.role_name || "Usuario",
        uuid: userData.uuid || "",
        first_names: userData.first_names || "",
        last_names: userData.last_names || "",
        permissions: userData.role || {},
      }
    : undefined;

  const handleValidate = async () => {
    const rucToValidate = useDefaultRuc ? businessRuc : ruc;

    if (!rucToValidate?.trim()) {
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const result = await validateRucSRI(rucToValidate);
      setResponse(result);
    } catch (err: any) {
      console.error("Error al validar el RUC:", err);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = response?.status === "OK" || response?.code === 200;

  // Definir columnas de la tabla
  const columns: Column<RucResult>[] = [
    {
      key: "result",
      header: "Resultado",
      render: (value) => <span>{value}</span>,
    },
  ];

  // Preparar datos para la tabla
  const tableData: RucResult[] =
    response && response.data
      ? [
          {
            code: response.code,
            result: response.data,
          },
        ]
      : [];

  return (
    <HomeLayout user={user}>
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

        {/* Formulario y Tabla */}
        <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-[#323a46]">
          {/* Selector de modo RUC */}
          <div className="mb-6">
            <label className="block text-text-light text-sm font-medium mb-3">
              Seleccionar RUC a consultar
            </label>
            <div className="flex flex-col gap-3">
              {/* Opción RUC del negocio */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="rucMode"
                  checked={useDefaultRuc}
                  onChange={() => setUseDefaultRuc(true)}
                  className="w-4 h-4 text-primary-light"
                />
                <span className="text-text-light text-sm">
                  RUC del negocio (por defecto)
                </span>
              </label>

              {/* RUC del negocio - cuadro gris no editable */}
              {useDefaultRuc && (
                <div className="ml-7">
                  <input
                    type="text"
                    value={businessRuc || "No hay RUC configurado"}
                    disabled
                    className="w-80 px-4 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
                  />
                </div>
              )}

              {/* Opción buscar otro RUC */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="rucMode"
                  checked={!useDefaultRuc}
                  onChange={() => setUseDefaultRuc(false)}
                  className="w-4 h-4 text-primary-light"
                />
                <span className="text-text-light text-sm">
                  Buscar otro RUC (opcional)
                </span>
              </label>

              {/* Input para otro RUC */}
              {!useDefaultRuc && (
                <div className="ml-7">
                  <input
                    type="text"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value)}
                    placeholder="Ej: 1790753913001"
                    className="w-80 px-4 py-2 bg-[#1a1f2e] border border-[#323a46] rounded-lg text-text-light placeholder-gray-500 focus:outline-none focus:border-primary-light text-sm"
                    maxLength={13}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botón de validar */}
          <div className="mb-6">
            <button
              onClick={handleValidate}
              disabled={
                loading ||
                (useDefaultRuc && !businessRuc) ||
                (!useDefaultRuc && !ruc.trim())
              }
              className="px-6 py-2 bg-primary-light hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Validando..." : "Validar"}
            </button>
          </div>

          {/* Tabla de resultado */}
          {tableData.length > 0 && (
            <DataTable
              columns={columns}
              data={tableData}
              keyExtractor={(_, index) => index.toString()}
              emptyMessage="No hay resultado disponible"
              hoverable={false}
            />
          )}
        </div>

        {/* Estado de respuesta - debajo de la tabla */}
        {response && (
          <div
            className={`rounded-xl p-4 border ${
              isSuccess
                ? "bg-green-500/10 border-green-500"
                : "bg-red-500/10 border-red-500"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`font-bold text-lg ${
                  isSuccess ? "text-green-500" : "text-red-500"
                }`}
              >
                {response.status}
              </span>
              <span className="text-gray-400">•</span>
              <p className={`${isSuccess ? "text-green-400" : "text-red-400"}`}>
                {response.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </HomeLayout>
  );
}
