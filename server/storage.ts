import { 
  users, roles, guards, clients, locations, shifts, schedules, 
  attendance, incidentCategories, incidents, incidentPhotos,
  type User, type InsertUser, type Guard, type InsertGuard,
  type Client, type InsertClient, type Location, type InsertLocation,
  type Shift, type InsertShift, type Schedule, type InsertSchedule,
  type Attendance, type InsertAttendance, type IncidentCategory, 
  type InsertIncidentCategory, type Incident, type InsertIncident,
  type IncidentPhoto, type InsertIncidentPhoto, type Role
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, like, desc, sql } from "drizzle-orm";
import { DashboardStats, RecentActivity, StaffPerformance, UpcomingShift, GuardLocation } from "@shared/types";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  validateUserPassword(username: string, password: string): Promise<User | null>;
  
  // Role operations
  getRoles(): Promise<Role[]>;
  getRoleById(id: number): Promise<Role | undefined>;
  
  // Guard operations
  getGuard(id: number): Promise<Guard | undefined>;
  getGuardByUserId(userId: number): Promise<Guard | undefined>;
  createGuard(guard: InsertGuard): Promise<Guard>;
  updateGuard(id: number, guard: Partial<InsertGuard>): Promise<Guard | undefined>;
  getGuards(): Promise<Guard[]>;
  
  // Client operations
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  getClients(): Promise<Client[]>;
  
  // Location operations
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  getLocationsByClient(clientId: number): Promise<Location[]>;
  getLocations(): Promise<Location[]>;
  
  // Shift operations
  getShift(id: number): Promise<Shift | undefined>;
  createShift(shift: InsertShift): Promise<Shift>;
  getShifts(): Promise<Shift[]>;
  
  // Schedule operations
  getSchedule(id: number): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  getSchedulesByGuard(guardId: number): Promise<Schedule[]>;
  getSchedulesByDate(date: Date): Promise<Schedule[]>;
  getSchedulesByDateRange(startDate: Date, endDate: Date): Promise<Schedule[]>;
  
  // Attendance operations
  getAttendance(id: number): Promise<Attendance | undefined>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  getAttendanceByGuard(guardId: number): Promise<Attendance[]>;
  getAttendanceBySchedule(scheduleId: number): Promise<Attendance | undefined>;
  
  // Incident Category operations
  getIncidentCategory(id: number): Promise<IncidentCategory | undefined>;
  createIncidentCategory(category: InsertIncidentCategory): Promise<IncidentCategory>;
  getIncidentCategories(): Promise<IncidentCategory[]>;
  
  // Incident operations
  getIncident(id: number): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: number, incident: Partial<InsertIncident>): Promise<Incident | undefined>;
  getIncidentsByReporter(userId: number): Promise<Incident[]>;
  getIncidentsByLocation(locationId: number): Promise<Incident[]>;
  getIncidentsByStatus(status: string): Promise<Incident[]>;
  getIncidents(): Promise<Incident[]>;
  
  // Incident Photo operations
  getIncidentPhoto(id: number): Promise<IncidentPhoto | undefined>;
  createIncidentPhoto(photo: InsertIncidentPhoto): Promise<IncidentPhoto>;
  getIncidentPhotosByIncident(incidentId: number): Promise<IncidentPhoto[]>;
  
  // Dashboard operations
  getDashboardStats(): Promise<DashboardStats>;
  getRecentActivities(limit?: number): Promise<RecentActivity[]>;
  getStaffPerformance(): Promise<StaffPerformance[]>;
  getUpcomingShifts(limit?: number): Promise<UpcomingShift[]>;
  getGuardLocations(): Promise<GuardLocation[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword
      })
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    // If password is included, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async validateUserPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Role operations
  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async getRoleById(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  // Guard operations
  async getGuard(id: number): Promise<Guard | undefined> {
    const [guard] = await db.select().from(guards).where(eq(guards.id, id));
    return guard;
  }

  async getGuardByUserId(userId: number): Promise<Guard | undefined> {
    const [guard] = await db.select().from(guards).where(eq(guards.userId, userId));
    return guard;
  }

  async createGuard(guardData: InsertGuard): Promise<Guard> {
    const [guard] = await db
      .insert(guards)
      .values(guardData)
      .returning();
    return guard;
  }

  async updateGuard(id: number, guardData: Partial<InsertGuard>): Promise<Guard | undefined> {
    const [guard] = await db
      .update(guards)
      .set({
        ...guardData,
        updatedAt: new Date()
      })
      .where(eq(guards.id, id))
      .returning();
    return guard;
  }

  async getGuards(): Promise<Guard[]> {
    return await db.select().from(guards);
  }

  // Client operations
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(clientData: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(clientData)
      .returning();
    return client;
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set({
        ...clientData,
        updatedAt: new Date()
      })
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  // Location operations
  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }

  async createLocation(locationData: InsertLocation): Promise<Location> {
    const [location] = await db
      .insert(locations)
      .values(locationData)
      .returning();
    return location;
  }

  async updateLocation(id: number, locationData: Partial<InsertLocation>): Promise<Location | undefined> {
    const [location] = await db
      .update(locations)
      .set({
        ...locationData,
        updatedAt: new Date()
      })
      .where(eq(locations.id, id))
      .returning();
    return location;
  }

  async getLocationsByClient(clientId: number): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.clientId, clientId));
  }

  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  // Shift operations
  async getShift(id: number): Promise<Shift | undefined> {
    const [shift] = await db.select().from(shifts).where(eq(shifts.id, id));
    return shift;
  }

  async createShift(shiftData: InsertShift): Promise<Shift> {
    const [shift] = await db
      .insert(shifts)
      .values(shiftData)
      .returning();
    return shift;
  }

  async getShifts(): Promise<Shift[]> {
    return await db.select().from(shifts);
  }

  // Schedule operations
  async getSchedule(id: number): Promise<Schedule | undefined> {
    const [schedule] = await db.select().from(schedules).where(eq(schedules.id, id));
    return schedule;
  }

  async createSchedule(scheduleData: InsertSchedule): Promise<Schedule> {
    const [schedule] = await db
      .insert(schedules)
      .values(scheduleData)
      .returning();
    return schedule;
  }

  async updateSchedule(id: number, scheduleData: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const [schedule] = await db
      .update(schedules)
      .set({
        ...scheduleData,
        updatedAt: new Date()
      })
      .where(eq(schedules.id, id))
      .returning();
    return schedule;
  }

  async getSchedulesByGuard(guardId: number): Promise<Schedule[]> {
    return await db.select().from(schedules).where(eq(schedules.guardId, guardId));
  }

  async getSchedulesByDate(date: Date): Promise<Schedule[]> {
    // Convert date to start of day and end of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db.select().from(schedules)
      .where(and(
        gte(schedules.date, startOfDay),
        lte(schedules.date, endOfDay)
      ));
  }

  async getSchedulesByDateRange(startDate: Date, endDate: Date): Promise<Schedule[]> {
    return await db.select().from(schedules)
      .where(and(
        gte(schedules.date, startDate),
        lte(schedules.date, endDate)
      ));
  }

  // Attendance operations
  async getAttendance(id: number): Promise<Attendance | undefined> {
    const [record] = await db.select().from(attendance).where(eq(attendance.id, id));
    return record;
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [record] = await db
      .insert(attendance)
      .values(attendanceData)
      .returning();
    return record;
  }

  async updateAttendance(id: number, attendanceData: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const [record] = await db
      .update(attendance)
      .set({
        ...attendanceData,
        updatedAt: new Date()
      })
      .where(eq(attendance.id, id))
      .returning();
    return record;
  }

  async getAttendanceByGuard(guardId: number): Promise<Attendance[]> {
    return await db.select().from(attendance).where(eq(attendance.guardId, guardId));
  }

  async getAttendanceBySchedule(scheduleId: number): Promise<Attendance | undefined> {
    const [record] = await db.select().from(attendance).where(eq(attendance.scheduleId, scheduleId));
    return record;
  }

  // Incident Category operations
  async getIncidentCategory(id: number): Promise<IncidentCategory | undefined> {
    const [category] = await db.select().from(incidentCategories).where(eq(incidentCategories.id, id));
    return category;
  }

  async createIncidentCategory(categoryData: InsertIncidentCategory): Promise<IncidentCategory> {
    const [category] = await db
      .insert(incidentCategories)
      .values(categoryData)
      .returning();
    return category;
  }

  async getIncidentCategories(): Promise<IncidentCategory[]> {
    return await db.select().from(incidentCategories);
  }

  // Incident operations
  async getIncident(id: number): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async createIncident(incidentData: InsertIncident): Promise<Incident> {
    const [incident] = await db
      .insert(incidents)
      .values(incidentData)
      .returning();
    return incident;
  }

  async updateIncident(id: number, incidentData: Partial<InsertIncident>): Promise<Incident | undefined> {
    const [incident] = await db
      .update(incidents)
      .set({
        ...incidentData,
        updatedAt: new Date()
      })
      .where(eq(incidents.id, id))
      .returning();
    return incident;
  }

  async getIncidentsByReporter(userId: number): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.reportedBy, userId));
  }

  async getIncidentsByLocation(locationId: number): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.locationId, locationId));
  }

  async getIncidentsByStatus(status: string): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.status, status));
  }

  async getIncidents(): Promise<Incident[]> {
    return await db.select().from(incidents).orderBy(desc(incidents.date));
  }

  // Incident Photo operations
  async getIncidentPhoto(id: number): Promise<IncidentPhoto | undefined> {
    const [photo] = await db.select().from(incidentPhotos).where(eq(incidentPhotos.id, id));
    return photo;
  }

  async createIncidentPhoto(photoData: InsertIncidentPhoto): Promise<IncidentPhoto> {
    const [photo] = await db
      .insert(incidentPhotos)
      .values(photoData)
      .returning();
    return photo;
  }

  async getIncidentPhotosByIncident(incidentId: number): Promise<IncidentPhoto[]> {
    return await db.select().from(incidentPhotos).where(eq(incidentPhotos.incidentId, incidentId));
  }

  // Dashboard operations
  async getDashboardStats(): Promise<DashboardStats> {
    // Get total guards count
    const [guardsResult] = await db.select({ count: sql<number>`count(*)` }).from(guards);
    const totalGuards = guardsResult ? guardsResult.count : 0;
    
    // Get active clients count
    const [clientsResult] = await db.select({ count: sql<number>`count(*)` }).from(clients)
      .where(eq(clients.status, 'active'));
    const activeClients = clientsResult ? clientsResult.count : 0;
    
    // Get pending incident reports count
    const [incidentsResult] = await db.select({ count: sql<number>`count(*)` }).from(incidents)
      .where(eq(incidents.status, 'open'));
    const pendingReports = incidentsResult ? incidentsResult.count : 0;
    
    // Calculate attendance rate (simplified example)
    // In a real scenario, you would calculate this over a specific period
    const [attendanceStats] = await db.select({
      total: sql<number>`count(*)`,
      onTime: sql<number>`sum(case when ${attendance.status} = 'on-time' then 1 else 0 end)`,
    }).from(attendance);
    
    let attendanceRate = 0;
    if (attendanceStats && attendanceStats.total > 0) {
      attendanceRate = (attendanceStats.onTime / attendanceStats.total) * 100;
    }
    
    return {
      totalGuards,
      activeClients,
      pendingReports,
      attendanceRate,
    };
  }

  async getRecentActivities(limit: number = 5): Promise<RecentActivity[]> {
    // This is a simplified mock of a complex query
    // In a real scenario, you would join multiple tables to get this data
    const recentIncidents = await db.select({
      id: incidents.id,
      title: incidents.title,
      description: incidents.description,
      createdAt: incidents.createdAt,
    })
    .from(incidents)
    .orderBy(desc(incidents.createdAt))
    .limit(limit);
    
    return recentIncidents.map(incident => ({
      id: incident.id,
      type: "incident",
      title: "Incident Report",
      description: incident.description,
      time: incident.createdAt.toISOString(),
      timeAgo: "recently",  // In a real app, calculate this based on current time
    }));
  }

  async getStaffPerformance(): Promise<StaffPerformance[]> {
    // This would be a complex query joining guards, users, attendance, and incidents
    // For simplicity, we'll return a limited result
    const guardsData = await db.select({
      id: guards.id,
      guardId: guards.guardId,
      position: guards.position,
      performance: guards.performance,
      userId: guards.userId,
    })
    .from(guards)
    .limit(5);
    
    const result: StaffPerformance[] = [];
    
    for (const guard of guardsData) {
      const user = await this.getUser(guard.userId);
      if (user) {
        // Get attendance stats (simplified)
        const attendanceRecords = await this.getAttendanceByGuard(guard.id);
        const totalAttendance = attendanceRecords.length;
        const onTimeAttendance = attendanceRecords.filter(a => a.status === 'on-time').length;
        const attendancePercentage = totalAttendance > 0 ? (onTimeAttendance / totalAttendance) * 100 : 0;
        
        // Get incident count
        const incidentCount = Math.floor(Math.random() * 5); // Mock data
        
        result.push({
          id: guard.id,
          guardId: guard.guardId,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          position: guard.position || 'Guard',
          location: 'Assigned Location', // This would come from a join with schedules/locations
          attendance: attendancePercentage,
          incidents: incidentCount,
          performance: guard.performance || 0,
        });
      }
    }
    
    return result;
  }

  async getUpcomingShifts(limit: number = 3): Promise<UpcomingShift[]> {
    // Get schedules for the next few days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    const upcomingSchedules = await db.select()
      .from(schedules)
      .where(and(
        gte(schedules.date, startDate),
        lte(schedules.date, endDate)
      ))
      .orderBy(schedules.date)
      .limit(limit);
    
    const result: UpcomingShift[] = [];
    
    for (const schedule of upcomingSchedules) {
      // Get location info
      const location = schedule.locationId ? await this.getLocation(schedule.locationId) : undefined;
      
      // Get shift info
      const shift = schedule.shiftId ? await this.getShift(schedule.shiftId) : undefined;
      
      // Get guard info
      const guard = schedule.guardId ? await this.getGuard(schedule.guardId) : undefined;
      let guardInfo: { id: number; name: string; imageUrl?: string } | undefined;
      
      if (guard) {
        const user = await this.getUser(guard.userId);
        if (user) {
          guardInfo = {
            id: guard.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          };
        }
      }
      
      if (location && shift && guardInfo) {
        result.push({
          id: schedule.id,
          location: location.name,
          shiftName: shift.name,
          time: `${shift.startTime} - ${shift.endTime}`,
          date: schedule.date.toDateString(),
          guards: guardInfo ? [guardInfo] : [],
        });
      }
    }
    
    return result;
  }

  async getGuardLocations(): Promise<GuardLocation[]> {
    // In a real app, this would be based on current guard check-ins
    // For simplicity, we'll return mock data based on locations
    const allLocations = await this.getLocations();
    
    return allLocations.slice(0, 5).map((loc, index) => ({
      id: loc.id,
      latitude: loc.latitude || 0,
      longitude: loc.longitude || 0,
      status: (index % 3 === 0) ? "incident-reported" : 
              (index % 2 === 0) ? "late-check-in" : "on-duty"
    }));
  }
}

export const storage = new DatabaseStorage();
