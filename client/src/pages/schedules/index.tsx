import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ScheduleCalendar } from "@/components/schedules/schedule-calendar";

export default function Schedules() {
  return (
    <DashboardLayout title="Schedules">
      <ScheduleCalendar />
    </DashboardLayout>
  );
}
