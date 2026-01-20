"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

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

interface PatientsTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onView: (patient: Patient) => void;
  isAdmin?: boolean;
}

const columnHelper = createColumnHelper<Patient>();

export default function PatientsTable({
  patients,
  onEdit,
  onDelete,
  onView,
  isAdmin = false,
}: PatientsTableProps) {
  const columns = [
    columnHelper.accessor("document_id", {
      header: "Cédula",
      cell: (info) => (
        <span className="font-mono text-sm text-text-light dark:text-text-dark">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor((row) => `${row.first_names} ${row.last_names}`, {
      id: "fullName",
      header: "Nombre Completo",
      cell: (info) => (
        <span className="font-medium text-text-light dark:text-text-dark">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => (
        <span className="text-text-secondary-light dark:text-text-secondary-dark">
          {info.getValue() || "-"}
        </span>
      ),
    }),
    columnHelper.accessor("phone_number", {
      header: "Teléfono",
      cell: (info) => (
        <span className="text-text-secondary-light dark:text-text-secondary-dark">
          {info.getValue() || "-"}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(row.original)}
            className="p-1.5 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <span className="material-symbols-outlined text-xl">
              visibility
            </span>
          </button>
          <button
            onClick={() => onEdit(row.original)}
            className="p-1.5 text-text-secondary-light dark:text-text-secondary-dark hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
            title="Editar"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => onDelete(row.original)}
              className="p-1.5 text-text-secondary-light dark:text-text-secondary-dark hover:text-error hover:bg-error/10 rounded-lg transition-colors"
              title="Eliminar"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          )}
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: patients,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-secondary-light dark:text-text-secondary-dark">
        <span className="material-symbols-outlined text-6xl mb-4">
          person_off
        </span>
        <p className="text-lg">No se encontraron pacientes</p>
        <p className="text-sm">Intenta con otros términos de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-surface-dark">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider border border-[#323a46]"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-surface-dark/50 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap border border-[#323a46]"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
