"use client";

import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    username: string;
    email: string;
    role?: string;
  };
}

export default function DashboardLayout({
  children,
  user,
}: DashboardLayoutProps) {
  return (
    <div className="bg-background-light font-display">
      <div className="relative flex h-auto min-h-screen w-full flex-row">
        <Sidebar user={user} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
