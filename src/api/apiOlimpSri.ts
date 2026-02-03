import { ResponseContributorDetails } from "@/interfaces/ResponseContributorDetails";
import ResponseValidateEstablishment from "@/interfaces/ResponseValidateEstablishment";
import ResponseValidateRuc from "@/interfaces/ResponseValidateRuc";
import { ResponseContributor } from "@/interfaces/ResponseContributor";
import { ResponseRegistrarFirma } from "@/interfaces/ResponseRegistrarFirma";
import { ResponseCrearFactura, InvoicePayload } from "@/interfaces/ResponseCrearFactura";
import { ResponseSuscripcion } from "@/interfaces/ResponseSuscripcion";
import axios from "axios";
import Cookies from "js-cookie";

/**
 * Requiere autenticacion para usar los servicios del SRI
 */

const API_DJANGO_BASE_URL = "http://localhost:8000";

/**
 * Obtiene el token de acceso de las cookies
 * @returns {string | undefined} El token de acceso o undefined
 */
const getAccessToken = (): string | undefined => {
  return Cookies.get("accessToken");
};

/**
 * Crea los headers con autenticación
 * @returns {Object} Headers con el token de acceso
 */
const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Valida si el RUC existe en el SRI
 * @param ruc 
 * @returns 
 */
export const validateRucSRI = async (ruc: string): Promise<ResponseValidateRuc> => {
    try {
        const response = await axios.get(
            `${API_DJANGO_BASE_URL}/api/olimpush/ruc/${ruc}/validation/`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error: any) {
        // Si el servidor responde con error pero tiene data (400, 404, etc.)
        if (error.response && error.response.data) {
            return error.response.data;
        }
        console.error("Error:", error);
        throw error;
    }
}  

/**
 * Valida los establecimientos de un RUC existente en el SRI
 * @param ruc 
 * @returns 
 */
export const validateEstablishmentSRI = async (ruc: string): Promise<ResponseValidateEstablishment> => {
    try {
        const response = await axios.get(
            `${API_DJANGO_BASE_URL}/api/olimpush/ruc/${ruc}/establishments/`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error: any) {
        // Si el servidor responde con error pero tiene data (400, 404, etc.)
        if (error.response && error.response.data) {
            return error.response.data;
        }
        console.error("Error:", error);
        throw error;
    }
} 

/**
 * Consulta informacion mas detalla del contrubuyente por RUC
 * @param ruc
 */ 
export const getContributorDetailsSRI = async (ruc: string): Promise<ResponseContributorDetails> => {

    try {   

        const response = await axios.get(
            `${API_DJANGO_BASE_URL}/api/olimpush/ruc/${ruc}/`,
            { headers: getAuthHeaders() }
        );
        return response.data;

    }catch (error: any) {
        // Si el servidor responde con error pero tiene data (400, 404, etc.)
        if (error.response && error.response.data) {
            return error.response.data;
        }
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Consulta un contribuyente registrado en Olimpush
 * @param ruc
 */ 
export const consultarContribuyenteOlimpush = async (ruc: string): Promise<ResponseContributor> => {
    try {
        const response = await axios.get(
            `${API_DJANGO_BASE_URL}/api/olimpush/contribuyentes/${ruc}/`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error: any) {
        // Si el servidor responde con error pero tiene data (400, 404, etc.)
        if (error.response && error.response.data) {
            return error.response.data;
        }
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Registra la firma electrónica de un contribuyente
 * @param ruc
 * @param certificadoFile
 * @param password
 */ 
export const registrarFirmaElectronica = async (
    ruc: string,
    certificadoFile: File,
    password: string
): Promise<ResponseRegistrarFirma> => {
    try {
        const formData = new FormData();
        formData.append("firma", certificadoFile);
        formData.append("password", password);

        const response = await axios.post(
            `${API_DJANGO_BASE_URL}/api/olimpush/contribuyentes/${ruc}/certificado/`,
            formData,
            { 
                headers: {
                    ...getAuthHeaders(),
                    // No establecer Content-Type, axios lo hace automáticamente para FormData
                }
            }
        );
        return response.data;
    } catch (error: any) {
        // Si el servidor responde con error pero tiene data (400, 404, etc.)
        if (error.response && error.response.data) {
            return error.response.data;
        }
        console.error("Error:", error);
        throw error;
    }
} 

/**
 * Crea una factura electrónica y la envía al SRI para autorización
 * @param invoicePayload Datos de la factura
 * @returns Respuesta con la factura autorizada o error
 */
export const crearFacturaElectronica = async (
    invoicePayload: InvoicePayload
): Promise<ResponseCrearFactura> => {
    try {
        const requestData = {
            origin: "NextJS",
            usrRequest: "Centro Psicologico Atrevete",
            ipRequest: "190.12.12.12",
            transactionIde: crypto.randomUUID(),
            payload: invoicePayload
        };

        const response = await axios.post(
            `${API_DJANGO_BASE_URL}/api/olimpush/facturas/crear/`,
            requestData,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error: any) {
        // Si el servidor responde con error pero tiene data (400, 404, etc.)
        if (error.response && error.response.data) {
            return error.response.data;
        }
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Elimina la firma electrónica de un contribuyente
 * ⚠️ Acción irreversible: Una vez eliminado, será necesario registrar un nuevo certificado
 * @param ruc RUC del contribuyente
 * @returns Respuesta con el resultado de la eliminación
 */
export const eliminarFirmaElectronica = async (ruc: string): Promise<ResponseRegistrarFirma> => {
    try {
        const response = await axios.delete(
            `${API_DJANGO_BASE_URL}/api/olimpush/contribuyentes/${ruc}/certificado/delete/`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error: any) {
        // Si el servidor responde con error pero tiene data (400, 404, etc.)
        if (error.response && error.response.data) {
            return error.response.data;
        }
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Consulta la suscripción actual del usuario en Olimpush
 * @returns Información de la suscripción incluyendo documentos disponibles y tipos autorizados
 */
export const consultarSuscripcionOlimpush = async (): Promise<ResponseSuscripcion> => {
    try {
        const response = await axios.get(
            `${API_DJANGO_BASE_URL}/api/olimpush/suscripcion/actual/`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error: any) {
        // Si el servidor responde con error pero tiene data (400, 404, etc.)
        if (error.response && error.response.data) {
            return error.response.data;
        }
        console.error("Error:", error);
        throw error;
    }
}

// ==================== SECUENCIALES ====================

export interface ResponseGenerarSecuencial {
    sequential: string;
    sequential_id: number;
    status: 'pending' | 'available' | 'used';
    reused: boolean;
    message: string;
}

export interface ResponseMarcarSecuencial {
    message?: string;
    error?: string;
    sequential: string;
    status?: string;
    current_status?: string;
}

/**
 * Genera un nuevo secuencial o reutiliza uno disponible
 * @returns Información del secuencial generado
 */
export const generarSecuencial = async (): Promise<ResponseGenerarSecuencial> => {
    try {
        const response = await axios.post(
            `${API_DJANGO_BASE_URL}/api/secuencial/generar/`,
            {},
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        console.error("Error:", error);
        throw error;
    }
}

/**
 * Marca el estado de un secuencial
 * @param sequentialId ID del secuencial
 * @param status Estado a asignar: 'available' (para reutilizar) o 'used' (usado exitosamente)
 * @returns Respuesta con el resultado de la actualización
 */
export const marcarEstadoSecuencial = async (
    sequentialId: number, 
    status: 'available' | 'used'
): Promise<ResponseMarcarSecuencial> => {
    try {
        const response = await axios.post(
            `${API_DJANGO_BASE_URL}/api/secuencial/marcar-estado/`,
            {
                sequential_id: sequentialId,
                status: status
            },
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        console.error("Error:", error);
        throw error;
    }
}
