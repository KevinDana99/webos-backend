import { Request, Response, NextFunction } from 'express';

const BACKEND_TOKEN = process.env.BACKEND_TOKEN as string;

/**
 * Middleware that protects backend-only routes.
 * Any route that needs to be protected should use this before its handlers.
 */
export function verifyBackendToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header('x-backend-token');

  if (!token || token !== BACKEND_TOKEN) {
    console.warn('🚨 Unauthorized backend access attempt', {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
    });
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
  next();
}