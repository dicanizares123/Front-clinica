"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import HomeLayout from "@/app/components/layout/HomeLayout";
import Cookies from "js-cookie";

// Interfaces para la respuesta de facturas
interface InvoiceHistory {
  type: string;
  description: string;
  createAt: string;
}

interface TaxAuthorityInfo {
  environmentType: string;
  emissionType: string;
  socialReason: string;
  commercialName: string;
  ruc: string;
  keyAccess: string;
  documentType: string;
  pointCode: string;
  establishmentCode: string;
  sequentialDocument: string;
  mainAddress: string;
  retentionAgent: string | null;
  rimpeContributor: string | null;
}

interface InvoiceInfo {
  emissionDate: string;
  establishmentAddress: string;
  hasRequiredAccounting: string;
  specialTaxpayer: string | null;
  remissionGuideNumber: string | null;
  buyerIdType: string;
  buyerIdNumber: string;
  buyerSocialReason: string;
  buyerAddress: string;
  buyerEmail: string;
  subtotal: number;
  totalIva: number;
  discountTotal: number;
  tipAmount: number;
  totalAmount: number;
}

interface InvoiceDetail {
  description: string;
  amount: number;
  additionalAttributes: { attribute: string; value: string }[] | null;
  mainCode: string;
  auxiliaryCode: string | null;
  unitValue: number;
  discount: number;
  tariffCodeIva: string;
  valueIva: number;
  subtotal: number;
  total: number;
}

interface PaymentMethod {
  type: string;
  total: number;
  paymentTerm: string;
  timeUnit: string;
}

interface InvoiceDocument {
  taxAuthorityInfo: TaxAuthorityInfo;
  invoiceInfo: InvoiceInfo;
  details: InvoiceDetail[];
  paymentMethods: PaymentMethod[];
  additionalAttributes: { attribute: string; value: string }[] | null;
}

interface Invoice {
  ruc: string;
  authorizationStatus: string | null;
  authorizationDate: string | null;
  document: InvoiceDocument;
  histories: InvoiceHistory[];
}

interface PageInfo {
  totalPages: number;
  numElementsByPage: number;
  currentPage: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface InvoicesResponse {
  code: number;
  status: string;
  message: string;
  data: {
    listData: Invoice[];
    page: PageInfo;
  };
}

// Mapeo de tipos de identificación
const ID_TYPE_MAP: Record<string, string> = {
  "04": "RUC",
  "05": "Cédula",
  "06": "Pasaporte",
  "07": "Consumidor Final",
  "08": "Identificación del Exterior",
};

// Mapeo de formas de pago
const PAYMENT_TYPE_MAP: Record<string, string> = {
  "01": "Sin utilización del sistema financiero",
  "15": "Compensación de deudas",
  "16": "Tarjeta de débito",
  "17": "Dinero electrónico",
  "18": "Tarjeta prepago",
  "19": "Tarjeta de crédito",
  "20": "Otros con utilización del sistema financiero",
};

export default function ViewInvoicesPage() {
  const [page, setPage] = useState(1);
  const [customerIde, setCustomerIde] = useState("");
  const [authorizationStatus, setAuthorizationStatus] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Función para consultar facturas
  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (businessRuc) params.append("ruc", businessRuc);
      params.append("page", page.toString());
      if (customerIde.trim()) params.append("customer_ide", customerIde.trim());
      if (authorizationStatus)
        params.append("authorization_status", authorizationStatus);

      const token = Cookies.get("accessToken");
      const response = await fetch(
        `http://localhost:8000/api/olimpush/facturas/?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data: InvoicesResponse = await response.json();

      if (data.code === 200 && data.data) {
        // Ordenar por fecha de creación descendente (más recientes primero)
        const sortedInvoices = [...data.data.listData].sort((a, b) => {
          const dateA = a.histories[0]?.createAt || "";
          const dateB = b.histories[0]?.createAt || "";
          return dateB.localeCompare(dateA);
        });
        setInvoices(sortedInvoices);
        setPageInfo(data.data.page);
      } else {
        setError(data.message || "Error al obtener facturas");
        setInvoices([]);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError("Error de conexión al servidor");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar facturas cuando cambia la página o el RUC
  useEffect(() => {
    if (businessRuc) {
      fetchInvoices();
    }
  }, [businessRuc, page]);

  // Buscar con filtros
  const handleSearch = () => {
    setPage(1);
    fetchInvoices();
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setCustomerIde("");
    setAuthorizationStatus("");
    setPage(1);
    fetchInvoices();
  };

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString.replace(" ", "T"));
      return date.toLocaleDateString("es-EC", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Obtener color del estado
  const getStatusColor = (status: string | null) => {
    if (status === "AUTORIZADO") return "text-green-400 bg-green-500/10";
    if (status === "NO AUTORIZADO" || status === "DEVUELTA")
      return "text-red-400 bg-red-500/10";
    return "text-yellow-400 bg-yellow-500/10";
  };

  // Obtener color del historial
  const getHistoryColor = (type: string) => {
    if (type === "OK") return "text-green-400";
    if (type === "ERROR") return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <HomeLayout user={user}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-text-light dark:text-text-dark text-2xl font-bold leading-tight">
              Historial de Facturas
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Consulta las facturas electrónicas emitidas
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-surface-dark p-4 rounded-xl shadow-lg border border-[#323a46]">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Filtro por cédula/RUC del cliente */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-text-light text-sm font-medium mb-2">
                Identificación del Cliente
              </label>
              <input
                type="text"
                value={customerIde}
                onChange={(e) => setCustomerIde(e.target.value)}
                placeholder="Cédula o RUC del cliente"
                className="w-full px-4 py-2 bg-[#1a1f2e] border border-[#323a46] rounded-lg text-text-light placeholder-gray-500 focus:outline-none focus:border-primary-light text-sm"
              />
            </div>

            {/* Filtro por estado */}
            <div className="w-48">
              <label className="block text-text-light text-sm font-medium mb-2">
                Estado de Autorización
              </label>
              <select
                value={authorizationStatus}
                onChange={(e) => setAuthorizationStatus(e.target.value)}
                className="w-full px-4 py-2 bg-[#1a1f2e] border border-[#323a46] rounded-lg text-text-light focus:outline-none focus:border-primary-light text-sm"
              >
                <option value="">Todos</option>
                <option value="AUTORIZADO">Autorizado</option>
                <option value="NO AUTORIZADO">No Autorizado</option>
              </select>
            </div>

            {/* Botones */}
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-primary-light hover:bg-primary-dark text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  search
                </span>
                Buscar
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex gap-6">
          {/* Lista de facturas */}
          <div className="flex-1 bg-surface-dark rounded-xl shadow-lg border border-[#323a46] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-text-secondary-light">
                    Cargando facturas...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4 text-center">
                  <span className="material-symbols-outlined text-5xl text-error">
                    error
                  </span>
                  <p className="text-error">{error}</p>
                  <button
                    onClick={fetchInvoices}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4 text-center">
                  <span className="material-symbols-outlined text-5xl text-text-secondary-light">
                    receipt_long
                  </span>
                  <p className="text-text-secondary-light">
                    No hay facturas registradas
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Tabla */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1f2e]">
                      <tr>
                        <th className="text-left text-text-secondary-light text-sm font-medium py-3 px-4">
                          Clave de Acceso
                        </th>
                        <th className="text-left text-text-secondary-light text-sm font-medium py-3 px-4">
                          Secuencial
                        </th>
                        <th className="text-left text-text-secondary-light text-sm font-medium py-3 px-4">
                          Cliente
                        </th>
                        <th className="text-right text-text-secondary-light text-sm font-medium py-3 px-4">
                          Total
                        </th>
                        <th className="text-center text-text-secondary-light text-sm font-medium py-3 px-4">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice, index) => (
                        <tr
                          key={invoice.document.taxAuthorityInfo.keyAccess}
                          onClick={() => setSelectedInvoice(invoice)}
                          className={`border-t border-[#323a46]/50 cursor-pointer transition-colors ${
                            selectedInvoice?.document.taxAuthorityInfo
                              .keyAccess ===
                            invoice.document.taxAuthorityInfo.keyAccess
                              ? "bg-primary-light/10"
                              : "hover:bg-[#1a1f2e]/50"
                          }`}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs text-primary-light hover:text-primary-dark">
                              {invoice.document.taxAuthorityInfo.keyAccess.substring(
                                0,
                                20,
                              )}
                              ...
                            </span>
                          </td>
                          <td className="py-3 px-4 text-text-light text-sm">
                            {
                              invoice.document.taxAuthorityInfo
                                .sequentialDocument
                            }
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-text-light text-sm font-medium">
                                {invoice.document.invoiceInfo.buyerSocialReason}
                              </p>
                              <p className="text-text-secondary-light text-xs">
                                {invoice.document.invoiceInfo.buyerIdNumber}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-text-light font-medium">
                            $
                            {invoice.document.invoiceInfo.totalAmount.toFixed(
                              2,
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.authorizationStatus)}`}
                            >
                              {invoice.authorizationStatus || "PENDIENTE"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {pageInfo && pageInfo.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-[#323a46]">
                    <div className="text-sm text-text-secondary-light">
                      Página {pageInfo.currentPage} de {pageInfo.totalPages} (
                      {pageInfo.totalElements} facturas)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={pageInfo.first}
                        className="px-3 py-1 border border-[#323a46] rounded-lg hover:bg-[#1a1f2e] disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary-light"
                      >
                        <span className="material-symbols-outlined text-sm">
                          chevron_left
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(pageInfo.totalPages, p + 1))
                        }
                        disabled={pageInfo.last}
                        className="px-3 py-1 border border-[#323a46] rounded-lg hover:bg-[#1a1f2e] disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary-light"
                      >
                        <span className="material-symbols-outlined text-sm">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Panel de detalle */}
          {selectedInvoice && (
            <div className="w-[500px] bg-surface-dark rounded-xl shadow-lg border border-[#323a46] overflow-hidden flex flex-col max-h-[calc(100vh-200px)]">
              {/* Header del detalle */}
              <div className="p-4 border-b border-[#323a46] flex justify-between items-center bg-[#1a1f2e]">
                <h3 className="text-text-light font-bold">
                  Detalle de Factura
                </h3>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-text-secondary-light hover:text-text-light"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Contenido scrolleable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Estado */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInvoice.authorizationStatus)}`}
                  >
                    {selectedInvoice.authorizationStatus || "PENDIENTE"}
                  </span>
                  {selectedInvoice.authorizationDate && (
                    <span className="text-text-secondary-light text-xs">
                      {formatDate(selectedInvoice.authorizationDate)}
                    </span>
                  )}
                </div>

                {/* Clave de acceso */}
                <div>
                  <label className="text-text-secondary-light text-xs block mb-1">
                    Clave de Acceso
                  </label>
                  <p className="font-mono text-xs text-text-light break-all bg-[#1a1f2e] p-2 rounded">
                    {selectedInvoice.document.taxAuthorityInfo.keyAccess}
                  </p>
                </div>

                {/* Información del documento */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-text-secondary-light text-xs block mb-1">
                      Secuencial
                    </label>
                    <p className="text-text-light text-sm font-medium">
                      {
                        selectedInvoice.document.taxAuthorityInfo
                          .sequentialDocument
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-text-secondary-light text-xs block mb-1">
                      Fecha Emisión
                    </label>
                    <p className="text-text-light text-sm">
                      {selectedInvoice.document.invoiceInfo.emissionDate}
                    </p>
                  </div>
                  <div>
                    <label className="text-text-secondary-light text-xs block mb-1">
                      Establecimiento
                    </label>
                    <p className="text-text-light text-sm">
                      {
                        selectedInvoice.document.taxAuthorityInfo
                          .establishmentCode
                      }
                      -{selectedInvoice.document.taxAuthorityInfo.pointCode}
                    </p>
                  </div>
                  <div>
                    <label className="text-text-secondary-light text-xs block mb-1">
                      Ambiente
                    </label>
                    <p className="text-text-light text-sm">
                      {selectedInvoice.document.taxAuthorityInfo
                        .environmentType === "1"
                        ? "Pruebas"
                        : "Producción"}
                    </p>
                  </div>
                </div>

                {/* Datos del cliente */}
                <div className="border-t border-[#323a46] pt-4">
                  <h4 className="text-text-light font-medium mb-3">Cliente</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-text-secondary-light text-xs block">
                        Nombre / Razón Social
                      </label>
                      <p className="text-text-light text-sm">
                        {selectedInvoice.document.invoiceInfo.buyerSocialReason}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-text-secondary-light text-xs block">
                          Identificación
                        </label>
                        <p className="text-text-light text-sm">
                          {
                            ID_TYPE_MAP[
                              selectedInvoice.document.invoiceInfo.buyerIdType
                            ]
                          }
                          : {selectedInvoice.document.invoiceInfo.buyerIdNumber}
                        </p>
                      </div>
                      <div>
                        <label className="text-text-secondary-light text-xs block">
                          Email
                        </label>
                        <p className="text-text-light text-sm truncate">
                          {selectedInvoice.document.invoiceInfo.buyerEmail ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-text-secondary-light text-xs block">
                        Dirección
                      </label>
                      <p className="text-text-light text-sm">
                        {selectedInvoice.document.invoiceInfo.buyerAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalle de productos */}
                <div className="border-t border-[#323a46] pt-4">
                  <h4 className="text-text-light font-medium mb-3">
                    Productos/Servicios
                  </h4>
                  <div className="space-y-2">
                    {selectedInvoice.document.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="bg-[#1a1f2e] p-3 rounded-lg text-sm"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="text-text-light font-medium">
                            {detail.description}
                          </span>
                          <span className="text-text-light font-medium">
                            ${detail.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-text-secondary-light text-xs">
                          {detail.amount} x ${detail.unitValue.toFixed(2)} |
                          Desc: ${detail.discount.toFixed(2)} | IVA: $
                          {detail.valueIva.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totales */}
                <div className="border-t border-[#323a46] pt-4">
                  <h4 className="text-text-light font-medium mb-3">Totales</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary-light">
                        Subtotal:
                      </span>
                      <span className="text-text-light">
                        $
                        {selectedInvoice.document.invoiceInfo.subtotal.toFixed(
                          2,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary-light">
                        Descuento:
                      </span>
                      <span className="text-text-light">
                        $
                        {selectedInvoice.document.invoiceInfo.discountTotal.toFixed(
                          2,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary-light">IVA:</span>
                      <span className="text-text-light">
                        $
                        {selectedInvoice.document.invoiceInfo.totalIva.toFixed(
                          2,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#323a46] pt-2 font-bold">
                      <span className="text-text-light">TOTAL:</span>
                      <span className="text-primary-light text-lg">
                        $
                        {selectedInvoice.document.invoiceInfo.totalAmount.toFixed(
                          2,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Forma de pago */}
                <div className="border-t border-[#323a46] pt-4">
                  <h4 className="text-text-light font-medium mb-3">
                    Forma de Pago
                  </h4>
                  {selectedInvoice.document.paymentMethods.map(
                    (payment, idx) => (
                      <div
                        key={idx}
                        className="bg-[#1a1f2e] p-3 rounded-lg text-sm"
                      >
                        <p className="text-text-light">
                          {PAYMENT_TYPE_MAP[payment.type] || payment.type}
                        </p>
                        <p className="text-text-secondary-light text-xs">
                          ${payment.total.toFixed(2)} - Plazo:{" "}
                          {payment.paymentTerm} {payment.timeUnit}
                        </p>
                      </div>
                    ),
                  )}
                </div>

                {/* Historial */}
                <div className="border-t border-[#323a46] pt-4">
                  <h4 className="text-text-light font-medium mb-3">
                    Historial
                  </h4>
                  <div className="space-y-2">
                    {selectedInvoice.histories.map((history, idx) => (
                      <div
                        key={idx}
                        className="bg-[#1a1f2e] p-3 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-medium ${getHistoryColor(history.type)}`}
                          >
                            {history.type}
                          </span>
                          <span className="text-text-secondary-light text-xs">
                            {formatDate(history.createAt)}
                          </span>
                        </div>
                        <p className="text-text-secondary-light text-xs">
                          {history.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}
