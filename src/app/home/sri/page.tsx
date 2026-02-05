"use client";

import useSWR from "swr";
import { fetcher } from "@/app/fetcher";
import HomeLayout from "@/app/components/layout/HomeLayout";
import SriServiceCard from "@/app/components/sri/SriServiceCard";

// Servicio de Olimpush
const olimpushService = {
  title: "Olimpush Validar Contribuyente",
  description:
    "Consulta un contribuyente registrado en Olimpush por su RUC y obtén información relevante.",
  imageSrc: "https://developers.olimpush.com/assets/icons/unnamed.jpg",
  href: "/home/sri/validate-contributor",
};

// Servicio de Facturación Electrónica
const invoiceService = {
  title: "Facturación Electrónica",
  description:
    "Genera y envía facturas electrónicas al SRI de manera rápida y sencilla.",
  imageSrc:
    "https://facturasrapidasec.com/wp-content/uploads/2026/01/sri-seeklogo-1024x657.png",
  href: "/home/sri/invoice",
};

// Servicio de Historial de Facturas
const viewInvoicesService = {
  title: "Historial de Facturas",
  description:
    "Consulta y visualiza todas las facturas electrónicas emitidas con filtros y detalles.",
  imageSrc:
    "https://facturasrapidasec.com/wp-content/uploads/2026/01/sri-seeklogo-1024x657.png",
  href: "/home/sri/view-invoices",
};

// Servicios del SRI
const sriServices = [
  {
    title: "Validar RUC",
    description:
      "Verifica si un RUC está registrado y activo en el Servicio de Rentas Internas del Ecuador.",
    imageSrc:
      "https://facturasrapidasec.com/wp-content/uploads/2026/01/sri-seeklogo-1024x657.png",
    href: "/home/sri/validate-ruc",
  },
  {
    title: "Validar Establecimientos",
    description:
      "Consulta los establecimientos registrados de un RUC y verifica su estado actual en el SRI.",
    imageSrc:
      "https://facturasrapidasec.com/wp-content/uploads/2026/01/sri-seeklogo-1024x657.png",
    href: "/home/sri/validate-establishments",
  },
  {
    title: "Detalles del RUC",
    description:
      "Consulta información detallada de un contribuyente por su RUC en el SRI.",
    imageSrc:
      "https://facturasrapidasec.com/wp-content/uploads/2026/01/sri-seeklogo-1024x657.png",
    href: "/home/sri/ruc-details",
  },
];

export default function SriPage() {
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

  return (
    <HomeLayout user={user}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-gray-900 text-2xl font-bold leading-tight">
              Servicio de Rentas Internas Ecuador
            </h1>
            <p className="text-gray-600 text-sm">
              Gracias a la integración con el SRI, puedes validar y usar
              diferentes servicios en un solo lugar.
            </p>
          </div>
        </div>

        {/* Sección Olimpush */}
        <div>
          <h2 className="text-gray-900 text-l font-semibold mb-4">
            OlimpushAPI
          </h2>

          <div className="w-fit">
            <SriServiceCard
              title={olimpushService.title}
              description={olimpushService.description}
              imageSrc={olimpushService.imageSrc}
              href={olimpushService.href}
            />
          </div>
        </div>

        {/* Sección Facturación Electrónica */}
        <div>
          <h2 className="text-gray-900 text-lg font-semibold mb-4">
            Facturación Electrónica
          </h2>
          <div className="flex flex-wrap gap-6">
            <div className="w-fit">
              <SriServiceCard
                title={invoiceService.title}
                description={invoiceService.description}
                imageSrc={invoiceService.imageSrc}
                href={invoiceService.href}
              />
            </div>
            <div className="w-fit">
              <SriServiceCard
                title={viewInvoicesService.title}
                description={viewInvoicesService.description}
                imageSrc={viewInvoicesService.imageSrc}
                href={viewInvoicesService.href}
              />
            </div>
          </div>
        </div>

        {/* Sección Servicios del SRI */}
        <div>
          <h2 className="text-gray-900 text-lg font-semibold mb-4">
            Servicios del SRI
          </h2>
          <div className="flex flex-wrap gap-6">
            {sriServices.map((service) => (
              <div key={service.href} className="w-fit">
                <SriServiceCard
                  title={service.title}
                  description={service.description}
                  imageSrc={service.imageSrc}
                  href={service.href}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
