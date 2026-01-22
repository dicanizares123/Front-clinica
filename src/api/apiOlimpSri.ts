import ResponseValidateEstablishment from "@/interfaces/ResponseValidateEstablishment";
import ResponseValidateRuc from "@/interfaces/ResponseValidateRuc";
import axios from "axios";

/**
 * Valida si el RUC existe en el SRI
 * Usa API Route como proxy para evitar problemas de CORS
 * @param ruc 
 * @returns 
 */
export const validateRucSRI = async (ruc: string): Promise<ResponseValidateRuc> => {
    try {
        const response = await axios.get(`/api/sri/validate-ruc/${ruc}`);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}  

/**
 * Valida los establecimientos de un RUC existente en el SRI
 * Usa API Route como proxy para evitar problemas de CORS
 * @param ruc 
 * @returns 
 */
export const validateEstablishmentSRI = async (ruc: string): Promise<ResponseValidateEstablishment> => {
    try {
        const response = await axios.get(`/api/sri/validate-establishments/${ruc}`);
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}