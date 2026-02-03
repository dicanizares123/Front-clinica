"use client";

import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import HomeLayout from "@/app/components/layout/HomeLayout";
import { useState } from "react";
import {
  crearFacturaElectronica,
  generarSecuencial,
  marcarEstadoSecuencial,
} from "@/api/apiOlimpSri";
import {
  ResponseCrearFactura,
  InvoicePayload,
  InvoiceDetail,
} from "@/interfaces/ResponseCrearFactura";

// Tipos de identificación del comprador
const BUYER_ID_TYPES = [
  { code: "04", label: "RUC" },
  { code: "05", label: "Cédula" },
  { code: "06", label: "Pasaporte" },
  { code: "07", label: "Consumidor Final" },
  { code: "08", label: "Identificación del Exterior" },
];

// Tarifas de IVA
const IVA_TARIFFS = [
  { code: "0", label: "0% (No objeto de IVA)", rate: 0 },
  { code: "2", label: "12% IVA", rate: 0.12 },
  { code: "3", label: "14% IVA", rate: 0.14 },
  { code: "4", label: "15% IVA", rate: 0.15 },
  { code: "5", label: "5% IVA", rate: 0.05 },
  { code: "6", label: "Exento de IVA", rate: 0 },
  { code: "8", label: "8% IVA", rate: 0.08 },
];

// Formas de pago
const PAYMENT_METHODS = [
  { code: "01", label: "Sin utilización del sistema financiero" },
  { code: "15", label: "Compensación de deudas" },
  { code: "16", label: "Tarjeta de débito" },
  { code: "17", label: "Dinero electrónico" },
  { code: "18", label: "Tarjeta prepago" },
  { code: "19", label: "Tarjeta de crédito" },
  { code: "20", label: "Otros con utilización del sistema financiero" },
];

interface BackendProduct {
  id: number;
  description: string;
  code: string;
  unit_price: string;
}

export default function InvoicePage() {
  const [loading, setLoading] = useState(false);
  const [loadingSecuencial, setLoadingSecuencial] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [response, setResponse] = useState<ResponseCrearFactura | null>(null);
  const [sequentialId, setSequentialId] = useState<number | null>(null);
  const [sequentialReused, setSequentialReused] = useState(false);

  // Cantidad del producto (citas médicas)
  const [productQuantity, setProductQuantity] = useState(1);
  const [productDiscount, setProductDiscount] = useState(0);

  // Datos del emisor
  const [socialReason, setSocialReason] = useState(
    "ALMEIDA CERDA MARIA ISABEL",
  );
  const [commercialName, setCommercialName] = useState(
    "CENTRO PSICOLOGICO ATREVETE",
  );
  const [mainAddress, setMainAddress] = useState(
    "SAN ISIDRO DEL INCA DE LOS MADROÑOS E14-118 Y LA GROSELLAS",
  );
  const [establishmentCode, setEstablishmentCode] = useState("001");
  const [pointCode, setPointCode] = useState("001");
  const [sequentialDocument, setSequentialDocument] = useState("");
  const [establishmentAddress, setEstablishmentAddress] = useState(
    "SAN ISIDRO DEL INCA DE LOS MADROÑOS E14-118 Y LA GROSELLAS",
  );
  const [hasRequiredAccounting, setHasRequiredAccounting] = useState("NO");

  // Datos del comprador
  const [buyerIdType, setBuyerIdType] = useState("05");
  const [buyerIdNumber, setBuyerIdNumber] = useState("");
  const [buyerSocialReason, setBuyerSocialReason] = useState("");
  const [buyerAddress, setBuyerAddress] = useState(
    "TUMBACO FCO ORELLANA OE3 242 Y RODRIGO DE NUNEZ",
  );
  const [buyerEmail, setBuyerEmail] = useState("");

  // Forma de pago
  const [paymentMethodType, setPaymentMethodType] = useState("01");
  const [paymentTerm, setPaymentTerm] = useState("0");

  // Obtener datos del usuario
  const { data: userData } = useSWR("/auth/users/me/", fetcher);

  // Obtener RUC del negocio
  const { data: businessRucData } = useSWR("/api/business/ruc/", fetcher);
  const businessRuc = businessRucData?.data?.ruc || null;

  // Obtener productos disponibles (citas médicas)
  const { data: productsData } = useSWR<BackendProduct[]>(
    "/api/productos/",
    fetcher,
  );
  const defaultProduct = productsData?.[0] || null;

  // Cálculos del producto
  const productUnitValue = defaultProduct
    ? parseFloat(defaultProduct.unit_price)
    : 0;
  const productSubtotal = productUnitValue * productQuantity - productDiscount;
  const productIvaRate = 0.15; // 15% IVA
  const productIva = productSubtotal * productIvaRate;
  const totalSubtotal = productSubtotal;
  const totalIva = productIva;
  const totalFinal = totalSubtotal + totalIva;

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

  // Obtener fecha actual en formato dd/mm/yyyy
  const getCurrentDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Generar secuencial
  const handleGenerarSecuencial = async () => {
    setLoadingSecuencial(true);
    try {
      const result = await generarSecuencial();
      if (result.sequential) {
        setSequentialDocument(result.sequential);
        setSequentialId(result.sequential_id);
        setSequentialReused(result.reused);
      } else {
        alert("Error al generar secuencial");
      }
    } catch (err) {
      console.error("Error al generar secuencial:", err);
      alert("Error al generar secuencial");
    } finally {
      setLoadingSecuencial(false);
    }
  };

  // Limpiar secuencial para nueva factura
  const resetSecuencial = () => {
    setSequentialDocument("");
    setSequentialId(null);
    setSequentialReused(false);
  };

  // Buscar paciente por cédula
  const handleSearchPatient = async () => {
    if (!buyerIdNumber || buyerIdNumber.length < 10) {
      alert("Ingrese una cédula válida (mínimo 10 dígitos)");
      return;
    }

    setLoadingPatient(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/patients/by_document/${buyerIdNumber}/`,
      );
      if (res.ok) {
        const data = await res.json();
        const patient = data.data || data;

        // Construir nombre completo
        const fullName =
          `${patient.first_names || ""} ${patient.last_names || ""}`.trim();
        setBuyerSocialReason(fullName);

        if (patient.email) {
          setBuyerEmail(patient.email);
        }
      } else {
        alert("Paciente no encontrado");
      }
    } catch (error) {
      console.error("Error buscando paciente:", error);
      alert("Error al buscar paciente");
    } finally {
      setLoadingPatient(false);
    }
  };

  // Enviar factura
  const handleSubmit = async () => {
    if (!businessRuc?.trim()) {
      alert("No hay RUC configurado para el negocio");
      return;
    }

    if (!sequentialDocument || !sequentialId) {
      alert("Debe generar un secuencial antes de crear la factura");
      return;
    }

    if (!buyerIdNumber.trim() || !buyerSocialReason.trim()) {
      alert("Complete los datos del cliente");
      return;
    }

    if (!defaultProduct) {
      alert("No hay producto configurado para facturar");
      return;
    }

    if (productQuantity <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const details: InvoiceDetail[] = [
        {
          description: defaultProduct.description,
          mainCode: defaultProduct.code,
          unitValue: productUnitValue,
          amount: productQuantity,
          discount: productDiscount,
          tariffCodeIva: "4", // 15% IVA
        },
      ];

      const invoicePayload: InvoicePayload = {
        taxAuthorityInfo: {
          socialReason: socialReason || "Mi Empresa",
          commercialName: commercialName || "Mi Empresa",
          ruc: businessRuc,
          establishmentCode: establishmentCode.padStart(3, "0"),
          pointCode: pointCode.padStart(3, "0"),
          sequentialDocument: sequentialDocument.padStart(9, "0"),
          mainAddress: mainAddress || "Ecuador",
        },
        invoiceInfo: {
          emissionDate: getCurrentDate(),
          establishmentAddress:
            establishmentAddress || mainAddress || "Ecuador",
          hasRequiredAccounting: hasRequiredAccounting,
          buyerIdType: buyerIdType,
          buyerIdNumber: buyerIdNumber,
          buyerSocialReason: buyerSocialReason,
          buyerAddress: buyerAddress || "Ecuador",
          buyerEmail: buyerEmail || undefined,
        },
        details: details,
        paymentMethods: [
          {
            type: paymentMethodType,
            total: totalFinal,
            timeUnit: "dias",
            paymentTerm: paymentTerm,
          },
        ],
      };

      const result = await crearFacturaElectronica(invoicePayload);
      setResponse(result);

      // Manejar estado del secuencial según la respuesta
      const isAuthorizedResult =
        result.data?.authorization?.status === "AUTORIZADO";
      const statusCode = result.code;

      if (isAuthorizedResult || statusCode === 200) {
        // Factura exitosa: marcar secuencial como usado
        await marcarEstadoSecuencial(sequentialId, "used");
        // Limpiar para nueva factura
        resetSecuencial();
      } else if (statusCode === 400 || statusCode === 409) {
        // Error 400/409: marcar como disponible para reutilizar
        // 400 = datos inválidos, 409 = firma no registrada u otro conflicto
        await marcarEstadoSecuencial(sequentialId, "available");
        resetSecuencial();
      }
    } catch (err: any) {
      console.error("Error al crear factura:", err);
      // En caso de error de red, marcar como disponible
      if (sequentialId) {
        await marcarEstadoSecuencial(sequentialId, "available");
        resetSecuencial();
      }
    } finally {
      setLoading(false);
    }
  };

  // Descargar PDF
  const downloadPdf = () => {
    if (response?.data?.authorization?.pdfBase64) {
      const linkSource = `data:application/pdf;base64,${response.data.authorization.pdfBase64}`;
      const downloadLink = document.createElement("a");
      const fileName = `factura_${response.data.authorization.keyAccess}.pdf`;

      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    }
  };

  const isSuccess = response?.status === "OK" || response?.code === 200;
  const isAuthorized = response?.data?.authorization?.status === "AUTORIZADO";

  return (
    <HomeLayout user={user}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-text-light dark:text-text-dark text-2xl font-bold leading-tight">
              Crear Factura Electrónica
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Genera y autoriza facturas electrónicas en el SRI.
            </p>
          </div>
        </div>

        {/* Datos del Emisor */}
        <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-[#323a46]">
          <h2 className="text-text-light text-lg font-bold mb-4">
            Datos del Emisor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* RUC */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                RUC del Emisor
              </label>
              <input
                type="text"
                value={businessRuc || "No hay RUC configurado"}
                disabled
                className="w-full px-4 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
              />
            </div>

            {/* Razón Social */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Razón Social *
              </label>
              <input
                type="text"
                value={socialReason}
                disabled
                className="w-full px-4 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
              />
            </div>

            {/* Nombre Comercial */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Nombre Comercial
              </label>
              <input
                type="text"
                value={commercialName}
                disabled
                className="w-full px-4 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
              />
            </div>

            {/* Dirección Matriz */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Dirección Matriz *
              </label>
              <input
                type="text"
                value={mainAddress}
                disabled
                className="w-full px-4 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
              />
            </div>

            {/* Código Establecimiento */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Cód. Establecimiento
              </label>
              <input
                type="text"
                value={establishmentCode}
                disabled
                className="w-full px-4 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
              />
            </div>

            {/* Punto de Emisión */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Punto de Emisión
              </label>
              <input
                type="text"
                value={pointCode}
                disabled
                className="w-full px-4 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
              />
            </div>

            {/* Secuencial */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Secuencial *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sequentialDocument}
                  disabled
                  placeholder="Generar secuencial"
                  className="flex-1 px-4 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
                />
                <button
                  onClick={handleGenerarSecuencial}
                  disabled={loadingSecuencial || !!sequentialDocument}
                  className="px-4 py-2 bg-primary-light hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  {loadingSecuencial ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <span className="material-symbols-outlined text-lg">
                      add
                    </span>
                  )}
                  {sequentialDocument ? "Generado" : "Generar"}
                </button>
              </div>
              {sequentialReused && (
                <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    refresh
                  </span>
                  Secuencial reutilizado (previamente fallido)
                </p>
              )}
            </div>

            {/* Dirección Establecimiento */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Dirección Establecimiento
              </label>
              <input
                type="text"
                value={establishmentAddress}
                disabled
                className="w-full px-4 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
              />
            </div>

            {/* Obligado Contabilidad */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Obligado Contabilidad
              </label>
              <input
                type="text"
                value={hasRequiredAccounting}
                disabled
                className="w-full px-4 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Datos del Cliente */}
        <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-[#323a46]">
          <h2 className="text-text-light text-lg font-bold mb-4">
            Datos del Cliente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tipo de Identificación */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Tipo de Identificación *
              </label>
              <select
                value={buyerIdType}
                onChange={(e) => setBuyerIdType(e.target.value)}
                className="w-full px-4 py-2 bg-[#1a1f2e] border border-[#323a46] rounded-lg text-text-light focus:outline-none focus:border-primary-light text-sm"
              >
                {BUYER_ID_TYPES.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Número de Identificación */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Número de Identificación *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={buyerIdNumber}
                  onChange={(e) => setBuyerIdNumber(e.target.value)}
                  placeholder="Cédula o RUC del cliente"
                  maxLength={13}
                  className="flex-1 px-4 py-2 bg-[#1a1f2e] border border-[#323a46] rounded-lg text-text-light placeholder-gray-500 focus:outline-none focus:border-primary-light text-sm"
                />
                <button
                  onClick={handleSearchPatient}
                  disabled={
                    loadingPatient ||
                    !buyerIdNumber ||
                    buyerIdNumber.length < 10
                  }
                  className="px-3 py-2 bg-primary-light hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  title="Buscar paciente"
                >
                  {loadingPatient ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <span className="material-symbols-outlined text-lg">
                      search
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Razón Social Cliente */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Nombre / Razón Social *
              </label>
              <input
                type="text"
                value={buyerSocialReason}
                onChange={(e) => setBuyerSocialReason(e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full px-4 py-2 bg-[#1a1f2e] border border-[#323a46] rounded-lg text-text-light placeholder-gray-500 focus:outline-none focus:border-primary-light text-sm"
              />
            </div>

            {/* Dirección Cliente */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={buyerAddress}
                onChange={(e) => setBuyerAddress(e.target.value)}
                placeholder="Dirección del cliente"
                className="w-full px-4 py-2 bg-[#1a1f2e] border border-[#323a46] rounded-lg text-text-light placeholder-gray-500 focus:outline-none focus:border-primary-light text-sm"
              />
            </div>

            {/* Email Cliente */}
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Email (opcional)
              </label>
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
                className="w-full px-4 py-2 bg-[#1a1f2e] border border-[#323a46] rounded-lg text-text-light placeholder-gray-500 focus:outline-none focus:border-primary-light text-sm"
              />
            </div>
          </div>
        </div>

        {/* Productos/Servicios */}
        <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-[#323a46]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-text-light text-lg font-bold">
              Servicio a Facturar
            </h2>
          </div>

          {!defaultProduct ? (
            <div className="flex items-center justify-center py-8 text-text-secondary-light">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-light mr-3"></div>
              Cargando producto...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#323a46]">
                      <th className="text-left text-text-secondary-light text-sm font-medium py-3 px-2">
                        Descripción
                      </th>
                      <th className="text-left text-text-secondary-light text-sm font-medium py-3 px-2 w-24">
                        Código
                      </th>
                      <th className="text-right text-text-secondary-light text-sm font-medium py-3 px-2 w-24">
                        Cantidad
                      </th>
                      <th className="text-right text-text-secondary-light text-sm font-medium py-3 px-2 w-28">
                        P. Unitario
                      </th>
                      <th className="text-right text-text-secondary-light text-sm font-medium py-3 px-2 w-24">
                        Descuento
                      </th>
                      <th className="text-left text-text-secondary-light text-sm font-medium py-3 px-2 w-32">
                        IVA
                      </th>
                      <th className="text-right text-text-secondary-light text-sm font-medium py-3 px-2 w-28">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#323a46]/50">
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={defaultProduct.description}
                          disabled
                          className="w-full px-3 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={defaultProduct.code}
                          disabled
                          className="w-full px-3 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={productQuantity}
                          onChange={(e) =>
                            setProductQuantity(parseInt(e.target.value) || 1)
                          }
                          min="1"
                          className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#323a46] rounded-lg text-text-light text-right focus:outline-none focus:border-primary-light text-sm"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={`$${productUnitValue.toFixed(2)}`}
                          disabled
                          className="w-full px-3 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-right text-sm cursor-not-allowed"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={productDiscount}
                          onChange={(e) =>
                            setProductDiscount(parseFloat(e.target.value) || 0)
                          }
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#323a46] rounded-lg text-text-light text-right focus:outline-none focus:border-primary-light text-sm"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value="15% IVA"
                          disabled
                          className="w-full px-3 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
                        />
                      </td>
                      <td className="py-2 px-2 text-right text-text-light font-medium">
                        ${productSubtotal.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="flex justify-end mt-4">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-text-secondary-light text-sm">
                    <span>Subtotal:</span>
                    <span>${totalSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary-light text-sm">
                    <span>IVA (15%):</span>
                    <span>${totalIva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-text-light font-bold text-lg border-t border-[#323a46] pt-2">
                    <span>Total:</span>
                    <span>${totalFinal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Forma de Pago */}
        <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-[#323a46]">
          <h2 className="text-text-light text-lg font-bold mb-4">
            Forma de Pago
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Método de Pago
              </label>
              <select
                value={paymentMethodType}
                onChange={(e) => setPaymentMethodType(e.target.value)}
                className="w-full px-4 py-2 bg-[#1a1f2e] border border-[#323a46] rounded-lg text-text-light focus:outline-none focus:border-primary-light text-sm"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.code} value={method.code}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Plazo (días)
              </label>
              <input
                type="number"
                value={paymentTerm}
                onChange={(e) => setPaymentTerm(e.target.value)}
                min="0"
                className="w-full px-4 py-2 bg-[#1a1f2e] border border-[#323a46] rounded-lg text-text-light focus:outline-none focus:border-primary-light text-sm"
              />
            </div>

            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Monto
              </label>
              <input
                type="text"
                value={`$${totalFinal.toFixed(2)}`}
                disabled
                className="w-full px-4 py-2 bg-gray-600/50 border border-[#323a46] rounded-lg text-gray-400 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Botón de crear */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading || !businessRuc}
            className="px-8 py-3 bg-primary-light hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">receipt_long</span>
                Crear Factura
              </>
            )}
          </button>

          {isAuthorized && (
            <button
              onClick={downloadPdf}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">download</span>
              Descargar PDF
            </button>
          )}
        </div>

        {/* Estado de respuesta */}
        {response && (
          <div
            className={`rounded-xl p-4 border ${
              isSuccess && isAuthorized
                ? "bg-green-500/10 border-green-500"
                : "bg-red-500/10 border-red-500"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`font-bold text-lg ${
                  isSuccess && isAuthorized ? "text-green-500" : "text-red-500"
                }`}
              >
                {response.data?.authorization?.status || response.status}
              </span>
              <span className="text-gray-400">•</span>
              <p
                className={`${
                  isSuccess && isAuthorized ? "text-green-400" : "text-red-400"
                }`}
              >
                {response.data?.message || response.message}
              </p>
            </div>

            {isAuthorized && response.data?.authorization && (
              <div className="mt-4 space-y-2 text-sm text-text-secondary-light">
                <p>
                  <span className="font-medium text-text-light">
                    Clave de Acceso:
                  </span>{" "}
                  <span className="font-mono">
                    {response.data.authorization.keyAccess}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-text-light">
                    Número de Autorización:
                  </span>{" "}
                  <span className="font-mono">
                    {response.data.authorization.authorizationNumber}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-text-light">Ambiente:</span>{" "}
                  {response.data.authorization.environment}
                </p>
                <p>
                  <span className="font-medium text-text-light">
                    Fecha de Autorización:
                  </span>{" "}
                  {new Date(
                    response.data.authorization.authorizationDate,
                  ).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </HomeLayout>
  );
}
