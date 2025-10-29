import React from "react";

function FixLogin() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display">
      <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <main className="flex-grow">
            <div className="flex min-h-screen">
              <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-primary relative">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-10"
                  /* style="
                  background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQvoyofttNAxFUh_MWL6CR4J3lkRhFookEnvZC4HJCLS-rceJRMrjikMr6l_CB5Q6N-QiUT__7Fck0SfKH82mUpgJte0MILXQ3EU3snnl5c-j345Ty3TsuQEwBHXH9_dq5ZCDH573pSQ9mxSFW8DSDJFk1gHLZl8jTgLme5e3xeK6OZV7MqX5uu-erGH14-L_VRPOgRXxwLq5jSXXD4nhocFibU6FZjEkmuad7Yfod_ZpisF_JoMtEnBoS4lnEj3Qtq67dKjfUhxs');
                " */
                ></div>
                <div className="relative z-10 text-white text-center max-w-md">
                  <div className="flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-5xl mr-3">
                      insights
                    </span>
                    <span className="text-3xl font-bold">DataViz</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    Visualiza tus datos, potencia tus decisiones.
                  </h2>
                  <p className="text-lg text-blue-100">
                    Accede a dashboards interactivos y reportes en tiempo real
                    para transformar tus datos en acciones.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/2 flex items-center justify-center bg-surface-light dark:bg-surface-dark p-6 sm:p-12">
                <div className="layout-content-container flex flex-col w-full max-w-md">
                  <h1 className="text-text-primary-light dark:text-text-primary-dark tracking-tight text-3xl font-bold leading-tight text-left pb-4">
                    Bienvenido de nuevo
                  </h1>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal pb-8">
                    Ingresa tus credenciales para acceder a tu cuenta.
                  </p>
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-end gap-4">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium leading-normal pb-2">
                          Nombre de usuario
                        </p>
                        <input
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-600 bg-surface-light dark:bg-surface-dark focus:border-primary h-12 placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark p-[15px] text-base font-normal leading-normal"
                          placeholder="Ingresa tu nombre de usuario"
                          value=""
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap items-end gap-4">
                      <label className="flex flex-col min-w-40 flex-1">
                        <div className="flex justify-between items-baseline">
                          <p className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium leading-normal pb-2">
                            Contraseña
                          </p>
                          <a
                            className="text-primary text-sm font-medium leading-normal underline hover:text-blue-400 dark:hover:text-blue-400 transition-colors"
                            href="#"
                          >
                            Olvidé mi contraseña
                          </a>
                        </div>
                        <div className="relative flex w-full flex-1 items-stretch rounded-lg">
                          <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-600 bg-surface-light dark:bg-surface-dark focus:border-primary h-12 placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark p-[15px] text-base font-normal leading-normal pr-12"
                            placeholder="Ingresa tu contraseña"
                            type="password"
                            value=""
                          />
                          <button
                            aria-label="Toggle password visibility"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary-light dark:text-text-secondary-dark"
                          >
                            <span className="material-symbols-outlined">
                              visibility_off
                            </span>
                          </button>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="flex py-6 justify-center">
                    <button className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-surface-dark transition-colors">
                      <span className="truncate">Iniciar Sesión</span>
                    </button>
                  </div>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal text-center">
                    ¿No tienes una cuenta?
                    <a
                      className="font-medium text-primary underline hover:text-blue-400 dark:hover:text-blue-400 transition-colors"
                      href="#"
                    >
                      Regístrate
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default FixLogin;
