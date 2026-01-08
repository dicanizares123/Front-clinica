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
        <span className="font-mono text-sm">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor((row) => `${row.first_names} ${row.last_names}`, {
      id: "fullName",
      header: "Nombre Completo",
      cell: (info) => (
        <span className="font-medium text-gray-900">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => (
        <span className="text-gray-600">{info.getValue() || "-"}</span>
      ),
    }),
    columnHelper.accessor("phone_number", {
      header: "Teléfono",
      cell: (info) => (
        <span className="text-gray-600">{info.getValue() || "-"}</span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(row.original)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <span className="material-symbols-outlined text-xl">
              visibility
            </span>
          </button>
          <button
            onClick={() => onEdit(row.original)}
            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Editar"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => onDelete(row.original)}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
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
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
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
