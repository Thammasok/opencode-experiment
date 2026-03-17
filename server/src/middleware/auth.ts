import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PORT, JWT_SECRET } from '../env.js';
import { AuthRequest } from '../types/express.js';

export interface JWTPayload {
  id: string;
  email: string;
  username: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
