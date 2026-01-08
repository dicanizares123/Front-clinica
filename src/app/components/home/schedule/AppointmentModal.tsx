"use client";

import { useState, useEffect } from "react";
import { fetcher } from "@/app/fetcher";
import useSWR from "swr";

interface Patient {
  id: number;
  first_names: string;
  last_names: string;
  identification_number: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: Date;
  selectedTime?: string;
}

export default function AppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
  selectedTime,
}: AppointmentModalProps) {
  const [formData, setFormData] = useState({
    patient: "",
    appointment_date: "",
    appointment_time: "",
    duration_minutes: 60,
    notes: "",
  });
  const [searchCedula, setSearchCedula] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [patientError, setPatientError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Cargar pacientes para búsqueda
  const { data: patients } = useSWR<Patient[]>("/api/patients/", fetcher);

  // Inicializar con fecha y hora seleccionadas
  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        appointment_date: selectedDate.toISOString().split("T")[0],
      }));
    }
    if (selectedTime) {
      setFormData((prev) => ({
        ...prev,
        appointment_time: selectedTime,
      }));
    }
  }, [selectedDate, selectedTime]);

  // Buscar paciente por cédula
  const searchPatient = async () => {
    if (!searchCedula.trim()) return;

    setSearchingPatient(true);
    setPatientError("");
    setSelectedPatient(null);

    try {
      const patient = await fetcher(
        `/api/patients/by_document/${searchCedula}/`
      );
      setSelectedPatient(patient);
      setFormData((prev) => ({ ...prev, patient: patient.id.toString() }));
    } catch {
      setPatientError("Paciente no encontrado");
    } finally {
      setSearchingPatient(false);
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!selectedPatient) {
      setError("Debes seleccionar un paciente");
      setSubmitting(false);
      return;
    }

    try {
      // Formatear hora
      let timeFormatted = formData.appointment_time;
      if (!timeFormatted.includes(":00", 5)) {
        timeFormatted = `${timeFormatted}:00`;
      }

      const response = await fetch(
        "http://localhost:8000/api/appointments/create-authenticated/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("accessToken="))
                ?.split("=")[1]
            }`,
          },
          body: JSON.stringify({
            patient: selectedPatient.id,
            appointment_date: formData.appointment_date,
            appointment_time: timeFormatted,
            duration_minutes: formData.duration_minutes,
            notes: formData.notes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al crear la cita");
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cita");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patient: "",
      appointment_date: "",
      appointment_time: "",
      duration_minutes: 60,
      notes: "",
    });
    setSearchCedula("");
    setSelectedPatient(null);
    setPatientError("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Nueva Cita</h2>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Buscar paciente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Paciente por Cédula
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchCedula}
                onChange={(e) => setSearchCedula(e.target.value)}
                placeholder="Ingrese la cédula"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={searchPatient}
                disabled={searchingPatient}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {searchingPatient ? "..." : "Buscar"}
              </button>
            </div>
            {patientError && (
              <p className="text-red-500 text-sm mt-1">{patientError}</p>
            )}
            {selectedPatient && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✓ {selectedPatient.first_names} {selectedPatient.last_names}
                </p>
                <p className="text-green-600 text-sm">
                  Cédula: {selectedPatient.identification_number}
                </p>
              </div>
            )}
          </div>

          {/* O seleccionar de lista */}
          {patients && patients.length > 0 && !selectedPatient && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                O seleccionar de la lista
              </label>
              <select
                value={formData.patient}
                onChange={(e) => {
                  const patient = patients.find(
                    (p) => p.id.toString() === e.target.value
                  );
                  if (patient) {
                    setSelectedPatient(patient);
                    setFormData((prev) => ({
                      ...prev,
                      patient: e.target.value,
                    }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un paciente...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_names} {patient.last_names} -{" "}
                    {patient.identification_number}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de la Cita
            </label>
            <input
              type="date"
              value={formData.appointment_date}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  appointment_date: e.target.value,
                }))
              }
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora de la Cita
            </label>
            <input
              type="time"
              value={formData.appointment_time}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  appointment_time: e.target.value,
                }))
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración (minutos)
            </label>
            <select
              value={formData.duration_minutes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  duration_minutes: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1 hora 30 minutos</option>
              <option value={120}>2 horas</option>
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              placeholder="Observaciones adicionales..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedPatient}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? "Creando..." : "Crear Cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
