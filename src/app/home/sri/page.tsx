import HomeLayout from "@/app/components/layout/HomeLayout";

export default function SriPage() {
  return (
    <HomeLayout>
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
        <div className="bg-surface-dark p-6 rounded-xl shadow-lg border border-[#323a46]">
          <p>hola</p>
        </div>
      </div>
    </HomeLayout>
  );
}
