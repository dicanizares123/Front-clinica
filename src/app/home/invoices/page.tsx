"use client";

import useSWR from "swr";
import { fetcher } from "../../../app/fetcher";
import HomeLayout from "../../components/layout/HomeLayout";
import Header from "../../components/layout/Header";
import InvoiceForm from "../../components/invoices/InvoiceForm";

export default function InvoicesPage() {
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
      <Header
        title="Facturación Electrónica"
        subtitle="Generar nueva factura (Ecuador)"
      />
      
      <div className="bg-white rounded-lg shadow p-6">
        <InvoiceForm />
      </div>
    </HomeLayout>
  );
}
