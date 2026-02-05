import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthActions } from "../../utils";
import { useSearchParams, useRouter } from "next/navigation";
import Button from "../shared/Button";

type FormData = {
  password: string;
};

const ResetPasswordConfirmation = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const router = useRouter();
  const { resetPasswordConfirm } = AuthActions();
  const searchParams = useSearchParams();

  // Estado para el uid y el token

  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");

  // Extrae el UID y Token desde la URL

  useEffect(() => {
    if (searchParams.get("uid") && searchParams.get("token")) {
      setUid(searchParams.get("uid") as string);
      setToken(searchParams.get("token") as string);
    }
  }, [searchParams]);

  const onSubmit = async (data: FormData) => {
    try {
      await resetPasswordConfirm(
        data.password,
        data.password,
        token,
        uid,
      ).res();
      alert("Password has been reset successfully.");
      router.push("/");
    } catch (err) {
      console.log(err);
      alert("Failed to reset password. Please try again.");
    }
  };

  const handleLoginRedict = () => {
    router.push("/");
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
              <span>Reportes y estadísticas</span>
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

          <h2 className="text-gray-900 text-3xl font-bold mb-2">
            Nueva Contraseña
          </h2>
          <p className="text-gray-600 text-sm mb-8">
            Crea una nueva contraseña para tu cuenta.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
            autoComplete="off"
          >
            {/* Password Field */}
            <div className="flex flex-col">
              <label className="text-gray-700 text-sm font-medium mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                placeholder="Ingresa tu nueva contraseña"
                {...register("password", { required: true })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9098f8] focus:border-transparent placeholder:text-gray-400"
              />
              {errors.password && (
                <span className="text-xs text-red-600 mt-1">
                  La contraseña es requerida
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#9098f8] hover:bg-[#7a82e8] text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-2"
            >
              Cambiar contraseña
            </button>
          </form>

          <p className="text-gray-600 text-sm text-center mt-6">
            ¿Recuerdas tu contraseña?{" "}
            <a
              className="font-medium text-[#9098f8] hover:underline cursor-pointer"
              onClick={handleLoginRedict}
            >
              Volver a Iniciar Sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordConfirmation;
