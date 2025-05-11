import { db } from "./db";
import { roles, users, guards, clients, locations } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function initializeDatabase() {
  console.log("Starting database initialization...");
  
  try {
    // Create roles if they don't exist
    const roleData = [
      { name: "admin" },
      { name: "chief_of_staff" },
      { name: "team_leader" },
      { name: "guard" }
    ];
    
    for (const role of roleData) {
      const existingRole = await db.select().from(roles).where(eq(roles.name, role.name));
      if (existingRole.length === 0) {
        console.log(`Creating ${role.name} role...`);
        await db.insert(roles).values({
          name: role.name
        });
        console.log(`${role.name} role created successfully.`);
      } else {
        console.log(`${role.name} role already exists, skipping...`);
      }
    }
    
    // Get all role IDs
    const allRoles = await db.select().from(roles);
    const roleIds = {
      admin: allRoles.find(r => r.name === "admin")?.id,
      chiefOfStaff: allRoles.find(r => r.name === "chief_of_staff")?.id,
      teamLeader: allRoles.find(r => r.name === "team_leader")?.id,
      guard: allRoles.find(r => r.name === "guard")?.id
    };
    
    // Create users with different roles if they don't exist
    const userData = [
      {
        username: "admin",
        password: "admin123",
        firstName: "Admin",
        lastName: "User",
        email: "admin@geminisecurity.com",
        roleId: roleIds.admin
      },
      {
        username: "chief",
        password: "chief123",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah@geminisecurity.com",
        roleId: roleIds.chiefOfStaff
      },
      {
        username: "teamlead",
        password: "team123",
        firstName: "Michael",
        lastName: "Chen",
        email: "mchen@geminisecurity.com",
        roleId: roleIds.teamLeader
      },
      {
        username: "guard1",
        password: "guard123",
        firstName: "David",
        lastName: "Smith",
        email: "dsmith@geminisecurity.com",
        roleId: roleIds.guard
      }
    ];
    
    for (const user of userData) {
      const existingUser = await db.select().from(users).where(eq(users.username, user.username));
      if (existingUser.length === 0) {
        console.log(`Creating ${user.username} user...`);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        await db.insert(users).values({
          username: user.username,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roleId: user.roleId,
          active: true
        });
        console.log(`${user.username} user created successfully.`);
      } else {
        console.log(`${user.username} user already exists, skipping...`);
      }
    }
    
    // Create a guard profile for the guard user
    const guardUser = await db.select().from(users).where(eq(users.username, "guard1"));
    if (guardUser.length > 0) {
      const existingGuard = await db.select().from(guards).where(eq(guards.userId, guardUser[0].id));
      if (existingGuard.length === 0) {
        console.log("Creating guard profile...");
        // Generate a random guard ID like G-2023-1234
        const randomId = Math.floor(Math.random() * 9000 + 1000);
        const guardIdString = `G-${new Date().getFullYear()}-${randomId}`;
        
        await db.insert(guards).values({
          userId: guardUser[0].id,
          guardId: guardIdString,
          position: "Security Guard",
          status: "active",
          joinDate: new Date(),
          performance: 85
        });
        console.log("Guard profile created successfully.");
      } else {
        console.log("Guard profile already exists, skipping...");
      }
    }
    
    // Create a demo client if it doesn't exist
    const existingClient = await db.select().from(clients);
    if (existingClient.length === 0) {
      console.log("Creating demo client...");
      const client = await db.insert(clients).values({
        name: "TechCity Mall",
        contactPerson: "John Smith",
        contactPhone: "555-123-4567",
        contactEmail: "jsmith@techcity.com",
        address: "123 Tech Blvd, Innovation District",
        contractStart: new Date("2023-01-01"),
        contractEnd: new Date("2025-12-31"),
        status: "active"
      }).returning();
      
      // Create a location for the demo client
      if (client.length > 0) {
        console.log("Creating client location...");
        await db.insert(locations).values({
          clientId: client[0].id,
          name: "Main Entrance",
          address: "123 Tech Blvd, Main Gate",
          latitude: 37.7749,
          longitude: -122.4194,
          status: "active"
        });
        console.log("Client location created successfully.");
      }
      
      console.log("Demo client created successfully.");
    } else {
      console.log("Demo client already exists, skipping...");
    }
    
    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Run the initialization
initializeDatabase();