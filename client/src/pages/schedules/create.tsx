import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ScheduleForm } from "@/components/schedules/schedule-form";

export default function CreateSchedule() {
  return (
    <DashboardLayout title="Create Schedule">
      <ScheduleForm />
    </DashboardLayout>
  );
}
