"use client";

import React from "react";

export interface Column<T = any> {
  key: string;
  header: string;
  width?: string;
  render?: (value: any, row: T, rowIndex: number) => React.ReactNode;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyMessage?: string;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
}

export default function DataTable<T = any>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No hay datos disponibles",
  className = "",
  striped = false,
  hoverable = true,
}: DataTableProps<T>) {
  const getAlignClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <div
      className={`bg-surface-dark rounded-xl shadow-lg border border-[#323a46] overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-[#1a1f2e] border-b border-[#323a46]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-sm font-semibold text-text-light ${getAlignClass(column.align)}`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-text-secondary-light"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={keyExtractor(row, rowIndex)}
                  className={`
                    border-b border-[#323a46] last:border-b-0
                    ${striped && rowIndex % 2 === 1 ? "bg-[#1a1f2e]/50" : ""}
                    ${hoverable ? "hover:bg-[#252d3d] transition-colors" : ""}
                  `}
                >
                  {columns.map((column) => {
                    const value = (row as any)[column.key];
                    return (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-sm text-text-secondary-light ${getAlignClass(column.align)}`}
                      >
                        {column.render
                          ? column.render(value, row, rowIndex)
                          : (value ?? "-")}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
