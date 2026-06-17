import dynamicImport from "next/dynamic";

const DashboardClient = dynamicImport(
  () => import("@/components/dashboard/DashboardClient").then((mod) => mod.DashboardClient),
  { ssr: false }
);

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <DashboardClient />;
}
