import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ClientForm } from "@/components/clients/client-form";

export default function CreateClient() {
  return (
    <DashboardLayout title="Add New Client">
      <ClientForm />
    </DashboardLayout>
  );
}
