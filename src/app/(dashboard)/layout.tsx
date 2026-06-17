import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Sidebar — desktop only */}
      <Sidebar />

      {/* Main content area wrapped for client-side state */}
      <ClientLayoutWrapper>
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="flex-1 px-4 py-6 pb-24 lg:px-6 lg:pb-6">
          {children}
        </main>
      </ClientLayoutWrapper>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
