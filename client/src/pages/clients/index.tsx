import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ClientList } from "@/components/clients/client-list";

export default function Clients() {
  return (
    <DashboardLayout title="Clients">
      <ClientList />
    </DashboardLayout>
  );
}
