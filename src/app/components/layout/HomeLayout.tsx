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
    <div className="bg-background-light font-display">
      <div className="relative flex h-auto min-h-screen w-full flex-row">
        <Sidebar user={user} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
