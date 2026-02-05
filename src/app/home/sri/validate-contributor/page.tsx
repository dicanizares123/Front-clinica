"use client";

import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import HomeLayout from "@/app/components/layout/HomeLayout";
import {
  consultarContribuyenteOlimpush,
  registrarFirmaElectronica,
  eliminarFirmaElectronica,
  consultarSuscripcionOlimpush,
} from "@/api/apiOlimpSri";
import { useState, useEffect } from "react";
import { ResponseContributor } from "@/interfaces/ResponseContributor";
import { ResponseRegistrarFirma } from "@/interfaces/ResponseRegistrarFirma";
import { ResponseSuscripcion } from "@/interfaces/ResponseSuscripcion";
import DataTable, { Column } from "@/app/components/shared/DataTable";

interface ContributorRow {
  socialReason: string;
  ruc: string;
  signatureDoc: string;
  createAt: string;
  urlLogo: string;
}

export default function ValidateContributorPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseContributor | null>(null);

  // Estados para firma electrónica
  const [loadingFirma, setLoadingFirma] = useState(false);
  const [responseFirma, setResponseFirma] =
    useState<ResponseRegistrarFirma | null>(null);
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");

  // Estados para eliminar firma
  const [loadingEliminar, setLoadingEliminar] = useState(false);
  const [responseEliminar, setResponseEliminar] =
    useState<ResponseRegistrarFirma | null>(null);

  // Estados para suscripción
  const [loadingSuscripcion, setLoadingSuscripcion] = useState(true);
  const [responseSuscripcion, setResponseSuscripcion] =
    useState<ResponseSuscripcion | null>(null);

  // Cargar suscripción automáticamente al montar el componente
  useEffect(() => {
    const cargarSuscripcion = async () => {
      try {
        const result = await consultarSuscripcionOlimpush();
        setResponseSuscripcion(result);
      } catch (err: any) {
        console.error("Error al consultar suscripción:", err);
      } finally {
        setLoadingSuscripcion(false);
      }
    };

    cargarSuscripcion();
  }, []);

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
    if (!businessRuc?.trim()) {
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const result = await consultarContribuyenteOlimpush(businessRuc);
      setResponse(result);
    } catch (err: any) {
      console.error("Error al consultar el contribuyente:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar extensión
    if (!file.name.endsWith(".p12")) {
      alert("Solo se permiten archivos .p12");
      e.target.value = "";
      return;
    }

    setCertificadoFile(file);
  };

  const handleRegistrarFirma = async () => {
    if (!businessRuc?.trim()) {
      alert("No hay RUC configurado");
      return;
    }

    if (!certificadoFile) {
      alert("Debe seleccionar un archivo de certificado .p12");
      return;
    }

    if (!password.trim()) {
      alert("Debe ingresar la contraseña del certificado");
      return;
    }

    setLoadingFirma(true);
    setResponseFirma(null);

    try {
      const result = await registrarFirmaElectronica(
        businessRuc,
        certificadoFile,
        password,
      );
      setResponseFirma(result);

      // Limpiar formulario si fue exitoso
      if (result.status === "OK" || result.code === 200) {
        setCertificadoFile(null);
        setPassword("");
        // Limpiar input file
        const fileInput = document.getElementById(
          "certificado-file",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }
    } catch (err: any) {
      console.error("Error al registrar firma electrónica:", err);
    } finally {
      setLoadingFirma(false);
    }
  };

  const handleEliminarFirma = async () => {
    if (!businessRuc?.trim()) {
      alert("No hay RUC configurado");
      return;
    }

    // Confirmación antes de eliminar
    const confirmacion = confirm(
      "⚠️ ¿Está seguro de que desea eliminar el certificado de firma electrónica?\n\n" +
        "Esta acción es IRREVERSIBLE. Una vez eliminado, deberá registrar un nuevo certificado para continuar firmando documentos electrónicos.",
    );

    if (!confirmacion) return;

    setLoadingEliminar(true);
    setResponseEliminar(null);

    try {
      const result = await eliminarFirmaElectronica(businessRuc);
      setResponseEliminar(result);
    } catch (err: any) {
      console.error("Error al eliminar firma electrónica:", err);
    } finally {
      setLoadingEliminar(false);
    }
  };

  const isSuccess = response?.status === "OK" || response?.code === 200;
  const isSuccessFirma =
    responseFirma?.status === "OK" || responseFirma?.code === 200;
  const isSuccessEliminar =
    responseEliminar?.status === "OK" || responseEliminar?.code === 200;
  const isSuccessSuscripcion =
    responseSuscripcion?.status === "OK" || responseSuscripcion?.code === 200;

  // Calcular documentos restantes
  const documentosRestantes = responseSuscripcion?.data
    ? responseSuscripcion.data.amountDoc -
      responseSuscripcion.data.amountDocUsed
    : 0;

  // Definir columnas de la tabla
  const columns: Column<ContributorRow>[] = [
    {
      key: "socialReason",
      header: "Razón Social",
    },
    {
      key: "ruc",
      header: "RUC",
      width: "150px",
    },
    {
      key: "signatureDoc",
      header: "Firma Electrónica",
    },
    {
      key: "createAt",
      header: "Fecha de Registro",
      width: "180px",
    },
    {
      key: "urlLogo",
      header: "URL Logo",
      render: (value) => (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-light hover:underline"
        >
          Ver Logo
        </a>
      ),
    },
  ];

  // Preparar datos para la tabla
  const tableData: ContributorRow[] =
    response && response.data
      ? [
          {
            socialReason: response.data.socialReason,
            ruc: response.data.ruc,
            signatureDoc: response.data.signatureDoc,
            createAt: response.data.createAt,
            urlLogo: response.data.urlLogo,
          },
        ]
      : [];

  return (
    <HomeLayout user={user}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-gray-900 text-2xl font-bold leading-tight">
              Olimpush Servicios
            </h1>
            <p className="text-gray-600 text-sm">
              Gestiona tu suscripción, contribuyente y firma electrónica.
            </p>
          </div>
        </div>

        {/* Layout de dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Suscripción Actual */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-gray-900 text-xl font-bold mb-2">
                  Suscripción Actual
                </h2>
                <p className="text-gray-600 text-sm">
                  Estado de tu suscripción, documentos disponibles y tipos
                  autorizados.
                </p>
              </div>

              {/* Loading state */}
              {loadingSuscripcion && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9098f8]"></div>
                  <span className="ml-3 text-gray-600">
                    Cargando suscripción...
                  </span>
                </div>
              )}

              {/* Resultado de suscripción */}
              {!loadingSuscripcion &&
                responseSuscripcion &&
                isSuccessSuscripcion &&
                responseSuscripcion.data && (
                  <div className="space-y-4">
                    {/* Tarjetas de estado */}
                    <div className="grid grid-cols-1 gap-4">
                      {/* Estado */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-xs uppercase mb-1">
                          Estado
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full ${responseSuscripcion.data.active ? "bg-green-500" : "bg-red-500"}`}
                          ></span>
                          <span
                            className={`font-bold ${responseSuscripcion.data.active ? "text-green-400" : "text-red-400"}`}
                          >
                            {responseSuscripcion.data.active
                              ? "ACTIVA"
                              : "INACTIVA"}
                          </span>
                        </div>
                      </div>

                      {/* Ambiente */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-xs uppercase mb-1">
                          Ambiente
                        </p>
                        <p className="text-gray-900 font-bold">
                          {responseSuscripcion.data.environment}
                        </p>
                      </div>

                      {/* Documentos */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-xs uppercase mb-1">
                          Documentos
                        </p>
                        <p className="text-gray-900 font-bold">
                          <span className="text-[#9098f8]">
                            {documentosRestantes}
                          </span>
                          <span className="text-gray-500">
                            {" "}
                            / {responseSuscripcion.data.amountDoc}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          ({responseSuscripcion.data.amountDocUsed} usados)
                        </p>
                      </div>

                      {/* Vigencia */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-xs uppercase mb-1">
                          Vigencia
                        </p>

                        <p className="text-gray-900 font-bold text-sm">
                          La suscripción finaliza el{" "}
                          {responseSuscripcion.data.endDate}
                        </p>
                      </div>
                    </div>

                    {/* Tipos de documentos autorizados */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-xs uppercase mb-3">
                        Documentos Autorizados
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {responseSuscripcion.data.docs.map((doc) => (
                          <span
                            key={doc.code}
                            className="px-3 py-1 bg-[#9098f8]/20 text-[#9098f8] rounded-full text-xs font-medium"
                          >
                            {doc.description} ({doc.code})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {/* Estado de respuesta error */}
              {responseSuscripcion && !isSuccessSuscripcion && (
                <div className="rounded-xl p-4 border bg-red-50 border-red-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-red-600">
                      {responseSuscripcion.status}
                    </span>
                    <span className="text-gray-400">•</span>
                    <p className="text-red-600">
                      {responseSuscripcion.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - Consultar Contribuyente y Registrar Firma */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sección: Consultar Contribuyente */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-gray-900 text-xl font-bold mb-2">
                  Consultar Contribuyente
                </h2>
                <p className="text-gray-600 text-sm">
                  Consulta información del contribuyente registrado en Olimpush.
                </p>
              </div>
              {/* RUC del negocio */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-3">
                  RUC del negocio a consultar
                </label>
                <input
                  type="text"
                  value={businessRuc || "No hay RUC configurado"}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 text-sm cursor-not-allowed"
                />
              </div>

              {/* Botón de consultar */}
              <div className="mb-6">
                <button
                  onClick={handleValidate}
                  disabled={loading || !businessRuc}
                  className="px-6 py-2 bg-[#9098f8] hover:bg-[#7a82e8] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Consultando..." : "Consultar"}
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

              {/* Estado de respuesta */}
              {response && (
                <div
                  className={`rounded-xl p-4 border mt-6 ${
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
                    <p
                      className={`${isSuccess ? "text-green-600" : "text-red-600"}`}
                    >
                      {response.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sección: Registrar Firma Electrónica */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-gray-900 text-xl font-bold mb-2">
                  Registrar Firma Electrónica
                </h2>
                <p className="text-gray-600 text-sm">
                  Registra el certificado digital (.p12) del contribuyente para
                  firmar comprobantes electrónicos.
                </p>
              </div>

              {/* RUC del negocio */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RUC del negocio
                </label>
                <input
                  type="text"
                  value={businessRuc || "No hay RUC configurado"}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 text-sm cursor-not-allowed"
                />
              </div>

              {/* Input de archivo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificado digital (.p12)
                </label>
                <input
                  id="certificado-file"
                  type="file"
                  accept=".p12"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#9098f8] file:text-white hover:file:bg-[#7a82e8] file:cursor-pointer cursor-pointer"
                />
                {certificadoFile && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ Archivo seleccionado: {certificadoFile.name}
                  </p>
                )}
              </div>

              {/* Input de contraseña */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña del certificado
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese la contraseña"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#9098f8] focus:ring-2 focus:ring-[#9098f8]/20 text-sm"
                />
              </div>

              {/* Botones de registrar y eliminar */}
              <div className="mb-6 flex gap-4">
                <button
                  onClick={handleRegistrarFirma}
                  disabled={
                    loadingFirma ||
                    !businessRuc ||
                    !certificadoFile ||
                    !password.trim()
                  }
                  className="px-6 py-2 bg-[#9098f8] hover:bg-[#7a82e8] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingFirma ? "Registrando..." : "Registrar Firma"}
                </button>

                <button
                  onClick={handleEliminarFirma}
                  disabled={loadingEliminar || !businessRuc}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    delete
                  </span>
                  {loadingEliminar ? "Eliminando..." : "Eliminar Firma"}
                </button>
              </div>

              {/* Respuesta de registro */}
              {responseFirma && (
                <div
                  className={`rounded-xl p-4 border ${
                    isSuccessFirma
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-lg ${
                        isSuccessFirma ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {responseFirma.status}
                    </span>
                    <span className="text-gray-400">•</span>
                    <p
                      className={`${
                        isSuccessFirma ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {responseFirma.message}
                    </p>
                  </div>
                  {responseFirma.data && (
                    <p className="mt-2 text-sm text-gray-600">
                      Archivo registrado:{" "}
                      <span className="text-gray-900 font-mono">
                        {responseFirma.data}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Respuesta de eliminación */}
              {responseEliminar && (
                <div
                  className={`rounded-xl p-4 border mt-4 ${
                    isSuccessEliminar
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-lg ${
                        isSuccessEliminar ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {responseEliminar.status}
                    </span>
                    <span className="text-gray-400">•</span>
                    <p
                      className={`${
                        isSuccessEliminar ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {responseEliminar.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
