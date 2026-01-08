import wretch, { Wretch, WretchError } from "wretch";
import { AuthActions } from "./utils";
import { error } from "console";

// Extrae las funciones necesarias de la utilidad AuthActions
const { handleJWTRefresh, storeToken, getToken } = AuthActions();

const api = () => {
  return (
    wretch("http://localhost:8000")
      // Inicializa la autenticacion del tocket JWT
      .auth(`Bearer ${getToken("access")}`)
      // Captura errores 401 para actualizar y reintentar la solicitud
      .catcher(401, async (error: WretchError, request: Wretch) => {
        // Si el token expiró (401), intenta renovarlo

        try {
          //Intenta actualizar el token JWT
          const { access } = (await handleJWTRefresh().json()) as {
            access: string;
          };

          //Almacena el nuevo token de acceso
          storeToken(access, "access");

          //Reproduce la solicitud original con el nuevo token de acceos

          return request
            .auth(`Bearer ${access}`)
            .fetch()
            .unauthorized(() => {
              window.location.replace("/");
            })
            .json();
        } catch (err) {
          window.location.replace("/");
        }
      })
  );
};

export const fetcher = (url: string): Promise<any> => {
  return api().get(url).json();
};

// Helper functions for CRUD operations
export const apiPost = <T = any>(url: string, data: any): Promise<T> => {
  return api().url(url).post(data).json();
};

export const apiPatch = <T = any>(url: string, data: any): Promise<T> => {
  return api().url(url).patch(data).json();
};

export const apiPut = <T = any>(url: string, data: any): Promise<T> => {
  return api().url(url).put(data).json();
};

export const apiDelete = (url: string): Promise<void> => {
  return api()
    .url(url)
    .delete()
    .res()
    .then(() => undefined);
};

// POST without body (for marking notifications as read, etc.)
export const apiPostEmpty = <T = any>(url: string): Promise<T> => {
  return api().url(url).post().json();
};
