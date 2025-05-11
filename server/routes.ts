import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateJWT, authorizeRole, authenticate } from "./auth";
import { loginSchema, insertUserSchema, insertGuardSchema, insertClientSchema, 
         insertLocationSchema, insertShiftSchema, insertScheduleSchema,
         insertIncidentSchema, insertIncidentPhotoSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Set up multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist for serving uploaded files
  app.use("/uploads", express.static(uploadDir));

  // API Routes
  // ===============================
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      // Validate input
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid login data", errors: validation.error.errors });
      }
      
      const { username, password } = req.body;
      
      // Authenticate user
      const authResult = await authenticate(username, password);
      
      if (!authResult) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Get user role
      const role = authResult.user.roleId ? await storage.getRoleById(authResult.user.roleId) : null;
      
      // Return user data with token
      return res.json({
        user: {
          id: authResult.user.id,
          username: authResult.user.username,
          firstName: authResult.user.firstName,
          lastName: authResult.user.lastName,
          role: role ? role.name : null,
        },
        token: authResult.token,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/user", authenticateJWT, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user role
      const role = user.roleId ? await storage.getRoleById(user.roleId) : null;
      
      return res.json({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: role ? role.name : null,
      });
    } catch (error) {
      console.error("User fetch error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // User routes
  app.get("/api/users", authenticateJWT, 
    authorizeRole(["admin", "chief_of_staff"]), 
    async (req, res) => {
      try {
        const users = await storage.getUsers();
        return res.json(users.map(user => ({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roleId: user.roleId,
          active: user.active,
        })));
      } catch (error) {
        console.error("Users fetch error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );
  
  app.post("/api/users", authenticateJWT, 
    authorizeRole(["admin"]), 
    async (req, res) => {
      try {
        // Validate input
        const validation = insertUserSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ message: "Invalid user data", errors: validation.error.errors });
        }
        
        const newUser = await storage.createUser(req.body);
        return res.status(201).json({
          id: newUser.id,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          roleId: newUser.roleId,
        });
      } catch (error) {
        console.error("User creation error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );
  
  // Guard routes
  app.get("/api/guards", authenticateJWT, async (req, res) => {
    try {
      const guards = await storage.getGuards();
      const result = [];
      
      for (const guard of guards) {
        const user = await storage.getUser(guard.userId);
        result.push({
          ...guard,
          user: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          } : null,
        });
      }
      
      return res.json(result);
    } catch (error) {
      console.error("Guards fetch error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/guards", authenticateJWT, 
    authorizeRole(["admin", "chief_of_staff"]), 
    async (req, res) => {
      try {
        // Validate input
        const validation = insertGuardSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ message: "Invalid guard data", errors: validation.error.errors });
        }
        
        const newGuard = await storage.createGuard(req.body);
        return res.status(201).json(newGuard);
      } catch (error) {
        console.error("Guard creation error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );
  
  app.get("/api/guards/:id", authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid guard ID" });
      }
      
      const guard = await storage.getGuard(id);
      if (!guard) {
        return res.status(404).json({ message: "Guard not found" });
      }
      
      const user = await storage.getUser(guard.userId);
      
      return res.json({
        ...guard,
        user: user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        } : null,
      });
    } catch (error) {
      console.error("Guard fetch error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Client routes
  app.get("/api/clients", authenticateJWT, async (req, res) => {
    try {
      const clients = await storage.getClients();
      return res.json(clients);
    } catch (error) {
      console.error("Clients fetch error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/clients", authenticateJWT, 
    authorizeRole(["admin", "chief_of_staff"]), 
    async (req, res) => {
      try {
        // Validate input
        const validation = insertClientSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ message: "Invalid client data", errors: validation.error.errors });
        }
        
        const newClient = await storage.createClient(req.body);
        return res.status(201).json(newClient);
      } catch (error) {
        console.error("Client creation error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );
  
  app.get("/api/clients/:id", authenticateJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Get client locations
      const locations = await storage.getLocationsByClient(client.id);
      
      return res.json({
        ...client,
        locations,
      });
    } catch (error) {
      console.error("Client fetch error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Location routes
  app.get("/api/locations", authenticateJWT, async (req, res) => {
    try {
      const locations = await storage.getLocations();
      return res.json(locations);
    } catch (error) {
      console.error("Locations fetch error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/locations", authenticateJWT, 
    authorizeRole(["admin", "chief_of_staff"]), 
    async (req, res) => {
      try {
        // Validate input
        const validation = insertLocationSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ message: "Invalid location data", errors: validation.error.errors });
        }
        
        const newLocation = await storage.createLocation(req.body);
        return res.status(201).json(newLocation);
      } catch (error) {
        console.error("Location creation error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );
  
  // Shift routes
  app.get("/api/shifts", authenticateJWT, async (req, res) => {
    try {
      const shifts = await storage.getShifts();
      return res.json(shifts);
    } catch (error) {
      console.error("Shifts fetch error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/shifts", authenticateJWT, 
    authorizeRole(["admin", "chief_of_staff"]), 
    async (req, res) => {
      try {
        // Validate input
        const validation = insertShiftSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ message: "Invalid shift data", errors: validation.error.errors });
        }
        
        const newShift = await storage.createShift(req.body);
        return res.status(201).json(newShift);
      } catch (error) {
        console.error("Shift creation error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );
  
  // Schedule routes
  app.get("/api/schedules", authenticateJWT, async (req, res) => {
    try {
      let schedules = [];
      
      if (req.query.date) {
        // Get schedules for specific date
        const date = new Date(req.query.date as string);
        schedules = await storage.getSchedulesByDate(date);
      } else if (req.query.startDate && req.query.endDate) {
        // Get schedules for date range
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);
        schedules = await storage.getSchedulesByDateRange(startDate, endDate);
      } else if (req.query.guardId) {
        // Get schedules for specific guard
        const guardId = parseInt(req.query.guardId as string);
        schedules = await storage.getSchedulesByGuard(guardId);
      } else {
        // Return error for missing parameters
        return res.status(400).json({ message: "Missing query parameters. Provide date, date range, or guardId" });
      }
      
      // Enrich schedules with related data
      const result = [];
      
      for (const schedule of schedules) {
        const guard = schedule.guardId ? await storage.getGuard(schedule.guardId) : null;
        const location = schedule.locationId ? await storage.getLocation(schedule.locationId) : null;
        const shift = schedule.shiftId ? await storage.getShift(schedule.shiftId) : null;
        
        result.push({
          ...schedule,
          guard: guard ? {
            id: guard.id,
            guardId: guard.guardId,
            position: guard.position,
          } : null,
          location: location ? {
            id: location.id,
            name: location.name,
            address: location.address,
          } : null,
          shift: shift ? {
            id: shift.id,
            name: shift.name,
            startTime: shift.startTime,
            endTime: shift.endTime,
          } : null,
        });
      }
      
      return res.json(result);
    } catch (error) {
      console.error("Schedules fetch error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/schedules", authenticateJWT, 
    authorizeRole(["admin", "chief_of_staff", "team_leader"]), 
    async (req, res) => {
      try {
        // Validate input
        const validation = insertScheduleSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ message: "Invalid schedule data", errors: validation.error.errors });
        }
        
        const newSchedule = await storage.createSchedule(req.body);
        return res.status(201).json(newSchedule);
      } catch (error) {
        console.error("Schedule creation error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );
  
  // Incident routes
  app.get("/api/incidents", authenticateJWT, async (req, res) => {
    try {
      let incidents = [];
      
      if (req.query.reportedBy) {
        // Get incidents reported by specific user
        const userId = parseInt(req.query.reportedBy as string);
        incidents = await storage.getIncidentsByReporter(userId);
      } else if (req.query.locationId) {
        // Get incidents for specific location
        const locationId = parseInt(req.query.locationId as string);
        incidents = await storage.getIncidentsByLocation(locationId);
      } else if (req.query.status) {
        // Get incidents with specific status
        incidents = await storage.getIncidentsByStatus(req.query.status as string);
      } else {
        // Get all incidents
        incidents = await storage.getIncidents();
      }
      
      // Enrich incidents with related data
      const result = [];
      
      for (const incident of incidents) {
        const reporter = incident.reportedBy ? await storage.getUser(incident.reportedBy) : null;
        const location = incident.locationId ? await storage.getLocation(incident.locationId) : null;
        const category = incident.categoryId ? await storage.getIncidentCategory(incident.categoryId) : null;
        const photos = await storage.getIncidentPhotosByIncident(incident.id);
        
        result.push({
          ...incident,
          reporter: reporter ? {
            id: reporter.id,
            username: reporter.username,
            firstName: reporter.firstName,
            lastName: reporter.lastName,
          } : null,
          location: location ? {
            id: location.id,
            name: location.name,
            address: location.address,
          } : null,
          category: category ? {
            id: category.id,
            name: category.name,
            priority: category.priority,
          } : null,
          photos: photos.map(photo => ({
            id: photo.id,
            photoUrl: photo.photoUrl,
          })),
        });
      }
      
      return res.json(result);
    } catch (error) {
      console.error("Incidents fetch error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/incidents", authenticateJWT, 
    upload.array("photos", 5), // Allow up to 5 photos
    async (req, res) => {
      try {
        // Add the current user as the reporter
        const incidentData = {
          ...req.body,
          reportedBy: req.user!.id,
          date: req.body.date || new Date().toISOString(),
        };
        
        // Validate input
        const validation = insertIncidentSchema.safeParse(incidentData);
        if (!validation.success) {
          return res.status(400).json({ message: "Invalid incident data", errors: validation.error.errors });
        }
        
        // Create incident
        const newIncident = await storage.createIncident(incidentData);
        
        // Handle uploaded photos
        const files = req.files as Express.Multer.File[];
        
        if (files && files.length > 0) {
          for (const file of files) {
            const photoUrl = `/uploads/${file.filename}`;
            
            await storage.createIncidentPhoto({
              incidentId: newIncident.id,
              photoUrl,
            });
          }
        }
        
        // Fetch photos to include in response
        const photos = await storage.getIncidentPhotosByIncident(newIncident.id);
        
        return res.status(201).json({
          ...newIncident,
          photos: photos.map(photo => ({
            id: photo.id,
            photoUrl: photo.photoUrl,
          })),
        });
      } catch (error) {
        console.error("Incident creation error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );
  
  // Dashboard routes
  app.get("/api/dashboard/stats", authenticateJWT, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      return res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/dashboard/activities", authenticateJWT, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const activities = await storage.getRecentActivities(limit);
      return res.json(activities);
    } catch (error) {
      console.error("Recent activities error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/dashboard/performance", authenticateJWT, async (req, res) => {
    try {
      const performance = await storage.getStaffPerformance();
      return res.json(performance);
    } catch (error) {
      console.error("Staff performance error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/dashboard/shifts", authenticateJWT, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const shifts = await storage.getUpcomingShifts(limit);
      return res.json(shifts);
    } catch (error) {
      console.error("Upcoming shifts error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/dashboard/map", authenticateJWT, async (req, res) => {
    try {
      const guardLocations = await storage.getGuardLocations();
      return res.json(guardLocations);
    } catch (error) {
      console.error("Guard locations error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import express from "express";
