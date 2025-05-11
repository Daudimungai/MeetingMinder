import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IncidentForm } from "@/components/incidents/incident-form";

export default function CreateIncident() {
  return (
    <DashboardLayout title="Report Incident">
      <IncidentForm />
    </DashboardLayout>
  );
}
