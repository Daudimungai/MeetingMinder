import { pgTable, text, serial, integer, boolean, timestamp, real, primaryKey, uniqueIndex, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
);

// User roles
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  roleId: integer("role_id").references(() => roles.id),
  active: boolean("active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guards profile information
export const guards = pgTable("guards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  guardId: text("guard_id").notNull().unique(), // ID number like G-2023-045
  nationalId: text("national_id").unique(),
  dob: timestamp("dob"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  joinDate: timestamp("join_date").defaultNow(),
  position: text("position"), // e.g. Guard, Team Leader
  status: text("status").default("active"), // active, inactive, on-leave
  performance: real("performance").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients that security services are provided to
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  contactPerson: text("contact_person"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  contractStart: timestamp("contract_start"),
  contractEnd: timestamp("contract_end"),
  status: text("status").default("active"), // active, inactive, pending
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client locations that need security
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  name: text("name").notNull(),
  address: text("address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: text("status").default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Security shifts for guards
export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g. "Day Shift", "Night Shift"
  startTime: text("start_time").notNull(), // e.g. "08:00"
  endTime: text("end_time").notNull(), // e.g. "20:00"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schedule assignments
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  guardId: integer("guard_id").references(() => guards.id),
  locationId: integer("location_id").references(() => locations.id),
  shiftId: integer("shift_id").references(() => shifts.id),
  date: timestamp("date").notNull(),
  status: text("status").default("scheduled"), // scheduled, completed, missed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attendance records
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  guardId: integer("guard_id").references(() => guards.id),
  scheduleId: integer("schedule_id").references(() => schedules.id),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  status: text("status"), // on-time, late, absent
  comments: text("comments"),
  locationLatitude: real("location_latitude"),
  locationLongitude: real("location_longitude"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Incident categories
export const incidentCategories = pgTable("incident_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priority: text("priority").default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Security incidents
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  reportedBy: integer("reported_by").references(() => users.id),
  locationId: integer("location_id").references(() => locations.id),
  categoryId: integer("category_id").references(() => incidentCategories.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").default("open"), // open, investigating, resolved, closed
  priority: text("priority").default("medium"), // low, medium, high, critical
  latitude: real("latitude"),
  longitude: real("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Incident photos
export const incidentPhotos = pgTable("incident_photos", {
  id: serial("id").primaryKey(),
  incidentId: integer("incident_id").references(() => incidents.id),
  photoUrl: text("photo_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertRoleSchema = createInsertSchema(roles);
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  roleId: true,
});

export const insertGuardSchema = createInsertSchema(guards).pick({
  userId: true,
  guardId: true,
  nationalId: true,
  dob: true,
  address: true,
  emergencyContact: true,
  position: true,
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  address: true,
  contactPerson: true,
  contactPhone: true,
  contactEmail: true,
  contractStart: true,
  contractEnd: true,
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  clientId: true,
  name: true,
  address: true,
  latitude: true,
  longitude: true,
});

export const insertShiftSchema = createInsertSchema(shifts).pick({
  name: true,
  startTime: true,
  endTime: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).pick({
  guardId: true,
  locationId: true,
  shiftId: true,
  date: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).pick({
  guardId: true,
  scheduleId: true,
  checkInTime: true,
  checkOutTime: true,
  status: true,
  comments: true,
  locationLatitude: true,
  locationLongitude: true,
});

export const insertIncidentCategorySchema = createInsertSchema(incidentCategories).pick({
  name: true,
  description: true,
  priority: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).pick({
  reportedBy: true,
  locationId: true,
  categoryId: true,
  title: true,
  description: true,
  date: true,
  priority: true,
  latitude: true,
  longitude: true,
});

export const insertIncidentPhotoSchema = createInsertSchema(incidentPhotos).pick({
  incidentId: true,
  photoUrl: true,
});

// Types
export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Guard = typeof guards.$inferSelect;
export type InsertGuard = typeof guards.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

export type Shift = typeof shifts.$inferSelect;
export type InsertShift = typeof shifts.$inferInsert;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

export type IncidentCategory = typeof incidentCategories.$inferSelect;
export type InsertIncidentCategory = typeof incidentCategories.$inferInsert;

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

export type IncidentPhoto = typeof incidentPhotos.$inferSelect;
export type InsertIncidentPhoto = typeof incidentPhotos.$inferInsert;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
