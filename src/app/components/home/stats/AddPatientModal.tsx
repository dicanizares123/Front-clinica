"use client";

import React, { useState, useEffect } from "react";
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

interface Patient {
  id?: number;
  first_names: string;
  last_names: string;
  document_id: string;
  email: string;
  phone_number: string;
  address?: string;
}

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  patient?: Patient | null;
  mode?: "create" | "edit";
}

export default function AddPatientModal({
  isOpen,
  onClose,
  onSuccess,
  patient,
  mode = "create",
}: AddPatientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  // Cargar datos del paciente cuando se abre en modo edición
  useEffect(() => {
    if (isOpen && mode === "edit" && patient) {
      setValue("cedula", patient.document_id || "");
      setValue("firstName", patient.first_names || "");
      setValue("lastName", patient.last_names || "");
      setValue("celular", patient.phone_number || "");
      setValue("email", patient.email || "");
    } else if (isOpen && mode === "create") {
      reset();
    }
  }, [isOpen, mode, patient, setValue, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const payload = {
        first_names: data.firstName,
        last_names: data.lastName,
        document_id: data.cedula,
        email: data.email,
        phone_number: data.celular,
      };

      let response;

      if (mode === "edit" && patient?.id) {
        // Modo edición: PATCH
        response = await fetch(`${API_BASE_URL}/patients/${patient.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } else {
        // Modo creación: POST
        response = await fetch(`${API_BASE_URL}/patients/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.detail ||
            `Error al ${mode === "edit" ? "actualizar" : "crear"} el paciente`,
        );
      }

      const result = await response.json();

      if (mode === "edit") {
        alert(
          `¡Paciente actualizado con éxito!\nNombre: ${result.first_names} ${result.last_names}`,
        );
      } else {
        alert(
          `¡Paciente creado con éxito!\nID: ${result.id}\nNombre: ${result.first_names} ${result.last_names}`,
        );
      }

      reset();
      onClose();

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
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

  const isEditMode = mode === "edit";
  const title = isEditMode ? "Editar Paciente" : "Añadir Nuevo Paciente";
  const subtitle = isEditMode
    ? "Modifique los datos del paciente."
    : "Complete los datos del nuevo paciente.";
  const buttonText = isSubmitting
    ? "Guardando..."
    : isEditMode
      ? "Actualizar Paciente"
      : "Guardar Paciente";

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
              <h2 className="text-text-primary text-2xl font-bold">{title}</h2>
              <button
                onClick={handleClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-text-secondary text-sm text-center mb-6">
              {subtitle}
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
                  textButton={buttonText}
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
