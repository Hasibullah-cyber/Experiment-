import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();

// Set up routes
registerRoutes(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle the request with the Express app
  app(req as any, res as any);
}