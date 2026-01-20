"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../shared/Button";

const API_BASE_URL = "http://localhost:8000/api";

type FormData = {
  cedula: string;
  firstName: string;
  lastName: string;
  celular: string;
  email: string;
};

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPatientModal({
  isOpen,
  onClose,
}: AddPatientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/patients/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_names: data.firstName,
          last_names: data.lastName,
          document_id: data.cedula,
          email: data.email,
          phone_number: data.celular,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Error al crear el paciente");
      }

      const patient = await response.json();
      alert(
        `¡Paciente creado con éxito!\nID: ${patient.id}\nNombre: ${patient.first_names} ${patient.last_names}`,
      );
      reset();
      onClose();
      window.location.reload(); // Refresh to update patient count
    } catch (error: any) {
      alert(error.message || "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-surface-dark rounded-xl shadow-2xl border border-[#323a46] w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 sm:p-8">
            {/* Header with close button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-text-primary text-2xl font-bold">
                Añadir Nuevo Paciente
              </h2>
              <button
                onClick={handleClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-text-secondary text-sm text-center mb-6">
              Complete los datos del nuevo paciente.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <label className="text-text-primary text-sm font-medium">
                  Cédula de Identidad *
                </label>
                <input
                  {...register("cedula", {
                    required: "La cédula es requerida",
                    minLength: { value: 10, message: "Mínimo 10 dígitos" },
                  })}
                  className="form-input rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
                  placeholder="Ingrese la cédula"
                />
                {errors.cedula && (
                  <span className="text-red-500 text-xs">
                    {errors.cedula.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-2">
                  <span className="text-text-primary text-sm font-medium">
                    Nombres *
                  </span>
                  <input
                    {...register("firstName", { required: "Campo requerido" })}
                    className="form-input rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
                    placeholder="Nombres"
                  />
                  {errors.firstName && (
                    <span className="text-red-500 text-xs">
                      {errors.firstName.message}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-text-primary text-sm font-medium">
                    Apellidos *
                  </span>
                  <input
                    {...register("lastName", { required: "Campo requerido" })}
                    className="form-input rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
                    placeholder="Apellidos"
                  />
                  {errors.lastName && (
                    <span className="text-red-500 text-xs">
                      {errors.lastName.message}
                    </span>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-2">
                  <span className="text-text-primary text-sm font-medium">
                    Celular *
                  </span>
                  <input
                    {...register("celular", { required: "Campo requerido" })}
                    className="form-input rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
                    placeholder="0987654321"
                  />
                  {errors.celular && (
                    <span className="text-red-500 text-xs">
                      {errors.celular.message}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-text-primary text-sm font-medium">
                    Email *
                  </span>
                  <input
                    type="email"
                    {...register("email", { required: "Campo requerido" })}
                    className="form-input rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.email && (
                    <span className="text-red-500 text-xs">
                      {errors.email.message}
                    </span>
                  )}
                </label>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  textButton={
                    isSubmitting ? "Guardando..." : "Guardar Paciente"
                  }
                  type="submit"
                  disabled={isSubmitting}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
