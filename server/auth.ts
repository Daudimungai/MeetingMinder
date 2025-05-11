import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import { UserRole } from '@shared/types';

const JWT_SECRET = process.env.JWT_SECRET || 'gemini-security-secret-key';
const TOKEN_EXPIRY = '24h';

// Extended Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        roleId?: number;
      };
    }
  }
}

// Authenticate user and generate JWT token
export async function authenticate(username: string, password: string) {
  console.log('Attempting to authenticate user:', username);
  
  // Validate user credentials
  const user = await storage.validateUserPassword(username, password);
  
  if (!user) {
    console.log('Authentication failed: Invalid credentials');
    return null;
  }
  
  console.log('User authenticated successfully:', user.username);
  
  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user.id,
      username: user.username,
      roleId: user.roleId
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
  
  return { user, token };
}

// JWT authentication middleware
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication token is missing' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      id: number;
      username: string;
      roleId?: number;
    };
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Role-based authorization middleware
export function authorizeRole(allowedRoles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    try {
      // Get user with role
      const user = await storage.getUser(req.user.id);
      if (!user || !user.roleId) {
        return res.status(403).json({ message: 'User has no assigned role' });
      }
      
      // Get user role
      const role = await storage.getRoleById(user.roleId);
      if (!role) {
        return res.status(403).json({ message: 'Role not found' });
      }
      
      // Check if user role is in allowed roles
      if (!allowedRoles.includes(role.name as UserRole)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ message: 'Internal server error during authorization' });
    }
  };
}
