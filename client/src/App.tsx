import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Guards from "@/pages/guards";
import CreateGuard from "@/pages/guards/create";
import Incidents from "@/pages/incidents";
import CreateIncident from "@/pages/incidents/create";
import Clients from "@/pages/clients";
import CreateClient from "@/pages/clients/create";
import Schedules from "@/pages/schedules";
import CreateSchedule from "@/pages/schedules/create";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/guards" component={Guards} />
      <Route path="/guards/create" component={CreateGuard} />
      <Route path="/incidents" component={Incidents} />
      <Route path="/incidents/create" component={CreateIncident} />
      <Route path="/clients" component={Clients} />
      <Route path="/clients/create" component={CreateClient} />
      <Route path="/schedules" component={Schedules} />
      <Route path="/schedules/create" component={CreateSchedule} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
