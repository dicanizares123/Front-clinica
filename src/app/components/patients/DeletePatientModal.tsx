"use client";

import { useState } from "react";
import { apiDelete } from "@/app/fetcher";

interface Patient {
  id: number;
  first_names: string;
  last_names: string;
  document_id: string;
  email: string;
  phone_number: string;
  address: string;
  date_of_birth?: string;
  created_at?: string;
}

interface DeletePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient: Patient | null;
}

export default function DeletePatientModal({
  isOpen,
  onClose,
  onSuccess,
  patient,
}: DeletePatientModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !patient) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await apiDelete(`/api/patients/${patient.id}/`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error deleting patient:", err);
      setError("Error al eliminar el paciente. Por favor, intenta de nuevo.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-red-50">
          <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span>
            Eliminar Paciente
          </h2>
          <button
            onClick={onClose}
            disabled={deleting}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-700"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl text-red-600">
                person_remove
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {patient.first_names} {patient.last_names}
              </p>
              <p className="text-sm text-gray-500">{patient.document_id}</p>
            </div>
          </div>

          <p className="text-gray-600 mb-4">
            ¿Estás seguro de que deseas eliminar a este paciente? Esta acción no
            se puede deshacer y se perderán todos los datos asociados.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Eliminando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">
                  delete
                </span>
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
