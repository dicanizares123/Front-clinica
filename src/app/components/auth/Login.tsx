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
    <div className="flex justify-center items-center min-h-screen ">
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-surface-light p-6 sm:p-12">
        <div className="flex flex-col w-full max-w-md">
          <div className="mb-6 flex w-full justify-center mb-8 ">
            <div className="h-10 w-10">
              <span className="material-symbols-outlined !text-[60px]">
                shield_with_heart
              </span>
            </div>
          </div>
          <h1 className="text-text-primary tracking-tight text-3xl font-bold leading-tight text-center pb-4">
            Centro Psicológico Atrévete
          </h1>

          <p className="text-text-secondary text-base font-normal leading-normal text-center pb-8">
            Ingresa tus credenciales para acceder a tu cuenta.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
            autoComplete="off"
          >
            {/* Username Field */}
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-text-primary text-sm font-medium leading-normal pb-2">
                  Nombre de usuario
                </p>
                <input
                  {...register("username", { required: true })}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-surface-light focus:border-primary h-12 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal"
                  placeholder="Ingresa tu nombre de usuario"
                />
                {errors.username && (
                  <span className="text-xs text-red-600 mt-1">
                    El nombre de usuario es requerido
                  </span>
                )}
              </label>
            </div>

            {/* Password Field */}
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col min-w-40 flex-1">
                <div className="flex justify-between items-baseline">
                  <p className="text-text-primary text-sm font-medium leading-normal pb-2">
                    Contraseña
                  </p>
                  <a
                    className="text-primary text-sm font-medium leading-normal underline hover:text-blue-400 transition-colors"
                    onClick={handleResetPassword}
                  >
                    Olvidé mi contraseña
                  </a>
                </div>
                <div className="relative flex w-full flex-1 items-stretch rounded-lg">
                  <input
                    {...register("password", { required: true })}
                    type={showPassword ? "text" : "password"}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-surface-light focus:border-primary h-12 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal pr-12"
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <span className="text-xs text-red-600 mt-1">
                    La contraseña es requerida
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
              <Button textButton="Iniciar Sesión" type="submit" />
            </div>
          </form>

          {/* <p className="text-text-secondary text-sm font-normal leading-normal text-center">
            ¿No tienes una cuenta?{" "}
            <a
              className="font-medium text-primary underline hover:text-blue-400 transition-colors"
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
