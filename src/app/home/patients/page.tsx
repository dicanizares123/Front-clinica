"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import HomeLayout from "@/app/components/layout/HomeLayout";
import DataTable, { Column } from "@/app/components/shared/DataTable";
import AddPatientModal from "@/app/components/home/stats/AddPatientModal";
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

  // Definir columnas de la tabla
  const columns: Column<Patient>[] = [
    {
      key: "document_id",
      header: "Cédula",
      width: "150px",
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "full_name",
      header: "Nombre Completo",
      render: (_, row) => (
        <span className="font-medium">
          {row.first_names} {row.last_names}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (value) => value || "-",
    },
    {
      key: "phone_number",
      header: "Teléfono",
      render: (value) => value || "-",
    },
    {
      key: "actions",
      header: "Acciones",
      align: "center",
      width: "150px",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-text-secondary-light hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
            title="Editar"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => handleDelete(row)}
              className="p-1.5 text-text-secondary-light hover:text-error hover:bg-error/10 rounded-lg transition-colors"
              title="Eliminar"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <HomeLayout user={user}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-text-light dark:text-text-dark text-2xl font-bold leading-tight">
              Gestión de Pacientes
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Administra la información de los pacientes
            </p>
          </div>
        </div>

        {/* Tabla de pacientes */}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Cargando pacientes...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="material-symbols-outlined text-5xl text-error">
                error
              </span>
              <p className="text-error">Error al cargar los pacientes</p>
              <button
                onClick={() => mutate()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={patients}
              keyExtractor={(row) => row.id.toString()}
              emptyMessage="No hay pacientes registrados"
              hoverable
            />

            {/* Paginación */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Mostrando {patients.length > 0 ? (page - 1) * pageSize + 1 : 0}{" "}
                - {Math.min(page * pageSize, totalCount)} de {totalCount}{" "}
                pacientes
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-[#323a46] rounded-lg hover:bg-surface-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-secondary-light dark:text-text-secondary-dark"
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
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          page === pageNum
                            ? "bg-primary text-white"
                            : "hover:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark"
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
                  className="px-3 py-1 border border-[#323a46] rounded-lg hover:bg-surface-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-secondary-light dark:text-text-secondary-dark"
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

      {/* Modal editar paciente */}
      <AddPatientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPatient(null);
        }}
        onSuccess={handleSuccess}
        patient={selectedPatient}
        mode="edit"
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
