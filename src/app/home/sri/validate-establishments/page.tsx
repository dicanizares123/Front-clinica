"use client";

import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import HomeLayout from "@/app/components/layout/HomeLayout";
import { validateEstablishmentSRI } from "@/api/apiOlimpSri";
import { useState } from "react";
import ResponseValidateEstablishment from "@/interfaces/ResponseValidateEstablishment";
import DataTable, { Column } from "@/app/components/shared/DataTable";

interface Establishment {
  numeroEstablecimiento: string;
  nombreFantasiaComercial: string;
  tipoEstablecimiento: string;
  direccionCompleta: string;
  estado: string;
  matriz: string;
}

export default function ValidateEstablishmentsPage() {
  const [ruc, setRuc] = useState("");
  const [useDefaultRuc, setUseDefaultRuc] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] =
    useState<ResponseValidateEstablishment | null>(null);

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
      const result = await validateEstablishmentSRI(rucToValidate);
      setResponse(result);
    } catch (err: any) {
      console.error("Error al validar establecimientos:", err);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = response?.status === "OK" || response?.code === 200;

  // Definir columnas de la tabla
  const columns: Column<Establishment>[] = [
    {
      key: "numeroEstablecimiento",
      header: "Número Establecimiento",
      width: "200px",
    },
    {
      key: "nombreFantasiaComercial",
      header: "Nombre Comercial",
    },
    {
      key: "tipoEstablecimiento",
      header: "Tipo Establecimiento",
      width: "200px",
    },
    {
      key: "direccionCompleta",
      header: "Dirección Completa",
    },
    {
      key: "estado",
      header: "Estado",
      width: "120px",
      align: "center",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            value === "ABIERTO"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "matriz",
      header: "Matriz",
      width: "100px",
      align: "center",
    },
  ];

  return (
    <HomeLayout user={user}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-gray-900 text-2xl font-bold leading-tight">
              Validar Establecimientos
            </h1>
            <p className="text-gray-600 text-sm">
              Consulta los establecimientos registrados de un RUC en el SRI.
            </p>
          </div>
        </div>

        {/* Formulario y Tabla */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          {/* Selector de modo RUC */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
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
                  className="w-4 h-4 text-[#9098f8]"
                />
                <span className="text-gray-900 text-sm">
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
                    className="w-80 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 text-sm cursor-not-allowed"
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
                  className="w-4 h-4 text-[#9098f8]"
                />
                <span className="text-gray-900 text-sm">
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
                    className="w-80 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#9098f8] focus:ring-2 focus:ring-[#9098f8]/20 text-sm"
                    maxLength={13}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botón de consultar */}
          <div className="mb-6">
            <button
              onClick={handleValidate}
              disabled={
                loading ||
                (useDefaultRuc && !businessRuc) ||
                (!useDefaultRuc && !ruc.trim())
              }
              className="px-6 py-2 bg-[#9098f8] hover:bg-[#7a82e8] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Consultando..." : "Consultar"}
            </button>
          </div>

          {/* Tabla de establecimientos */}
          {response && response.data && response.data.length > 0 && (
            <DataTable
              columns={columns}
              data={response.data}
              keyExtractor={(row, index) => index.toString()}
              emptyMessage="No hay establecimientos registrados"
              hoverable
            />
          )}
        </div>

        {/* Estado de respuesta - debajo de la tabla */}
        {response && (
          <div
            className={`rounded-xl p-4 border ${
              isSuccess
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`font-bold text-lg ${
                  isSuccess ? "text-green-600" : "text-red-600"
                }`}
              >
                {response.status}
              </span>
              <span className="text-gray-400">•</span>
              <p className={`${isSuccess ? "text-green-600" : "text-red-600"}`}>
                {response.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </HomeLayout>
  );
}
