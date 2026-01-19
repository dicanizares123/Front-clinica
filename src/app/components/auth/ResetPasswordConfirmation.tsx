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
        uid
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
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-surface-light p-6 sm:p-12">
        <div className="flex flex-col w-full max-w-md">
          <h1 className="text-text-primary tracking-tight text-3xl font-bold leading-tight text-center pb-4">
            Restablecer tu Contraseña
          </h1>
          <p className="text-text-secondary text-base font-normal leading-normal text-center pb-8">
            Crea una nueva contraseña
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4"
            autoComplete="off"
          >
            <label className="block" htmlFor="password">
              Nueva Contraseña
            </label>
            <input
              type="password"
              placeholder="Ingresa tu nueva contraseña"
              {...register("password", { required: true })}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 border border-[#323a46] bg-surface-dark focus:border-primary h-12 placeholder:text-text-secondary p-4 shadow text-base font-normal leading-normal mt-2"
            />
            {errors.password && (
              <span className="text-xs text-red-600">Password is required</span>
            )}
            <div className="flex py-6 justify-center">
              <Button textButton="Cambiar contraseña" type="submit" />
            </div>
          </form>
          <p className="text-text-secondary text-sm font-normal leading-normal text-center">
            ¿Recuerdas tu contraseña?{" "}
            <a
              className="font-medium text-primary underline hover:text-blue-400 transition-colors"
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
