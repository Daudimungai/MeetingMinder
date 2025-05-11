import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { GuardList } from "@/components/guards/guard-list";

export default function Guards() {
  return (
    <DashboardLayout title="Guards Management">
      <GuardList />
    </DashboardLayout>
  );
}
