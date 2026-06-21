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
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden w-screen bg-page">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 lg:overflow-hidden">
        <ClientLayoutWrapper>
          <Topbar />
          <main className="flex-1 p-3 sm:p-4 xl:p-5 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-5">
            {children}
          </main>
        </ClientLayoutWrapper>
      </div>
      <MobileNav />
    </div>
  );
}