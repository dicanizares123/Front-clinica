"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AuthActions } from "../utils";

type FormData = {
  email: string;
};

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>();
  const router = useRouter();
  const { resetPassword } = AuthActions();

  const onSubmit = async (data: FormData) => {
    try {
      await resetPassword(data.email).res();
      alert("Enlace de recuperación enviado a tu correo.");
      router.push("/");
    } catch (err: any) {
      let errorMessage = "Error al enviar el enlace";
      try {
        const parsedError = JSON.parse(err.message);
        errorMessage =
          parsedError.detail ||
          parsedError.message ||
          "Error al enviar el enlace";
      } catch {
        errorMessage = "Error al enviar el enlace. Intenta nuevamente.";
      }
      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  const handleLoginRedirect = () => {
    router.push("/");
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-surface-light p-6 sm:p-12">
        <div className="flex flex-col w-full max-w-md">
          <h1 className="text-text-primary tracking-tight text-3xl font-bold leading-tight text-center pb-4">
            Restablecer tu Contraseña
          </h1>
          <p className="text-text-secondary text-base font-normal leading-normal text-center pb-8">
            Ingresa el correo electrónico asociado a tu cuenta y te enviaremos
            un enlace para restablecer tu contraseña.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* Email Field */}
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-text-primary text-sm font-medium leading-normal pb-2">
                  Correo Electrónico
                </p>
                <input
                  {...register("email", {
                    required: true,
                    pattern: /^\S+@\S+$/i,
                  })}
                  type="text"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-surface-light focus:border-primary h-12 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal"
                  placeholder="tucorreo@ejemplo.com"
                />
                {errors.email && (
                  <span className="text-xs text-red-600 mt-1">
                    {errors.email.type === "pattern"
                      ? "Ingresa un correo válido"
                      : "El correo es requerido"}
                  </span>
                )}
              </label>
            </div>

            {/* Error Message */}
            {errors.root && (
              <span className="text-xs text-red-600 text-center">
                {errors.root.message}
              </span>
            )}

            {/* Submit Button */}
            <div className="flex py-6 justify-center">
              <button
                type="submit"
                className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-black text-white text-base font-bold leading-normal tracking-[0.015em] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              >
                <span className="truncate">Enviar Enlace de Recuperación</span>
              </button>
            </div>
          </form>

          <p className="text-text-secondary text-sm font-normal leading-normal text-center">
            ¿Recuerdas tu contraseña?{" "}
            <a
              className="font-medium text-primary underline hover:text-blue-400 transition-colors"
              onClick={handleLoginRedirect}
            >
              Volver a Iniciar Sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
