import { db } from "./db";
import { roles, users } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function initializeDatabase() {
  console.log("Starting database initialization...");
  
  try {
    // Create admin role if it doesn't exist
    const existingRoles = await db.select().from(roles).where(eq(roles.name, "admin"));
    
    if (existingRoles.length === 0) {
      console.log("Creating admin role...");
      await db.insert(roles).values({
        name: "admin"
      });
      console.log("Admin role created successfully.");
    } else {
      console.log("Admin role already exists, skipping...");
    }
    
    // Get the admin role ID
    const adminRole = await db.select().from(roles).where(eq(roles.name, "admin"));
    if (adminRole.length === 0) {
      throw new Error("Failed to find admin role");
    }
    const adminRoleId = adminRole[0].id;
    
    // Create admin user if it doesn't exist
    const existingAdmin = await db.select().from(users).where(eq(users.username, "admin"));
    
    if (existingAdmin.length === 0) {
      console.log("Creating admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        email: "admin@geminisecurity.com",
        roleId: adminRoleId,
        active: true
      });
      console.log("Admin user created successfully.");
    } else {
      console.log("Admin user already exists, skipping...");
    }
    
    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Run the initialization
initializeDatabase();