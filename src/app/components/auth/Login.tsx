"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AuthActions } from "../../utils";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "../../fetcher";
import Cookies from "js-cookie";
import Button from "../shared/Button";
type FormData = {
  username: string;
  password: string;
};

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>();
  const router = useRouter();
  const { login, storeToken } = AuthActions();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      router.push("/home");
    }
  }, [router]);

  const onSubmit = (data: FormData) => {
    login(data.username, data.password)
      .json((json) => {
        storeToken(json.access, "access");
        storeToken(json.refresh, "refresh");
        router.push("/home");
      })
      .catch((err) => {
        let errorMessage = "Login failed";
        try {
          const parsedError = JSON.parse(err.message);
          errorMessage =
            parsedError.detail || parsedError.message || "Invalid credentials";
        } catch {
          errorMessage = "Invalid username or password";
        }
        setError("root", {
          type: "manual",
          message: errorMessage,
        });
      });
  };

  const handleResetPassword = () => {
    router.push("/auth/password/reset-password");
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f3f3ff" }}>
      {/* Panel Izquierdo - Información */}
      <div className="hidden lg:flex lg:w-2/3 bg-[#262a37] p-12 flex-col justify-center items-center">
        <div className="max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <span className="material-symbols-outlined !text-[60px] text-white">
              shield_with_heart
            </span>
          </div>

          <h1 className="text-white text-4xl font-bold mb-6">
            Centro Psicológico
            <br />
            Atrévete
          </h1>

          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 text-gray-300">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Gestión de pacientes</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Agenda de citas online</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Facturación electrónica</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Estadísticas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-6 sm:p-12">
        <div className="flex flex-col w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <span className="material-symbols-outlined !text-[60px] text-[#262a37]">
              shield_with_heart
            </span>
          </div>

          <h2 className="text-gray-900 text-3xl font-bold mb-2">Login</h2>
          <p className="text-gray-600 text-sm mb-8">
            Ingresa tus credenciales para acceder a tu cuenta.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
            autoComplete="off"
          >
            {/* Username Field */}
            <div className="flex flex-col">
              <label className="text-gray-700 text-sm font-medium mb-2">
                Nombre de usuario
              </label>
              <input
                {...register("username", { required: true })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9098f8] focus:border-transparent placeholder:text-gray-400"
                placeholder="Ingresa tu nombre de usuario"
              />
              {errors.username && (
                <span className="text-xs text-red-600 mt-1">
                  El nombre de usuario es requerido
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-700 text-sm font-medium">
                  Contraseña
                </label>
                <a
                  className="text-[#9098f8] text-xs font-medium hover:underline cursor-pointer"
                  onClick={handleResetPassword}
                >
                  Olvidé mi contraseña
                </a>
              </div>
              <div className="relative">
                <input
                  {...register("password", { required: true })}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9098f8] focus:border-transparent placeholder:text-gray-400 pr-12"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-red-600 mt-1">
                  La contraseña es requerida
                </span>
              )}
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {errors.root.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#9098f8] hover:bg-[#7a82e8] text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-2"
            >
              Iniciar Sesión
            </button>
          </form>

          {/* <p className="text-gray-600 text-sm text-center mt-6">
            ¿No tienes una cuenta?{" "}
            <a
              className="font-medium text-[#9098f8] hover:underline"
              href="/auth/register"
            >
              Regístrate
            </a>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
