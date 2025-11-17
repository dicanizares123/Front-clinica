"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import Button from "../components/shared/Button";
import { useRouter } from "next/navigation";

type FormData = {
  firstName: string;
  lastName: string;
  cedula: string;
  celular: string;
  email: string;
  appointmentDate: string;
  appointmentTime: string;
};

// Datos simulados de horarios disponibles por día
const mockAvailableSlots = {
  "2025-11-11": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  "2025-11-12": ["09:00", "10:30", "14:00", "15:30", "16:00"],
  "2025-11-13": ["10:00", "11:00", "14:00", "15:00"],
  "2025-11-14": ["09:00", "10:00", "11:00", "14:30", "15:00", "16:00", "17:00"],
  "2025-11-15": ["09:00", "10:00", "14:00", "15:00"],
};

export default function CitaFormulario() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FormData>();
  const router = useRouter();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const selectedDateValue = watch("appointmentDate");

  // Validación de cédula ecuatoriana (10 dígitos)
  const validateCedula = (cedula: string) => {
    if (!/^\d{10}$/.test(cedula)) {
      return "La cédula debe tener 10 dígitos";
    }
    // Validación del dígito verificador (algoritmo módulo 10)
    const digits = cedula.split("").map(Number);
    const provinceCode = parseInt(cedula.substring(0, 2));

    if (provinceCode < 1 || provinceCode > 24) {
      return "Código de provincia inválido";
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let value = digits[i];
      if (i % 2 === 0) {
        value *= 2;
        if (value > 9) value -= 9;
      }
      sum += value;
    }

    const checkDigit = sum % 10 === 0 ? 0 : 10 - (sum % 10);
    if (checkDigit !== digits[9]) {
      return "Cédula inválida";
    }

    return true;
  };

  // Validación de celular ecuatoriano (10 dígitos, empieza con 09)
  const validateCelular = (celular: string) => {
    if (!/^09\d{8}$/.test(celular)) {
      return "El celular debe tener 10 dígitos y empezar con 09";
    }
    return true;
  };

  // Cargar horarios disponibles cuando se selecciona una fecha
  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    setIsLoadingSlots(true);
    clearErrors("appointmentTime");

    // Simular llamada a API
    setTimeout(() => {
      // En producción, reemplaza esto con:
      // const response = await fetch(`/api/appointments/available-slots?date=${date}`);
      // const data = await response.json();
      // setAvailableSlots(data.slots);

      const slots =
        mockAvailableSlots[date as keyof typeof mockAvailableSlots] || [];
      setAvailableSlots(slots);
      setIsLoadingSlots(false);

      if (slots.length === 0) {
        setError("appointmentDate", {
          type: "manual",
          message: "No hay horarios disponibles para esta fecha",
        });
      }
    }, 500);
  };

  const onSubmit = async (data: FormData) => {
    console.log("Datos del formulario:", data);

    // Preparar datos para enviar a la API
    const appointmentData = {
      patient: {
        firstName: data.firstName,
        lastName: data.lastName,
        cedula: data.cedula,
        celular: data.celular,
        email: data.email,
      },
      appointment: {
        date: data.appointmentDate,
        time: data.appointmentTime,
        type: "consultation", // Puedes agregar un campo para esto
      },
    };

    try {
      // TODO: Descomentar cuando tengas el backend listo
      /*
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error('Error al crear la cita');
      }

      const result = await response.json();
      */

      // Simulación de éxito
      alert(
        `¡Cita registrada exitosamente!\n\nPaciente: ${data.firstName} ${data.lastName}\nFecha: ${data.appointmentDate}\nHora: ${data.appointmentTime}\n\nEn producción, esto se guardará en la base de datos.`
      );

      // Redirigir al dashboard o página de confirmación
      // router.push('/dashboard');
    } catch (error) {
      console.error("Error:", error);
      setError("root", {
        type: "manual",
        message: "Error al registrar la cita. Por favor intenta nuevamente.",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 sm:p-12">
        <div className="mb-6 flex w-full justify-center">
          <div className="h-10 w-10">
            <span className="material-symbols-outlined !text-[60px] text-primary">
              calendar_add_on
            </span>
          </div>
        </div>

        <h1 className="text-text-primary tracking-tight text-3xl font-bold leading-tight text-center pb-4">
          Agendar Nueva Cita
        </h1>

        <p className="text-text-secondary text-base font-normal leading-normal text-center pb-8">
          Complete el formulario para agendar una cita médica
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Nombres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-text-primary text-sm font-medium leading-normal pb-2">
                Nombres <span className="text-red-500">*</span>
              </label>
              <input
                {...register("firstName", {
                  required: "Los nombres son requeridos",
                  minLength: {
                    value: 2,
                    message: "Debe tener al menos 2 caracteres",
                  },
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                    message: "Solo se permiten letras",
                  },
                })}
                className="form-input flex w-full resize-none overflow-hidden rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-surface-light focus:border-primary h-12 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal"
                placeholder="Ej: Juan Carlos"
              />
              {errors.firstName && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            {/* Apellidos */}
            <div className="flex flex-col">
              <label className="text-text-primary text-sm font-medium leading-normal pb-2">
                Apellidos <span className="text-red-500">*</span>
              </label>
              <input
                {...register("lastName", {
                  required: "Los apellidos son requeridos",
                  minLength: {
                    value: 2,
                    message: "Debe tener al menos 2 caracteres",
                  },
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                    message: "Solo se permiten letras",
                  },
                })}
                className="form-input flex w-full resize-none overflow-hidden rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-surface-light focus:border-primary h-12 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal"
                placeholder="Ej: Pérez García"
              />
              {errors.lastName && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>

          {/* Cédula */}
          <div className="flex flex-col">
            <label className="text-text-primary text-sm font-medium leading-normal pb-2">
              Cédula de Identidad <span className="text-red-500">*</span>
            </label>
            <input
              {...register("cedula", {
                required: "La cédula es requerida",
                validate: validateCedula,
              })}
              className="form-input flex w-full resize-none overflow-hidden rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-surface-light focus:border-primary h-12 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal"
              placeholder="Ej: 1234567890"
              maxLength={10}
            />
            {errors.cedula && (
              <span className="text-xs text-red-600 mt-1">
                {errors.cedula.message}
              </span>
            )}
          </div>

          {/* Celular y Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-text-primary text-sm font-medium leading-normal pb-2">
                Celular <span className="text-red-500">*</span>
              </label>
              <input
                {...register("celular", {
                  required: "El celular es requerido",
                  validate: validateCelular,
                })}
                className="form-input flex w-full resize-none overflow-hidden rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-surface-light focus:border-primary h-12 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal"
                placeholder="Ej: 0987654321"
                maxLength={10}
              />
              {errors.celular && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.celular.message}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-text-primary text-sm font-medium leading-normal pb-2">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                {...register("email", {
                  required: "El correo es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Correo electrónico inválido",
                  },
                })}
                type="email"
                className="form-input flex w-full resize-none overflow-hidden rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-surface-light focus:border-primary h-12 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal"
                placeholder="Ej: correo@ejemplo.com"
              />
              {errors.email && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>
          </div>

          {/* Fecha de la cita */}
          <div className="flex flex-col">
            <label className="text-text-primary text-sm font-medium leading-normal pb-2">
              Fecha de la Cita <span className="text-red-500">*</span>
            </label>
            <input
              {...register("appointmentDate", {
                required: "La fecha es requerida",
                validate: (value) => {
                  const selectedDate = new Date(value);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (selectedDate < today) {
                    return "No puedes seleccionar una fecha pasada";
                  }
                  return true;
                },
              })}
              type="date"
              onChange={handleDateChange}
              min={new Date().toISOString().split("T")[0]}
              className="form-input flex w-full resize-none overflow-hidden rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-surface-light focus:border-primary h-12 placeholder:text-text-secondary p-[15px] text-base font-normal leading-normal"
            />
            {errors.appointmentDate && (
              <span className="text-xs text-red-600 mt-1">
                {errors.appointmentDate.message}
              </span>
            )}
          </div>

          {/* Horarios disponibles */}
          {selectedDate && (
            <div className="flex flex-col">
              <label className="text-text-primary text-sm font-medium leading-normal pb-2">
                Horario Disponible <span className="text-red-500">*</span>
              </label>

              {isLoadingSlots ? (
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {availableSlots.map((slot) => (
                    <label
                      key={slot}
                      className="relative flex items-center justify-center cursor-pointer"
                    >
                      <input
                        {...register("appointmentTime", {
                          required: "Debes seleccionar un horario",
                        })}
                        type="radio"
                        value={slot}
                        className="peer sr-only"
                      />
                      <div className="w-full py-3 px-2 text-center rounded-lg border-2 border-gray-300 bg-white peer-checked:border-black peer-checked:bg-black peer-checked:text-white hover:border-gray-400 transition-all text-sm font-medium">
                        {slot}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    No hay horarios disponibles para esta fecha
                  </p>
                </div>
              )}

              {errors.appointmentTime && (
                <span className="text-xs text-red-600 mt-2">
                  {errors.appointmentTime.message}
                </span>
              )}
            </div>
          )}

          {/* Error general */}
          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <span className="text-sm text-red-600">
                {errors.root.message}
              </span>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              textButton="Cancelar"
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            />
            <Button textButton="Agendar Cita" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
}
