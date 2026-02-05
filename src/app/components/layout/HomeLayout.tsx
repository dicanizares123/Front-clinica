"use client";

import Sidebar from "./Sidebar";

interface HomeLayoutProps {
  children: React.ReactNode;
  user?: {
    username: string;
    email: string;
    role?: string;
    uuid?: string;
    first_names?: string;
    last_names?: string;
    permissions?: any;
  };
}

export default function HomeLayout({ children, user }: HomeLayoutProps) {
  return (
    <div
      className="min-h-screen font-display text-dark"
      style={{ backgroundColor: "#f3f3ff" }}
    >
      <div className="relative flex h-screen w-full flex-row">
        <Sidebar user={user} />
        <main
          className="flex-1 p-6 overflow-y-auto flex flex-col"
          style={{ backgroundColor: "#f3f3ff" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
