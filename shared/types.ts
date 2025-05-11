import { User, Guard, Client, Schedule, Incident, Location } from "./schema";

// Extended types with additional information
export interface UserWithRole extends User {
  roleName: string;
}

export interface GuardWithUser extends Guard {
  user: User;
}

export interface ScheduleWithDetails extends Schedule {
  guard: Guard;
  location: Location;
  shift: {
    name: string;
    startTime: string;
    endTime: string;
  };
}

export interface ClientWithLocations extends Client {
  locations: Location[];
}

export interface IncidentWithDetails extends Incident {
  reportedByUser: User;
  location: Location;
  category: {
    name: string;
    priority: string;
  };
  photos: { id: number; photoUrl: string }[];
}

export interface DashboardStats {
  totalGuards: number;
  activeClients: number;
  pendingReports: number;
  attendanceRate: number;
}

export interface StaffPerformance {
  id: number;
  guardId: string;
  name: string;
  position: string;
  location: string;
  attendance: number;
  incidents: number;
  performance: number;
  imageUrl?: string;
}

export interface RecentActivity {
  id: number;
  type: "incident" | "shift_completed" | "new_contract" | "guard_assigned";
  title: string;
  description: string;
  time: string | Date;
  timeAgo: string;
}

export interface UpcomingShift {
  id: number;
  location: string;
  shiftName: string;
  time: string;
  date: string;
  guards: {
    id: number;
    name: string;
    imageUrl?: string;
  }[];
}

export type GuardStatus = "on-duty" | "late-check-in" | "incident-reported";

export interface GuardLocation {
  id: number;
  latitude: number;
  longitude: number;
  status: GuardStatus;
  guardName?: string;
}

export type UserRole = "admin" | "chief_of_staff" | "team_leader" | "guard";

export interface AuthUser {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}
