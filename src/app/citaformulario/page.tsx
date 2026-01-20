"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Button from "../components/shared/Button";

const API_BASE_URL = "http://localhost:8000/api";

type FormData = {
  // Step 1
  cedula: string;
  firstName: string;
  lastName: string;
  celular: string;
  email: string;
  hasPriorAppointment: boolean;
  // Step 2
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
  id_doctor: number;
  full_name: string;
  primary_specialty: number | null;
  primary_specialty_name: string | null;
  professional_id?: string;
  doctor_specialist_id?: number;
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
  doctor_name: string;
  specialty_name: string;
  appointment_date: string;
  appointment_time: string;
};

export default function CitaFormulario() {
  // --- Step & Timer State ---
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds

  // --- Data State ---
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      hasPriorAppointment: false,
    },
  });

  const selectedSpecialtyId = watch("specialtyId");
  const selectedDoctorId = watch("doctorId");
  const selectedDateValue = watch("appointmentDate");
  const cedulaValue = watch("cedula");

  // --- Timer Effect ---
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // --- Load Initial Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specRes, docRes] = await Promise.all([
          fetch(`${API_BASE_URL}/specialties/`),
          fetch(`${API_BASE_URL}/doctors/`),
        ]);

        if (specRes.ok) {
          const specData = await specRes.json();
          setSpecialties(specData.results || specData || []);
        }
        if (docRes.ok) {
          const docData = await docRes.json();
          setDoctors(docData.results || docData || []);
          setFilteredDoctors(docData.results || docData || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
  }, []);

  // --- Filter Doctors ---
  useEffect(() => {
    if (selectedSpecialtyId) {
      const filtered = doctors.filter(
        (d) => d.primary_specialty?.toString() === selectedSpecialtyId,
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [selectedSpecialtyId, doctors]);

  // --- Fetch Slots ---
  useEffect(() => {
    if (selectedDoctorId && selectedDateValue) {
      const fetchSlots = async () => {
        setIsLoadingSlots(true);
        // Find doctor to get correct ID
        const selectedDoc = doctors.find(
          (d) => d.id_doctor.toString() === selectedDoctorId,
        );
        if (!selectedDoc) return;

        try {
          const res = await fetch(
            `${API_BASE_URL}/available-slots/?doctor=${selectedDoc.id_doctor}&date=${selectedDateValue}`,
          );
          if (res.ok) {
            const data = await res.json();
            setAvailableSlots(data.available_slots || []);
          }
        } catch (error) {
          console.error("Error fetching slots:", error);
        } finally {
          setIsLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDoctorId, selectedDateValue, doctors]);

  // --- Handlers ---

  const handleSearchPatient = async () => {
    if (!cedulaValue || cedulaValue.length < 10) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/patients/by_document/${cedulaValue}/`,
      );
      if (res.ok) {
        const patient = (await res.json()) as Patient;
        setValue("firstName", patient.first_names);
        setValue("lastName", patient.last_names);
        setValue("email", patient.email);
        setValue("celular", patient.phone_number);
        setValue("hasPriorAppointment", true);
      } else {
        // Patient not found
        // Only clear if empty to allow manual entry if user wants
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNextStep = async () => {
    const isValid = await trigger([
      "cedula",
      "firstName",
      "lastName",
      "celular",
      "email",
    ]);
    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (timeLeft <= 0) {
      router.push(
        `/citaformulario/error?message=${encodeURIComponent("El tiempo para completar el formulario ha expirado.")}`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Find or Create Patient
      let patientId: number;
      try {
        const searchRes = await fetch(
          `${API_BASE_URL}/patients/by_document/${data.cedula}/`,
        );
        if (searchRes.ok) {
          const existing = await searchRes.json();
          patientId = existing.id;
        } else {
          // Create
          const createRes = await fetch(`${API_BASE_URL}/patients/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              first_names: data.firstName,
              last_names: data.lastName,
              document_id: data.cedula,
              email: data.email,
              phone_number: data.celular,
              address: "Sin dirección",
            }),
          });
          if (!createRes.ok) throw new Error("Error creando paciente");
          const newPatient = await createRes.json();
          patientId = newPatient.id;
        }
      } catch (e) {
        throw new Error("Error procesando datos del paciente");
      }

      // 2. Get Doctor Info
      const selectedDoc = doctors.find(
        (d) => d.id_doctor.toString() === data.doctorId,
      );
      if (!selectedDoc) throw new Error("Doctor no encontrado");

      const doctorSpecialistId =
        selectedDoc.doctor_specialist_id || selectedDoc.id_doctor;
      const formattedTime = data.appointmentTime.includes(":00")
        ? data.appointmentTime
        : data.appointmentTime + ":00";

      // 3. Create Appointment
      const apptRes = await fetch(`${API_BASE_URL}/appointments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: patientId,
          doctor_specialist: doctorSpecialistId,
          appointment_date: data.appointmentDate,
          appointment_time: formattedTime,
          duration_minutes: 60,
          notes: "",
        }),
      });

      if (!apptRes.ok) {
        const errData = await apptRes.json();
        throw new Error(errData.detail || "Error al crear la cita");
      }

      const appointment = (await apptRes.json()) as Appointment;

      const params = new URLSearchParams({
        patient: `${data.firstName} ${data.lastName}`,
        doctor: appointment.doctor_name,
        date: appointment.appointment_date,
        time: appointment.appointment_time.substring(0, 5),
        code: appointment.uuid,
      });

      router.push(`/citaformulario/success?${params.toString()}`);
    } catch (error: any) {
      const msg = error.message || "Ocurrió un error inesperado";
      router.push(`/citaformulario/error?message=${encodeURIComponent(msg)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background-dark py-12 px-4 selection:bg-primary/30">
      <div className="w-full max-w-2xl relative min-h-[600px] flex flex-col justify-center p-4 sm:p-8">
        {/* Timer Display */}
        <div className="absolute top-0 right-0 sm:top-4 sm:right-4 bg-surface-dark px-3 py-1 rounded border border-[#323a46]">
          <span
            className={`font-mono text-xl font-bold ${timeLeft < 60 ? "text-red-500" : "text-primary"}`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Header */}
        <div className="mb-6 flex w-full justify-center mb-8">
          <div className="h-10 w-10 text-primary">
            <span className="material-symbols-outlined !text-[60px]">
              shield_with_heart
            </span>
          </div>
        </div>
        <h1 className="text-text-primary tracking-tight text-3xl font-bold leading-tight text-center pb-4">
          Agendar Nueva Cita
        </h1>
        <p className="text-text-secondary text-base font-normal leading-normal text-center pb-8 max-w-md mx-auto">
          {step === 1
            ? "Ingrese sus datos personales para comenzar."
            : "Seleccione los detalles de su cita médica."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* --- STEP 1 --- */}
          {step === 1 && (
            <>
              {/* Cedula (con boton de buscar) */}
              <div className="flex flex-col gap-2">
                <label className="text-text-primary text-sm font-medium">
                  Cédula de Identidad *
                </label>
                <div className="flex gap-2">
                  <input
                    {...register("cedula", {
                      required: "La cédula es requerida",
                      minLength: { value: 10, message: "Mínimo 10 dígitos" },
                    })}
                    className="form-input flex-1 rounded-md bg-surface-dark border border-[#323a46] text-text-primary h-12 px-4 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    placeholder="Ingrese su cédula"
                    onBlur={handleSearchPatient}
                  />
                  <button
                    type="button"
                    onClick={handleSearchPatient}
                    className="bg-surface-dark border border-[#323a46] text-primary h-12 px-4 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center"
                    title="Buscar Paciente"
                  >
                    <span className="material-symbols-outlined">search</span>
                  </button>
                </div>
                {errors.cedula && (
                  <span className="text-red-500 text-xs">
                    {errors.cedula.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-text-primary text-sm font-medium">
                    Nombres *
                  </span>
                  <input
                    {...register("firstName", { required: "Campo requerido" })}
                    className="form-input rounded-md bg-surface-dark border border-[#323a46] text-text-primary h-12 px-4 focus:ring-2 focus:ring-primary/50 focus:outline-none"
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
                    className="form-input rounded-md bg-surface-dark border border-[#323a46] text-text-primary h-12 px-4 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                  {errors.lastName && (
                    <span className="text-red-500 text-xs">
                      {errors.lastName.message}
                    </span>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-text-primary text-sm font-medium">
                    Celular *
                  </span>
                  <input
                    {...register("celular", { required: "Campo requerido" })}
                    className="form-input rounded-md bg-surface-dark border border-[#323a46] text-text-primary h-12 px-4 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                  {errors.celular && (
                    <span className="text-red-500 text-xs">
                      {errors.celular.message}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-text-primary text-sm font-medium">
                    Correo Electrónico *
                  </span>
                  <input
                    type="email"
                    {...register("email", { required: "Campo requerido" })}
                    className="form-input rounded-md bg-surface-dark border border-[#323a46] text-text-primary h-12 px-4 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                  {errors.email && (
                    <span className="text-red-500 text-xs">
                      {errors.email.message}
                    </span>
                  )}
                </label>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  {...register("hasPriorAppointment")}
                  className="w-5 h-5 rounded border-gray-600 bg-surface-dark text-primary focus:ring-primary"
                />
                <span className="text-text-secondary text-sm">
                  ¿Has agendado una cita anteriormente?
                </span>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  textButton="Siguiente ->"
                  onClick={handleNextStep}
                  type="button"
                  className="w-full sm:w-auto"
                />
              </div>
            </>
          )}

          {/* --- STEP 2 --- */}
          {step === 2 && (
            <>
              <label className="flex flex-col gap-2">
                <span className="text-text-primary text-sm font-medium">
                  Especialidad *
                </span>
                <select
                  {...register("specialtyId", {
                    required: "Seleccione una especialidad",
                  })}
                  className="form-select rounded-md bg-surface-dark border border-[#323a46] text-text-primary h-12 px-4 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                >
                  <option value="">Seleccione...</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.specialtyId && (
                  <span className="text-red-500 text-xs">
                    {errors.specialtyId.message}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-text-primary text-sm font-medium">
                  Doctor *
                </span>
                <select
                  {...register("doctorId", {
                    required: "Seleccione un doctor",
                  })}
                  className="form-select rounded-md bg-surface-dark border border-[#323a46] text-text-primary h-12 px-4 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                >
                  <option value="">Seleccione...</option>
                  {filteredDoctors.map((d) => (
                    <option key={d.id_doctor} value={d.id_doctor}>
                      {d.full_name}
                    </option>
                  ))}
                </select>
                {errors.doctorId && (
                  <span className="text-red-500 text-xs">
                    {errors.doctorId.message}
                  </span>
                )}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-text-primary text-sm font-medium">
                    Fecha *
                  </span>
                  <input
                    type="date"
                    {...register("appointmentDate", {
                      required: "Fecha requerida",
                    })}
                    className="form-input rounded-md bg-surface-dark border border-[#323a46] text-text-primary h-12 px-4 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                  {errors.appointmentDate && (
                    <span className="text-red-500 text-xs">
                      {errors.appointmentDate.message}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-text-primary text-sm font-medium">
                    Hora *
                  </span>
                  {isLoadingSlots ? (
                    <div className="h-12 flex items-center px-4 text-text-secondary text-sm">
                      Cargando horarios...
                    </div>
                  ) : (
                    <select
                      {...register("appointmentTime", {
                        required: "Hora requerida",
                      })}
                      className="form-select rounded-md bg-surface-dark border border-[#323a46] text-text-primary h-12 px-4 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    >
                      <option value="">Seleccione...</option>
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.appointmentTime && (
                    <span className="text-red-500 text-xs">
                      {errors.appointmentTime.message}
                    </span>
                  )}
                  {!isLoadingSlots &&
                    availableSlots.length === 0 &&
                    selectedDateValue && (
                      <span className="text-yellow-600 text-xs">
                        No hay horarios disponibles
                      </span>
                    )}
                </label>
              </div>

              <div className="flex justify-between items-center mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-text-secondary hover:text-text-primary underline text-sm"
                >
                  {"<- Volver"}
                </button>

                <button
                  type="submit"
                  disabled={timeLeft <= 0 || isSubmitting}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {isSubmitting ? "Agendando..." : "Agendar y Finalizar"}
                  </span>
                  {/* Simple Check Icon */}
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
