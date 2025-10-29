import wretch, { Wretch, WretchError } from "wretch";
import { AuthActions } from "./auth/utils";
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
