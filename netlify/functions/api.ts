import express from 'express';
import { registerRoutes } from '../../server/routes';
import { serveStatic } from '../../server/vite';
import './init-db';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
registerRoutes(app);

// Serve static files in production
serveStatic(app);

// Export the Express app as a serverless function
export const handler = app; 