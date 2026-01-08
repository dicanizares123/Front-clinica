"use client";

import { useState } from "react";

interface AppointmentEvent {
  id: string;
  numericId?: number; // ID numérico para los endpoints
  title: string;
  start: Date;
  end: Date;
  patient?: string;
  doctor?: string;
  status?: string;
  notes?: string;
}

interface User {
  role?: string;
  permissions?: {
    is_admin?: boolean;
  };
}

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment: AppointmentEvent | null;
  user?: User;
}

const statusOptions = [
  { value: "scheduled", label: "Programada", color: "bg-amber-500" },
  { value: "confirmed", label: "Confirmada", color: "bg-green-500" },
  { value: "completed", label: "Completada", color: "bg-gray-500" },
  { value: "cancelled", label: "Cancelada", color: "bg-red-500" },
];

export default function AppointmentDetailModal({
  isOpen,
  onClose,
  onSuccess,
  appointment,
  user,
}: AppointmentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: "",
    start: "",
    end: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Verificar si es admin
  const isAdmin = user?.permissions?.is_admin || user?.role === "Admin";

  // Inicializar datos de edición cuando se abre el modal
  const startEditing = () => {
    if (!appointment) return;
    setEditData({
      status: appointment.status || "scheduled",
      start: formatDateTimeLocal(appointment.start),
      end: formatDateTimeLocal(appointment.end),
      notes: appointment.notes || "",
    });
    setIsEditing(true);
  };

  // Formatear fecha para input datetime-local
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Obtener token de las cookies
  const getToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];
  };

  // Cambiar estado de la cita
  const handleChangeStatus = async (newStatus: string) => {
    if (!appointment) return;
    setSubmitting(true);
    setError("");

    try {
      const appointmentId = appointment.numericId || appointment.id;
      const response = await fetch(
        `http://localhost:8000/api/appointments/${appointmentId}/change-status/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al cambiar el estado");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSubmitting(false);
    }
  };

  // Guardar cambios completos (PATCH)
  const handleSaveChanges = async () => {
    if (!appointment) return;
    setSubmitting(true);
    setError("");

    try {
      // Convertir fechas al formato esperado por el backend
      const startDate = new Date(editData.start);
      const endDate = new Date(editData.end);

      const appointmentId = appointment.numericId || appointment.id;
      const response = await fetch(
        `http://localhost:8000/api/appointments/${appointmentId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            status: editData.status,
            appointment_date: startDate.toISOString().split("T")[0],
            appointment_time: `${String(startDate.getHours()).padStart(
              2,
              "0"
            )}:${String(startDate.getMinutes()).padStart(2, "0")}:00`,
            notes: editData.notes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al guardar los cambios");
      }

      onSuccess();
      setIsEditing(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar cita (solo admin)
  const handleDelete = async () => {
    if (!appointment || !isAdmin) return;
    setSubmitting(true);
    setError("");

    try {
      const appointmentId = appointment.numericId || appointment.id;
      const response = await fetch(
        `http://localhost:8000/api/appointments/${appointmentId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("No tienes permisos para eliminar citas");
        }
        throw new Error("Error al eliminar la cita");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setSubmitting(false);
      setConfirmDelete(false);
    }
  };

  if (!isOpen || !appointment) return null;

  const currentStatus = statusOptions.find(
    (s) => s.value === appointment.status
  );

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Editar Cita" : "Detalles de la Cita"}
          </h2>
          <button
            onClick={() => {
              setIsEditing(false);
              setConfirmDelete(false);
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          {/* Modo visualización */}
          {!isEditing && !confirmDelete && (
            <div className="space-y-4">
              {/* Estado actual */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-white text-sm ${
                    currentStatus?.color || "bg-gray-500"
                  }`}
                >
                  {currentStatus?.label || appointment.status}
                </span>
              </div>

              {/* Info de la cita */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400">
                    person
                  </span>
                  <div>
                    <p className="text-sm text-gray-500">Paciente</p>
                    <p className="font-medium text-gray-900">
                      {appointment.patient || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400">
                    medical_services
                  </span>
                  <div>
                    <p className="text-sm text-gray-500">Especialidad</p>
                    <p className="font-medium text-gray-900">
                      {appointment.doctor || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400">
                    schedule
                  </span>
                  <div>
                    <p className="text-sm text-gray-500">Fecha y Hora</p>
                    <p className="font-medium text-gray-900">
                      {appointment.start.toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-gray-600">
                      {appointment.start.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {appointment.end.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-gray-400">
                      notes
                    </span>
                    <div>
                      <p className="text-sm text-gray-500">Notas</p>
                      <p className="text-gray-900">{appointment.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={startEditing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    edit
                  </span>
                  Editar
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">
                      delete
                    </span>
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Modo edición */}
          {isEditing && (
            <div className="space-y-4">
              {/* Estado con botones horizontales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() =>
                        setEditData((prev) => ({
                          ...prev,
                          status: status.value,
                        }))
                      }
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        editData.status === status.value
                          ? `${status.color} text-white`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fecha y hora inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora de Inicio
                </label>
                <input
                  type="datetime-local"
                  value={editData.start}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fecha y hora fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora de Fin
                </label>
                <input
                  type="datetime-local"
                  value={editData.end}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={editData.notes}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
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
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {submitting ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          )}

          {/* Confirmación de eliminar */}
          {confirmDelete && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                <span className="material-symbols-outlined text-5xl text-red-500 mb-2">
                  warning
                </span>
                <p className="text-red-800 font-medium">
                  ¿Estás seguro de eliminar esta cita?
                </p>
                <p className="text-red-600 text-sm mt-1">
                  Esta acción no se puede deshacer.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  {submitting ? "Eliminando..." : "Sí, Eliminar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
