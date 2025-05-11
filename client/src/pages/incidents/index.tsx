import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IncidentList } from "@/components/incidents/incident-list";

export default function Incidents() {
  return (
    <DashboardLayout title="Incident Reports">
      <IncidentList />
    </DashboardLayout>
  );
}
