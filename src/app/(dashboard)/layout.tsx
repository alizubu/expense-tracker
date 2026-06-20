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
    <div className="flex h-screen w-screen overflow-hidden bg-page">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <ClientLayoutWrapper>
          <Topbar />
          <main className="flex-1 overflow-hidden p-4 xl:p-5">
            {children}
          </main>
        </ClientLayoutWrapper>
      </div>
      <MobileNav />
    </div>
  );
}