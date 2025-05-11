import { defineConfig } from "drizzle-kit";

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL, ensure the database is provisioned");
// }

const DATABASE_URL = "postgresql://neondb_owner:npg_uHy6eT8sdBMm@ep-bitter-glitter-a4fdzauv-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
