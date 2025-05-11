import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSockets for Neon serverless
if (typeof globalThis.WebSocket === "undefined") {
  // @ts-ignore
  globalThis.WebSocket = ws;
}

// Check for DATABASE_URL
console.log("Checking DATABASE_URL...");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("DATABASE_URL value:", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const connectionString = process.env.DATABASE_URL;

// Create a connection pool
export const pool = new Pool({ connectionString });

// Test the connection
pool.query('SELECT NOW()')
  .then(() => console.log('Database connection successful'))
  .catch(err => console.error('Database connection failed:', err));

// Create a drizzle instance
export const db = drizzle({ client: pool, schema });
