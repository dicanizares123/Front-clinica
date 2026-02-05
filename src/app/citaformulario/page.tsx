"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

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
        const data = await res.json();
        console.log("Datos del paciente encontrado:", data);

        // Acceder a la estructura correcta de la respuesta
        const patient = data.data || data;

        setValue("firstName", patient.first_names, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        setValue("lastName", patient.last_names, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        setValue("email", patient.email, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        setValue("celular", patient.phone_number, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        setValue("hasPriorAppointment", true);
      } else {
        // Patient not found
        console.log("Paciente no encontrado");
      }
    } catch (error) {
      console.error("Error buscando paciente:", error);
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
          console.log("Paciente encontrado:", existing);
          // Manejar estructura data.data o data
          const patient = existing.data || existing;
          patientId = patient.id;
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
          console.log("Paciente creado:", newPatient);
          // Manejar estructura data.data o data
          const patient = newPatient.data || newPatient;
          patientId = patient.id;
        }
      } catch (e) {
        console.error("Error procesando paciente:", e);
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
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";
      router.push(`/citaformulario/error?message=${encodeURIComponent(msg)}`);
    } finally {
      setIsSubmitting(false);
    }
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
            Agenda tu Cita
            <br />
            Fácil y Rápido
          </h1>

          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 text-gray-300">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Completa tus datos personales</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Selecciona tu especialidad</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Elige fecha y hora disponible</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Confirmación inmediata</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Timer Display */}
        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <span
            className={`font-mono text-xl font-bold ${timeLeft < 60 ? "text-red-500" : "text-[#000000]"}`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex flex-col w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <span className="material-symbols-outlined !text-[60px] text-[#262a37]">
              shield_with_heart
            </span>
          </div>

          <h2 className="text-gray-900 text-3xl font-bold mb-2">
            {step === 1 ? "Datos Personales" : "Detalles de la Cita"}
          </h2>
          <p className="text-gray-600 text-sm mb-8">
            {step === 1
              ? "Ingrese sus datos personales para comenzar."
              : "Seleccione los detalles de su cita médica."}
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* --- STEP 1 --- */}
            {step === 1 && (
              <>
                {/* Cedula (con boton de buscar) */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 text-sm font-medium">
                    Cédula de Identidad *
                  </label>
                  <div className="flex gap-2">
                    <input
                      {...register("cedula", {
                        required: "La cédula es requerida",
                        minLength: { value: 10, message: "Mínimo 10 dígitos" },
                      })}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9098f8] focus:border-transparent placeholder:text-gray-400"
                      placeholder="Ingrese su cédula"
                      onBlur={handleSearchPatient}
                    />
                    <button
                      type="button"
                      onClick={handleSearchPatient}
                      className="bg-[#9098f8] hover:bg-[#7a82e8] text-white h-12 px-4 rounded-lg transition-colors flex items-center justify-center"
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
                    <span className="text-gray-700 text-sm font-medium">
                      Nombres *
                    </span>
                    <input
                      {...register("firstName", {
                        required: "Campo requerido",
                      })}
                      className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9098f8] focus:border-transparent placeholder:text-gray-400"
                      placeholder="Ingrese sus nombres"
                    />
                    {errors.firstName && (
                      <span className="text-red-500 text-xs">
                        {errors.firstName.message}
                      </span>
                    )}
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-gray-700 text-sm font-medium">
                      Apellidos *
                    </span>
                    <input
                      {...register("lastName", { required: "Campo requerido" })}
                      className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9098f8] focus:border-transparent placeholder:text-gray-400"
                      placeholder="Ingrese sus apellidos"
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
                    <span className="text-gray-700 text-sm font-medium">
                      Celular *
                    </span>
                    <input
                      {...register("celular", { required: "Campo requerido" })}
                      className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9098f8] focus:border-transparent placeholder:text-gray-400"
                      placeholder="Ej: 0987654321"
                    />
                    {errors.celular && (
                      <span className="text-red-500 text-xs">
                        {errors.celular.message}
                      </span>
                    )}
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-gray-700 text-sm font-medium">
                      Correo Electrónico *
                    </span>
                    <input
                      type="email"
                      {...register("email", { required: "Campo requerido" })}
                      className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9098f8] focus:border-transparent placeholder:text-gray-400"
                      placeholder="correo@ejemplo.com"
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
                    className="w-5 h-5 rounded border-gray-300 bg-white text-[#9098f8] focus:ring-[#9098f8]"
                  />
                  <span className="text-gray-600 text-sm">
                    ¿Has agendado una cita anteriormente?
                  </span>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-[#9098f8] hover:bg-[#7a82e8] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Siguiente →
                  </button>
                </div>
              </>
            )}

            {/* --- STEP 2 --- */}
            {step === 2 && (
              <>
                <label className="flex flex-col gap-2">
                  <span className="text-gray-700 text-sm font-medium">
                    Especialidad *
                  </span>
                  <select
                    {...register("specialtyId", {
                      required: "Seleccione una especialidad",
                    })}
                    className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9098f8] focus:border-transparent"
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
                  <span className="text-gray-700 text-sm font-medium">
                    Doctor *
                  </span>
                  <select
                    {...register("doctorId", {
                      required: "Seleccione un doctor",
                    })}
                    className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9098f8] focus:border-transparent"
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

                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 text-sm font-medium">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    {...register("appointmentDate", {
                      required: "Fecha requerida",
                    })}
                    min={new Date().toISOString().split("T")[0]}
                    className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9098f8] focus:border-transparent"
                  />
                  {errors.appointmentDate && (
                    <span className="text-red-500 text-xs">
                      {errors.appointmentDate.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 text-sm font-medium">
                    Hora disponible *
                  </label>
                  {isLoadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9098f8]" />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <select
                      {...register("appointmentTime", {
                        required: "Hora requerida",
                      })}
                      className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#9098f8] focus:border-transparent"
                    >
                      <option value="">Seleccione...</option>
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 text-sm">
                      {selectedDateValue && selectedDoctorId
                        ? "No hay horarios disponibles"
                        : "Seleccione doctor y fecha"}
                    </div>
                  )}
                  {errors.appointmentTime && (
                    <span className="text-red-500 text-xs">
                      {errors.appointmentTime.message}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition"
                  >
                    ← Atrás
                  </button>

                  <button
                    type="submit"
                    disabled={timeLeft <= 0 || isSubmitting}
                    className="flex-1 bg-[#9098f8] hover:bg-[#7a82e8] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Agendando..." : "Agendar Cita"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
