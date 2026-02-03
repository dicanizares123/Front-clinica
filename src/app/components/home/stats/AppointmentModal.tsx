"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Button from "../../shared/Button";

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

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentModal({
  isOpen,
  onClose,
}: AppointmentModalProps) {
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
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
    reset,
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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setStep(1);
      setTimeLeft(10 * 60);
    }
  }, [isOpen, reset]);

  // Timer Effect
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isOpen]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Load Initial Data
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  // Filter Doctors
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

  // Fetch Slots
  useEffect(() => {
    if (selectedDoctorId && selectedDateValue) {
      const fetchSlots = async () => {
        setIsLoadingSlots(true);
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
      alert("El tiempo para completar el formulario ha expirado.");
      return;
    }

    setIsSubmitting(true);

    try {
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

      const selectedDoc = doctors.find(
        (d) => d.id_doctor.toString() === data.doctorId,
      );
      if (!selectedDoc) throw new Error("Doctor no encontrado");

      const doctorSpecialistId =
        selectedDoc.doctor_specialist_id || selectedDoc.id_doctor;
      const formattedTime = data.appointmentTime.includes(":00")
        ? data.appointmentTime
        : data.appointmentTime + ":00";

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

      alert(`¡Cita creada con éxito!\nCódigo: ${appointment.uuid}`);
      onClose();
      window.location.reload(); // Refresh to update calendar
    } catch (error: any) {
      alert(error.message || "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
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
                Agendar Nueva Cita
              </h2>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Timer */}
            <div className="flex justify-center mb-6">
              <div className="bg-background-dark px-4 py-2 rounded border border-[#323a46]">
                <span
                  className={`font-mono text-lg font-bold ${
                    timeLeft < 60 ? "text-red-500" : "text-primary"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <p className="text-text-secondary text-sm text-center mb-6">
              {step === 1
                ? "Ingrese sus datos personales para comenzar."
                : "Seleccione los detalles de su cita médica."}
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {step === 1 && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-text-primary text-sm font-medium">
                      Cédula de Identidad *
                    </label>
                    <div className="flex gap-2">
                      <input
                        {...register("cedula", {
                          required: "La cédula es requerida",
                          minLength: {
                            value: 10,
                            message: "Mínimo 10 dígitos",
                          },
                        })}
                        className="form-input flex-1 rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
                        placeholder="Ingrese su cédula"
                        onBlur={handleSearchPatient}
                      />
                      <button
                        type="button"
                        onClick={handleSearchPatient}
                        className="bg-background-dark border border-[#323a46] text-primary h-10 px-3 rounded-md hover:bg-[#323a46] transition-colors"
                        title="Buscar Paciente"
                      >
                        <span className="material-symbols-outlined text-base">
                          search
                        </span>
                      </button>
                    </div>
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
                        {...register("firstName", {
                          required: "Campo requerido",
                        })}
                        className="form-input rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
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
                        {...register("lastName", {
                          required: "Campo requerido",
                        })}
                        className="form-input rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
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
                        {...register("celular", {
                          required: "Campo requerido",
                        })}
                        className="form-input rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
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
                      />
                      {errors.email && (
                        <span className="text-red-500 text-xs">
                          {errors.email.message}
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register("hasPriorAppointment")}
                      className="w-4 h-4 rounded border-gray-600 bg-background-dark text-primary focus:ring-primary"
                    />
                    <span className="text-text-secondary text-sm">
                      ¿Has agendado una cita anteriormente?
                    </span>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      textButton="Siguiente →"
                      onClick={handleNextStep}
                      type="button"
                    />
                  </div>
                </>
              )}

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
                      className="form-select rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
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
                      className="form-select rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
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

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-2">
                      <span className="text-text-primary text-sm font-medium">
                        Fecha *
                      </span>
                      <input
                        type="date"
                        {...register("appointmentDate", {
                          required: "Fecha requerida",
                        })}
                        className="form-input rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
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
                        <div className="h-10 flex items-center px-3 text-text-secondary text-xs">
                          Cargando...
                        </div>
                      ) : (
                        <select
                          {...register("appointmentTime", {
                            required: "Hora requerida",
                          })}
                          className="form-select rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
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
                    </label>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-text-secondary hover:text-text-primary underline text-sm"
                    >
                      ← Volver
                    </button>
                    <button
                      type="submit"
                      disabled={timeLeft <= 0 || isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
    </>
  );
}
