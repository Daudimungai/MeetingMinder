import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { GuardForm } from "@/components/guards/guard-form";

export default function CreateGuard() {
  return (
    <DashboardLayout title="Add New Guard">
      <GuardForm />
    </DashboardLayout>
  );
}
