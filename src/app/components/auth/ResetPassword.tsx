import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AuthActions } from "../../utils";
import Button from "../shared/Button";

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
            Restablecer Contraseña
          </h2>
          <p className="text-gray-600 text-sm mb-8">
            Ingresa el correo electrónico asociado a tu cuenta y te enviaremos
            un enlace para restablecer tu contraseña.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* Email Field */}
            <div className="flex flex-col">
              <label className="text-gray-700 text-sm font-medium mb-2">
                Correo Electrónico
              </label>
              <input
                {...register("email", {
                  required: true,
                  pattern: /^\S+@\S+$/i,
                })}
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9098f8] focus:border-transparent placeholder:text-gray-400"
                placeholder="tucorreo@ejemplo.com"
              />
              {errors.email && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.email.type === "pattern"
                    ? "Ingresa un correo válido"
                    : "El correo es requerido"}
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
              Enviar Enlace de Recuperación
            </button>
          </form>

          <p className="text-gray-600 text-sm text-center mt-6">
            ¿Recuerdas tu contraseña?{" "}
            <a
              className="font-medium text-[#9098f8] hover:underline cursor-pointer"
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
