import { db } from "./db";
import { roles, users, guards, clients, locations, shifts, incidentCategories } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Starting seed process...");
  
  try {
    // Check if roles exist
    const existingRoles = await db.select().from(roles);
    if (existingRoles.length === 0) {
      console.log("Seeding roles...");
      
      // Insert roles one by one
      await db.insert(roles).values({ id: 1, name: "admin", description: "Administrator with full access" });
      await db.insert(roles).values({ id: 2, name: "chief_of_staff", description: "Chief of Staff with management access" });
      await db.insert(roles).values({ id: 3, name: "team_leader", description: "Team Leader with limited management access" });
      await db.insert(roles).values({ id: 4, name: "guard", description: "Security Guard with basic access" });
      
      console.log("Roles created successfully.");
    } else {
      console.log("Roles already exist, skipping...");
    }

    // Check if admin user exists
    const adminUser = await db.select().from(users).where(eq(users.username, "admin"));
    if (adminUser.length === 0) {
      console.log("Creating admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        email: "admin@geminisecurity.com",
        roleId: 1,
        active: true
      });
      console.log("Admin user created successfully.");
    } else {
      console.log("Admin user already exists, skipping...");
    }

    // Check if incident categories exist
    const existingCategories = await db.select().from(incidentCategories);
    if (existingCategories.length === 0) {
      console.log("Seeding incident categories...");
      
      // Insert categories one by one
      await db.insert(incidentCategories).values({ id: 1, name: "Break-in", description: "Unauthorized entry to premises", priority: "high" });
      await db.insert(incidentCategories).values({ id: 2, name: "Suspicious Activity", description: "Unusual behavior or activity", priority: "medium" });
      await db.insert(incidentCategories).values({ id: 3, name: "Vandalism", description: "Property damage", priority: "medium" });
      await db.insert(incidentCategories).values({ id: 4, name: "Medical Emergency", description: "Health-related emergency", priority: "high" });
      await db.insert(incidentCategories).values({ id: 5, name: "Fire", description: "Fire or smoke", priority: "high" });
      await db.insert(incidentCategories).values({ id: 6, name: "Theft", description: "Stolen property", priority: "medium" });
      await db.insert(incidentCategories).values({ id: 7, name: "Maintenance Issue", description: "Facility maintenance problems", priority: "low" });
      
      console.log("Incident categories created successfully.");
    } else {
      console.log("Incident categories already exist, skipping...");
    }

    // Check if shifts exist
    const existingShifts = await db.select().from(shifts);
    if (existingShifts.length === 0) {
      console.log("Seeding shifts...");
      
      // Insert shifts one by one
      await db.insert(shifts).values({ id: 1, name: "Morning", startTime: "06:00", endTime: "14:00", description: "Morning shift" });
      await db.insert(shifts).values({ id: 2, name: "Afternoon", startTime: "14:00", endTime: "22:00", description: "Afternoon shift" });
      await db.insert(shifts).values({ id: 3, name: "Night", startTime: "22:00", endTime: "06:00", description: "Night shift" });
      await db.insert(shifts).values({ id: 4, name: "Weekend Day", startTime: "08:00", endTime: "20:00", description: "Weekend day shift" });
      await db.insert(shifts).values({ id: 5, name: "Weekend Night", startTime: "20:00", endTime: "08:00", description: "Weekend night shift" });
      
      console.log("Shifts created successfully.");
    } else {
      console.log("Shifts already exist, skipping...");
    }

    // Create a demo client if none exist
    const existingClients = await db.select().from(clients);
    if (existingClients.length === 0) {
      console.log("Creating demo client...");
      await db.insert(clients).values({
        id: 1,
        name: "TechCity Mall",
        contactName: "John Smith",
        contactPhone: "555-123-4567",
        contactEmail: "jsmith@techcity.com",
        address: "123 Tech Blvd, Innovation District",
        contractStartDate: new Date("2023-01-01"),
        contractEndDate: new Date("2025-12-31"),
        active: true
      });
      console.log("Demo client created successfully.");
      
      // Create locations for demo client
      console.log("Creating demo locations...");
      await db.insert(locations).values([
        {
          id: 1,
          clientId: 1,
          name: "Main Entrance",
          address: "123 Tech Blvd, Main Gate",
          coordinates: "37.7749,-122.4194",
          description: "Main entrance to the mall"
        },
        {
          id: 2,
          clientId: 1,
          name: "Parking Garage",
          address: "123 Tech Blvd, Parking Level",
          coordinates: "37.7750,-122.4195",
          description: "Underground parking facility"
        },
        {
          id: 3,
          clientId: 1,
          name: "Food Court",
          address: "123 Tech Blvd, 2nd Floor",
          coordinates: "37.7751,-122.4196",
          description: "Food court area"
        }
      ]);
      console.log("Demo locations created successfully.");
    } else {
      console.log("Clients already exist, skipping...");
    }

    console.log("Seed process completed successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function
seed();