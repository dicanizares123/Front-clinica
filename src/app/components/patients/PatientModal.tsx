"use client";

import { useState, useEffect } from "react";
import { apiPost, apiPatch } from "@/app/fetcher";

interface Patient {
  id?: number;
  first_names: string;
  last_names: string;
  document_id: string;
  email: string;
  phone_number: string;
  address: string;
  date_of_birth?: string;
}

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient?: Patient | null;
  mode: "create" | "edit";
  isAdmin?: boolean;
}

const initialFormData: Patient = {
  first_names: "",
  last_names: "",
  document_id: "",
  email: "",
  phone_number: "",
  address: "",
  date_of_birth: "",
};

export default function PatientModal({
  isOpen,
  onClose,
  onSuccess,
  patient,
  mode,
  isAdmin = false,
}: PatientModalProps) {
  const [formData, setFormData] = useState<Patient>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && patient) {
        setFormData({
          ...patient,
          date_of_birth: patient.date_of_birth || "",
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, mode, patient]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_names.trim()) {
      newErrors.first_names = "Los nombres son requeridos";
    }
    if (!formData.last_names.trim()) {
      newErrors.last_names = "Los apellidos son requeridos";
    }
    if (!formData.document_id.trim()) {
      newErrors.document_id = "La cédula es requerida";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === "create") {
        await apiPost("/api/patients/", formData);
      } else if (patient?.id) {
        await apiPatch(`/api/patients/${patient.id}/`, formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving patient:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "Nuevo Paciente" : "Editar Paciente"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Document ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula *
            </label>
            <input
              type="text"
              name="document_id"
              value={formData.document_id}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                errors.document_id ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Ej: 1234567890"
            />
            {errors.document_id && (
              <p className="text-red-500 text-sm mt-1">{errors.document_id}</p>
            )}
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombres *
              </label>
              <input
                type="text"
                name="first_names"
                value={formData.first_names}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                  errors.first_names ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nombres"
              />
              {errors.first_names && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.first_names}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                name="last_names"
                value={formData.last_names}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                  errors.last_names ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Apellidos"
              />
              {errors.last_names && (
                <p className="text-red-500 text-sm mt-1">{errors.last_names}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="Ej: 0991234567"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div> */}

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
              placeholder="Dirección del paciente"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Guardando...
                </>
              ) : mode === "create" ? (
                "Crear Paciente"
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
