"use client";

import { useState } from "react";
import Button from "../../shared/Button";

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
  patient_phone?: string;
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
    startDate: "",
    startTime: "",
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
      startDate: formatDateOnly(appointment.start),
      startTime: formatTimeOnly(appointment.start),
      notes: appointment.notes || "",
    });
    setIsEditing(true);
  };

  // Formatear fecha para input date
  const formatDateOnly = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Formatear hora para input time
  const formatTimeOnly = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
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
        },
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
      const startDateTime = `${editData.startDate}T${editData.startTime}:00`;
      const startDate = new Date(startDateTime);

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
            appointment_date: editData.startDate,
            appointment_time: `${editData.startTime}:00`,
            notes: editData.notes,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();

        // Capturar el nuevo formato de error del servidor
        const errorParts = [];

        // Agregar el mensaje principal si existe
        if (errorData.message) {
          errorParts.push(errorData.message);
        }

        // Agregar errores específicos si existen
        if (errorData.errors) {
          if (errorData.errors.non_field_errors) {
            errorParts.push(...errorData.errors.non_field_errors);
          }

          // Errores de campos específicos
          Object.entries(errorData.errors).forEach(([field, errors]) => {
            if (field !== "non_field_errors" && errors) {
              const errorList = Array.isArray(errors) ? errors : [errors];
              errorParts.push(`${field}: ${errorList.join(", ")}`);
            }
          });
        }

        // Formato antiguo para compatibilidad
        if (errorParts.length === 0 && errorData.detail) {
          errorParts.push(errorData.detail);
        }

        const errorMessage =
          errorParts.length > 0
            ? errorParts.join(" ")
            : "Error al guardar los cambios";

        throw new Error(errorMessage);
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
        },
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
    (s) => s.value === appointment.status,
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => {
          setIsEditing(false);
          setConfirmDelete(false);
          onClose();
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-surface-dark rounded-xl shadow-2xl border border-[#323a46] w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-[#323a46]">
            <h2 className="text-xl font-bold text-text-primary">
              {isEditing ? "Editar Cita" : "Detalles de la Cita"}
            </h2>
            <button
              onClick={() => {
                setIsEditing(false);
                setConfirmDelete(false);
                onClose();
              }}
              className="text-text-secondary hover:text-text-primary transition-colors"
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
                    <span className="material-symbols-outlined text-text-secondary">
                      person
                    </span>
                    <div>
                      <p className="text-sm text-text-secondary">Paciente</p>
                      <p className="font-medium text-text-primary">
                        {appointment.patient || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-text-secondary">
                      medical_services
                    </span>
                    <div>
                      <p className="text-sm text-text-secondary">
                        Especialidad
                      </p>
                      <p className="font-medium text-text-primary">
                        {appointment.doctor || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-text-secondary">
                      schedule
                    </span>
                    <div>
                      <p className="text-sm text-text-secondary">
                        Fecha y Hora
                      </p>
                      <p className="font-medium text-text-primary">
                        {appointment.start.toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-text-secondary">
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

                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-text-secondary">
                      phone
                    </span>
                    <div>
                      <p className="text-sm text-text-secondary">
                        Numero de teléfono
                      </p>
                      <p className="font-medium text-text-primary">
                        {appointment.patient_phone || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-text-secondary">
                      notes
                    </span>
                    <div>
                      <p className="text-sm text-text-secondary">Notas</p>
                      <p className="text-text-primary">
                        {appointment.notes ? appointment.notes : "Sin notas"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  <Button
                    textButton="Editar"
                    onClick={startEditing}
                    variant="primary"
                    fullWidth={true}
                  />
                  {isAdmin && (
                    <Button
                      textButton="Eliminar"
                      onClick={() => setConfirmDelete(true)}
                      variant="danger"
                      fullWidth={false}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Modo edición */}
            {isEditing && (
              <div className="space-y-4">
                {/* Estado con botones horizontales */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
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
                            : "bg-surface-dark border border-[#323a46] text-text-secondary hover:bg-[#323a46]"
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fecha y hora inicio */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2">
                    <span className="text-text-primary text-sm font-medium">
                      Fecha *
                    </span>
                    <input
                      type="date"
                      value={editData.startDate}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="form-input rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-text-primary text-sm font-medium">
                      Hora *
                    </span>
                    <select
                      value={editData.startTime}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      className="form-select rounded-md bg-background-dark border border-[#323a46] text-text-primary h-10 px-3 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
                    >
                      {/* ESTO DEBE SER CONSULADO A LA API PERO POR EL MOMENTO ES ESTATICO */}
                      <option value="">Seleccione...</option>
                      <option value="07:00">07:00</option>
                      <option value="08:00">08:00</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                      <option value="18:00">18:00</option>
                      <option value="19:00">19:00</option>
                      <option value="20:00">20:00</option>
                      <option value="21:00">21:00</option>
                      <option value="22:00">22:00</option>
                    </select>
                  </label>
                </div>

                <p className="text-text-secondary text-xs">
                  La duración de la cita es de 60 minutos
                </p>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Notas
                  </label>
                  <textarea
                    value={editData.notes}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-surface-dark border border-[#323a46] rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <Button
                    textButton="Cancelar"
                    onClick={() => setIsEditing(false)}
                    variant="secondary"
                    fullWidth={true}
                  />
                  <Button
                    textButton={submitting ? "Guardando..." : "Guardar Cambios"}
                    onClick={handleSaveChanges}
                    disabled={submitting}
                    variant="primary"
                    fullWidth={true}
                  />
                </div>
              </div>
            )}

            {/* Confirmación de eliminar */}
            {confirmDelete && (
              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                  <span className="material-symbols-outlined text-5xl text-red-500 mb-2">
                    warning
                  </span>
                  <p className="text-red-400 font-medium">
                    ¿Estás seguro de eliminar esta cita?
                  </p>
                  <p className="text-red-400/80 text-sm mt-1">
                    Esta acción no se puede deshacer.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    textButton="Cancelar"
                    onClick={() => setConfirmDelete(false)}
                    variant="secondary"
                    fullWidth={true}
                  />
                  <Button
                    textButton={submitting ? "Eliminando..." : "Sí, Eliminar"}
                    onClick={handleDelete}
                    disabled={submitting}
                    variant="danger"
                    fullWidth={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
