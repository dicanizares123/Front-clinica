import ResponseValidateEstablishment from "@/interfaces/ResponseValidateEstablishment";
import ResponseValidateRuc from "@/interfaces/ResponseValidateRuc";
import axios from "axios";

const API_OLIMP_URL = "https://test-facturacion.olimpush.com";
const API_TOKEN_OLIMP = `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN_OLIMP}`; 

/**
 * Valida si el RUC existe el SRI
 * @param ruc 
 * @returns 
 */


export const validateRucSRI = async (ruc: string): Promise<ResponseValidateRuc> => {
    try {
        const response = await axios.get(`${API_OLIMP_URL}/apifacturacion/v2/facturadorelectronico/ruc/${ruc}/validation`,{
            headers: {
                Authorization: API_TOKEN_OLIMP
            }
        })

        return response.data
    } catch (error) {
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
        const response = await axios.get(`${API_OLIMP_URL}/apifacturacion/v2/facturadorelectronico/ruc/${ruc}/establishments`, {
            headers: {
                Authorization: API_TOKEN_OLIMP
            }
        })
        return response.data
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}