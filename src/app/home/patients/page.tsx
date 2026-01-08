"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import HomeLayout from "@/app/components/layout/HomeLayout";
import PatientsTable from "@/app/components/patients/PatientsTable";
import PatientModal from "@/app/components/patients/PatientModal";
import DeletePatientModal from "@/app/components/patients/DeletePatientModal";

interface Patient {
  id: number;
  first_names: string;
  last_names: string;
  document_id: string;
  email: string;
  phone_number: string;
  address: string;
  created_at?: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Patient[];
}

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const pageSize = 10;

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Obtener datos del usuario
  const { data: userData } = useSWR("/auth/users/me/", fetcher);

  const user = userData
    ? {
        username: userData.username || "Usuario",
        email: userData.email || "",
        role: userData.role_name || "Usuario",
        uuid: userData.uuid || "",
        first_names: userData.first_names || "",
        last_names: userData.last_names || "",
        permissions: userData.role || {},
      }
    : undefined;

  const isAdmin = user?.permissions?.is_admin || user?.role === "Admin";

  // Construir URL con paginación y búsqueda
  const buildUrl = () => {
    let url = `/api/patients/?page=${page}&page_size=${pageSize}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return url;
  };

  // Fetch de pacientes
  const {
    data: patientsData,
    error,
    isLoading,
    mutate,
  } = useSWR<PaginatedResponse>(buildUrl(), fetcher, {
    revalidateOnFocus: false,
  });

  const patients = patientsData?.results || [];
  const totalCount = patientsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditModalOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteModalOpen(true);
  };

  const handleView = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditModalOpen(true); // Usar el mismo modal pero en modo vista
  };

  const handleSuccess = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <HomeLayout user={user}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-text-light dark:text-text-dark text-2xl font-bold leading-tight">
              Gestión de Pacientes
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Administra la información de los pacientes
            </p>
          </div>

          {/* Botón crear paciente */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined">person_add</span>
            Nuevo Paciente
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por nombre, cédula o email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar
              </button>
            )}
          </form>
        </div>

        {/* Tabla de pacientes */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Cargando pacientes...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="material-symbols-outlined text-5xl text-red-500">
                  error
                </span>
                <p className="text-red-600">Error al cargar los pacientes</p>
                <button
                  onClick={() => mutate()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : (
            <>
              <PatientsTable
                patients={patients}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                isAdmin={isAdmin}
              />

              {/* Paginación */}
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600">
                  Mostrando{" "}
                  {patients.length > 0 ? (page - 1) * pageSize + 1 : 0} -{" "}
                  {Math.min(page * pageSize, totalCount)} de {totalCount}{" "}
                  pacientes
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">
                      chevron_left
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 rounded-lg ${
                            page === pageNum
                              ? "bg-blue-600 text-white"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal crear paciente */}
      <PatientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
        mode="create"
      />

      {/* Modal editar paciente */}
      <PatientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPatient(null);
        }}
        onSuccess={handleSuccess}
        patient={selectedPatient}
        mode="edit"
        isAdmin={isAdmin}
      />

      {/* Modal eliminar paciente */}
      <DeletePatientModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPatient(null);
        }}
        onSuccess={handleSuccess}
        patient={selectedPatient}
      />
    </HomeLayout>
  );
}
