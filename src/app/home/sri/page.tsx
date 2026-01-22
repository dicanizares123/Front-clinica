"use client";

import HomeLayout from "@/app/components/layout/HomeLayout";
import SriServiceCard from "@/app/components/sri/SriServiceCard";

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
];

export default function SriPage() {
  return (
    <HomeLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-text-light dark:text-text-dark text-2xl font-bold leading-tight">
              Servicio de Rentas Internas Ecuador
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Gracias a la integración con el SRI, puedes validar y usar
              diferentes servicios en un solo lugar.
            </p>
          </div>
        </div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sriServices.map((service) => (
            <SriServiceCard
              key={service.href}
              title={service.title}
              description={service.description}
              imageSrc={service.imageSrc}
              href={service.href}
            />
          ))}
        </div>
      </div>
    </HomeLayout>
  );
}
