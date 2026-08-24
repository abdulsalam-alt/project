import type { ReactNode } from "react";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function OrganizerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardSidebar />

      <main className="min-h-screen pt-16 md:ml-[280px] md:pt-0">
        {children}
      </main>
    </div>
  );
}