"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Button from "../components/shared/Button";
import { useRouter } from "next/navigation";

const API_BASE_URL = "http://localhost:8000/api";

type FormData = {
  firstName: string;
  lastName: string;
  cedula: string;
  celular: string;
  email: string;
  specialtyId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
};

type Specialty = {
  id: number;
  name: string;
};

type Doctor = {
  id_doctor: number; // Cambió de 'id' a 'id_doctor'
  full_name: string;
  primary_specialty: number | null;
  primary_specialty_name: string | null;
  professional_id?: string;
  doctor_specialist_id?: number; // ID de la relación DoctorSpecialist
};

type Patient = {
  id: number;
  first_names: string;
  last_names: string;
  document_id: string;
  email: string;
  phone_number: string;
  address: string;
};

type Appointment = {
  id: number;
  uuid: string;
  patient: number;
  doctor_specialist: number;
  doctor_name: string;
  specialty_name: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  notes: string;
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

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSpecialtyId = watch("specialtyId");
  const selectedDoctorId = watch("doctorId");
  const selectedDateValue = watch("appointmentDate");

  // Cargar especialidades al montar el componente
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/specialties/`);
        if (response.ok) {
          const data = await response.json();
          const allSpecialties = data.results || data || [];
          setSpecialties(allSpecialties);
          console.log("Especialidades cargadas:", allSpecialties);
        } else {
          console.error("Error al cargar especialidades");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoadingSpecialties(false);
      }
    };

    loadSpecialties();
  }, []);

  // Cargar doctores al montar el componente (sin autenticación)
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/doctors/`);
        if (response.ok) {
          const data = await response.json();
          const allDoctors = data.results || [];
          setDoctors(allDoctors);
          setFilteredDoctors(allDoctors); // Inicialmente mostrar todos
          console.log("Doctores cargados:", allDoctors);
        } else {
          console.error("Error al cargar doctores");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, []);

  // Filtrar doctores cuando se selecciona una especialidad
  useEffect(() => {
    if (selectedSpecialtyId) {
      console.log("Filtrando por especialidad:", selectedSpecialtyId);
      const filtered = doctors.filter((doctor) => {
        if (doctor) {
          console.log(
            `Doctor: ${doctor.full_name}, specialty: ${
              doctor.primary_specialty
            }, match: ${
              doctor.primary_specialty?.toString() === selectedSpecialtyId
            }`
          );
          return doctor.primary_specialty?.toString() === selectedSpecialtyId;
        }
        return false;
      });
      console.log("Doctores filtrados:", filtered);
      setFilteredDoctors(filtered);
    } else {
      // Si no hay especialidad seleccionada, mostrar todos
      const validDoctors = doctors.filter((doctor) => doctor);
      setFilteredDoctors(validDoctors);
      console.log("Mostrando todos los doctores:", validDoctors);
    }
  }, [selectedSpecialtyId, doctors]);

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

  // Cargar horarios disponibles cuando se selecciona una fecha y doctor
  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    clearErrors("appointmentTime");

    // Necesitamos el doctor seleccionado
    if (!selectedDoctorId) {
      setError("doctorId", {
        type: "manual",
        message: "Primero selecciona un doctor",
      });
      return;
    }

    // Verificar que los doctores estén cargados
    if (!doctors || doctors.length === 0) return;

    // Obtener el doctor por su ID
    const selectedDoctor = doctors.find(
      (d) => d.id_doctor.toString() === selectedDoctorId
    );

    if (!selectedDoctor) return;

    setIsLoadingSlots(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/available-slots/?doctor=${selectedDoctor.id_doctor}&date=${date}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.available_slots || []);

        if (data.available_slots.length === 0) {
          setError("appointmentDate", {
            type: "manual",
            message: "No hay horarios disponibles para esta fecha",
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("appointmentDate", {
        type: "manual",
        message: "Error al cargar horarios disponibles",
      });
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // PASO 1: Buscar o crear paciente
      let patientId: number;

      try {
        // Buscar paciente por cédula
        const searchResponse = await fetch(
          `${API_BASE_URL}/patients/by_document/${data.cedula}/`
        );

        if (searchResponse.ok) {
          const existingPatient = (await searchResponse.json()) as Patient;
          patientId = existingPatient.id;
          console.log("Paciente existente encontrado:", existingPatient);
        } else {
          // Paciente no existe (404), crear uno nuevo
          const createResponse = await fetch(`${API_BASE_URL}/patients/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_names: data.firstName,
              last_names: data.lastName,
              document_id: data.cedula,
              email: data.email,
              phone_number: data.celular,
              address: "",
            }),
          });

          if (!createResponse.ok) {
            throw new Error("Error al registrar el paciente");
          }

          const newPatient = (await createResponse.json()) as Patient;
          patientId = newPatient.id;
          console.log("Nuevo paciente creado:", newPatient);
        }
      } catch (error: any) {
        throw new Error("Error al buscar o crear el paciente");
      }

      // PASO 2: Obtener el doctor seleccionado
      const selectedDoctor = doctors.find(
        (d) => d.id_doctor.toString() === data.doctorId
      );

      if (!selectedDoctor) {
        throw new Error("No se encontró el doctor seleccionado");
      }

      // Usar doctor_specialist_id si existe, sino usar id_doctor
      const doctorSpecialistId =
        selectedDoctor.doctor_specialist_id || selectedDoctor.id_doctor;

      // Debug: verificar tipos ANTES de procesar
      console.log("Tipo de patientId:", typeof patientId, patientId);
      console.log(
        "Tipo de doctor_specialist:",
        typeof doctorSpecialistId,
        doctorSpecialistId
      );

      // Formatear la hora: si ya tiene segundos, no agregar, sino agregar ":00"
      const formattedTime = data.appointmentTime.includes(":00")
        ? data.appointmentTime
        : data.appointmentTime + ":00";

      const requestBody = {
        patient: patientId,
        doctor_specialist: doctorSpecialistId,
        appointment_date: data.appointmentDate,
        appointment_time: formattedTime,
        duration_minutes: 60,
        notes: "",
      };

      console.log("Creando cita con:", requestBody);

      // PASO 3: Crear la cita
      const appointmentResponse = await fetch(`${API_BASE_URL}/appointments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!appointmentResponse.ok) {
        const errorData = await appointmentResponse.json();
        console.error("Error completo del backend:", errorData);
        console.error("Status:", appointmentResponse.status);

        // Mostrar el error completo en formato legible
        const errorMessage = JSON.stringify(errorData, null, 2);
        alert(
          `Error del backend (${appointmentResponse.status}):\n\n${errorMessage}`
        );

        throw new Error(
          errorData.detail || errorData.message || "Error al crear la cita"
        );
      }

      const appointment = (await appointmentResponse.json()) as Appointment;

      console.log("Cita creada:", appointment);

      // Éxito
      alert(
        `✅ ¡Cita agendada exitosamente!\n\n` +
          `Paciente: ${data.firstName} ${data.lastName}\n` +
          `Doctor: ${appointment.doctor_name}\n` +
          `Especialidad: ${appointment.specialty_name}\n` +
          `Fecha: ${appointment.appointment_date}\n` +
          `Hora: ${appointment.appointment_time.substring(0, 5)}\n` +
          `Código: ${appointment.uuid}`
      );
    } catch (error: any) {
      console.error("Error:", error);
      setError("root", {
        type: "manual",
        message:
          error.message ||
          "Error al registrar la cita. Por favor intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug: ver el estado actual de filteredDoctors en cada render
  console.log(
    "Render - filteredDoctors:",
    filteredDoctors,
    "length:",
    filteredDoctors.length
  );

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

          {/* Selector de Especialidad */}
          <div className="flex flex-col">
            <label className="text-text-primary text-sm font-medium leading-normal pb-2">
              Seleccionar Especialidad <span className="text-red-500">*</span>
            </label>
            {isLoadingSpecialties ? (
              <div className="flex items-center justify-center h-12 bg-gray-50 rounded-lg border border-slate-300">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              </div>
            ) : (
              <select
                {...register("specialtyId", {
                  required: "Debes seleccionar una especialidad",
                })}
                className="form-input flex w-full resize-none overflow-hidden rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-surface-light focus:border-primary h-12 placeholder:text-text-secondary px-[15px] text-base font-normal leading-normal"
              >
                <option value="">-- Selecciona una especialidad --</option>
                {Array.isArray(specialties) &&
                  specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id.toString()}>
                      {specialty.name}
                    </option>
                  ))}
              </select>
            )}
            {errors.specialtyId && (
              <span className="text-xs text-red-600 mt-1">
                {errors.specialtyId.message}
              </span>
            )}
          </div>

          {/* Selector de Doctor */}
          <div className="flex flex-col">
            <label className="text-text-primary text-sm font-medium leading-normal pb-2">
              Seleccionar Doctor <span className="text-red-500">*</span>
            </label>
            {isLoadingDoctors ? (
              <div className="flex items-center justify-center h-12 bg-gray-50 rounded-lg border border-slate-300">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              </div>
            ) : (
              <select
                {...register("doctorId", {
                  required: "Debes seleccionar un doctor",
                })}
                className="form-input flex w-full resize-none overflow-hidden rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-surface-light focus:border-primary h-12 placeholder:text-text-secondary px-[15px] text-base font-normal leading-normal"
              >
                <option value="">-- Selecciona un doctor --</option>
                {(() => {
                  console.log("Antes del filter:", filteredDoctors);
                  const afterFilter = filteredDoctors.filter((doctor) => {
                    console.log(
                      "Filtrando doctor:",
                      doctor,
                      "tiene id?",
                      doctor?.id_doctor
                    );
                    return doctor && doctor.id_doctor;
                  });
                  console.log("Después del filter:", afterFilter);
                  return afterFilter.map((doctor) => {
                    console.log(
                      "Renderizando option:",
                      doctor.id_doctor,
                      doctor.full_name
                    );
                    return (
                      <option
                        key={doctor.id_doctor}
                        value={doctor.id_doctor.toString()}
                      >
                        {doctor.full_name}
                      </option>
                    );
                  });
                })()}
                {filteredDoctors.length === 0 && selectedSpecialtyId && (
                  <option value="" disabled>
                    No hay doctores para esta especialidad
                  </option>
                )}
              </select>
            )}
            {errors.doctorId && (
              <span className="text-xs text-red-600 mt-1">
                {errors.doctorId.message}
              </span>
            )}
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
              disabled={isSubmitting}
            />
            <Button
              textButton={isSubmitting ? "Agendando..." : "Agendar Cita"}
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
