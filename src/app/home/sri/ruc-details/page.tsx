"use client";

import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import HomeLayout from "@/app/components/layout/HomeLayout";
import { getContributorDetailsSRI } from "@/api/apiOlimpSri";
import { useState } from "react";
import { ResponseContributorDetails } from "@/interfaces/ResponseContributorDetails";
import DataTable, { Column } from "@/app/components/shared/DataTable";

interface ContributorRow {
  numeroRuc: string;
  razonSocial: string;
  estadoContribuyente: string;
  actividadEconomicaPrincipal: string;
  tipoContribuyente: string;
  regimen: string;
  categoria: string;
  obligadoLlevarContabilidad: string;
  fechaInicioActividades: string;
  fechaCese: string;
  fechaReinicioActividades: string;
  fechaActualizacion: string;
  representantesLegales: string;
  motivoCancelacionSuspension: string;
  contribuyenteFantasma: string;
  transaccionesInexistente: string;
}

export default function RucDetailsPage() {
  const [ruc, setRuc] = useState("");
  const [useDefaultRuc, setUseDefaultRuc] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseContributorDetails | null>(
    null,
  );

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
      const result = await getContributorDetailsSRI(rucToValidate);
      setResponse(result);
    } catch (err: any) {
      console.error("Error al consultar detalles del RUC:", err);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = response?.status === "OK" || response?.code === 200;

  // Definir columnas de la tabla
  const columns: Column<ContributorRow>[] = [
    { key: "numeroRuc", header: "Número RUC", width: "150px" },
    { key: "razonSocial", header: "Razón Social" },
    {
      key: "estadoContribuyente",
      header: "Estado Contribuyente",
      width: "150px",
    },
    {
      key: "actividadEconomicaPrincipal",
      header: "Actividad Económica Principal",
    },
    { key: "tipoContribuyente", header: "Tipo Contribuyente", width: "150px" },
    { key: "regimen", header: "Régimen", width: "120px" },
    { key: "categoria", header: "Categoría", width: "120px" },
    {
      key: "obligadoLlevarContabilidad",
      header: "Obligado Contabilidad",
      width: "150px",
    },
    {
      key: "fechaInicioActividades",
      header: "Fecha Inicio Actividades",
      width: "180px",
    },
    { key: "fechaCese", header: "Fecha Cese Actividades", width: "150px" },
    {
      key: "fechaReinicioActividades",
      header: "Fecha Reinicio Actividades",
      width: "150px",
    },
    {
      key: "fechaActualizacion",
      header: "Fecha Actualización",
      width: "180px",
    },
    { key: "representantesLegales", header: "Representantes Legales" },
    {
      key: "motivoCancelacionSuspension",
      header: "Motivo Cancelación/Suspensión",
    },
    {
      key: "contribuyenteFantasma",
      header: "Contribuyente Fantasma",
      width: "150px",
    },
    {
      key: "transaccionesInexistente",
      header: "Transacciones Inexistentes",
      width: "180px",
    },
  ];

  // Preparar datos para la tabla
  const tableData: ContributorRow[] =
    response && response.data && response.data.length > 0
      ? [
          {
            numeroRuc: response.data[0].numeroRuc || "-",
            razonSocial: response.data[0].razonSocial || "-",
            estadoContribuyente: response.data[0].estadoContribuyenteRuc || "-",
            actividadEconomicaPrincipal:
              response.data[0].actividadEconomicaPrincipal || "-",
            tipoContribuyente: response.data[0].tipoContribuyente || "-",
            regimen: response.data[0].regimen || "-",
            categoria: response.data[0].categoria || "-",
            obligadoLlevarContabilidad:
              response.data[0].obligadoLlevarContabilidad || "-",
            fechaInicioActividades:
              response.data[0].informacionFechasContribuyente
                ?.fechaInicioActividades || "-",
            fechaCese:
              response.data[0].informacionFechasContribuyente?.fechaCese || "-",
            fechaReinicioActividades:
              response.data[0].informacionFechasContribuyente
                ?.fechaReinicioActividades || "-",
            fechaActualizacion:
              response.data[0].informacionFechasContribuyente
                ?.fechaActualizacion || "-",
            representantesLegales:
              response.data[0].representantesLegales
                ?.map((r) => `${r.nombre} (${r.identificacion})`)
                .join(", ") || "-",
            motivoCancelacionSuspension:
              response.data[0].motivoCancelacionSuspension || "-",
            contribuyenteFantasma:
              response.data[0].contribuyenteFantasma || "-",
            transaccionesInexistente:
              response.data[0].transaccionesInexistente || "-",
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
              Detalles del Contribuyente
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Consulta información detallada de un contribuyente por su RUC en
              el SRI.
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

          {/* Botón de consultar */}
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
              {loading ? "Consultando..." : "Consultar"}
            </button>
          </div>

          {/* Tabla de detalles */}
          {tableData.length > 0 && (
            <DataTable
              columns={columns}
              data={tableData}
              keyExtractor={(_, index) => index.toString()}
              emptyMessage="No hay información disponible"
              hoverable
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
