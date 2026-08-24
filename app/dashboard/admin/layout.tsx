import type { ReactNode } from "react";

import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <AdminSidebar />

      <main className="min-h-screen pt-16 md:ml-[280px] md:pt-0">
        {children}
      </main>
    </div>
  );
}