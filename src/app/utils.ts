import wretch from "wretch";
import Cookies from "js-cookie";

// Configuracion de la API base para realizar solicitudes HTTP

const api = wretch("http://localhost:8000").accept("application/json");

/**
 * Almacena un token en las cookies del navegador.
 * @param {string} token: el token que se almcenará.
 * @param {"access" | "refresh"} type: el tipo de token (access o actualizacion).
 */

const storeToken = (token: string, type: "access" | "refresh") => {
  Cookies.set(type + "Token", token);
};

/**
 * Recupera un token de las cookies.
 * @param {"access" | "refresh"} type: el tipo de token (access o actualizacion).
 * @returns {string | undefined}: el token recuperado o undefined si no existe.
 */

const getToken = (type: string) => {
  return Cookies.get(type + "Token");
};

/**
 * Elimina los tokens de acceso y actualización de las cookies.
 */

const removeTokens = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
};

/************/
/* Metodos para la logica de inicio de sesion, registro, cierre de sesion y restablecimiento de contraseña */

const register = (email: string, username: string, password: string) => {
  return api.post({ email, username, password }, "/auth/users/");
};

const login = (email: string, password: string) => {
  return api.post({ username: email, password }, "/auth/jwt/create/");
};

const logout = () => {
  const refreshToken = getToken("refresh");
  return api.post({ refresh: refreshToken }, "/auth/logout/");
};

const handleJWTRefresh = () => {
  const refreshToken = getToken("refresh");
  return api.post({ refresh: refreshToken }, "/auth/jwt/refresh/");
};

const resetPassword = (email: string) => {
  return api.post({ email }, "/auth/users/reset_password/");
};

const resetPasswordConfirm = (
  new_password: string,
  re_new_password: string,
  token: string,
  uid: string
) => {
  return api.post(
    { uid, token, new_password, re_new_password },
    "/auth/users/reset_password_confirm/"
  );
};

/************/
/* Llamada al metodo AuthActions */

export const AuthActions = () => {
  return {
    login,
    resetPasswordConfirm,
    handleJWTRefresh,
    register,
    resetPassword,
    storeToken,
    getToken,
    logout,
    removeTokens,
  };
};
